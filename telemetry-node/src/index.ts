// DXM Telemetry Node - Cloudflare Worker + Durable Object
// Receives telemetry beacons and broadcasts via WebSocket

export interface Env {
  TELEMETRY_HUB: DurableObjectNamespace;
  ALLOWED_ORIGIN: string;
  TELEMETRY_ALERT_WEBHOOK_URL?: string;
  TELEMETRY_PERSIST_MIN?: string;
}

interface TelemetryEvent {
  ts: number;
  path: string;
  ref: string;
  uaHash: string;
  ipHash?: string;
  country?: string;
}

// Simple DJB2 hash for non-cryptographic hashing
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// CORS headers with strict allowlist
function isAllowedOrigin(origin: string | null, allowedOrigin: string): boolean {
  if (!origin) return false;
  if (origin === allowedOrigin) return true;
  if (origin === 'https://www.dxm369.com') return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  return false;
}

function corsHeaders(origin: string | null, allowedOrigin: string): HeadersInit {
  const allowed = isAllowedOrigin(origin, allowedOrigin) ? origin || allowedOrigin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

let probeHealthzFails = 0;
let probeWsFails = 0;

async function postAlert(env: Env, payload: unknown) {
  const url = env.TELEMETRY_ALERT_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // swallow
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Health check
    if (url.pathname === '/healthz') {
      return new Response('OK', {
        status: 200,
        headers: { ...headers, 'Content-Type': 'text/plain' }
      });
    }

    // WebSocket connection
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426, headers });
      }

      const hubId = env.TELEMETRY_HUB.idFromName('hub');
      const hub = env.TELEMETRY_HUB.get(hubId);
      return hub.fetch(request);
    }

    // Ingest endpoint
    if (url.pathname === '/ingest' && request.method === 'POST') {
      // Origin / Referrer check - soft-fail with sampling out
      const originOk = isAllowedOrigin(origin, env.ALLOWED_ORIGIN) ||
        (referer ? isAllowedOrigin(new URL(referer).origin, env.ALLOWED_ORIGIN) : false);

      if (!originOk) {
        return new Response(JSON.stringify({ ok: false, sampled_out: true, reason: 'invalid_origin' }), {
          status: 202,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json() as Partial<TelemetryEvent>;

        // Validate required fields
        if (!body.path || typeof body.path !== 'string') {
          return new Response(JSON.stringify({ error: 'Missing path' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' },
          });
        }

        // Build event with server timestamp and privacy-preserving fields
        const safePath = body.path.slice(0, 200).split('?')[0];
        const rawRef = (body.ref || '').slice(0, 500);
        let safeRef = '';
        try {
          if (rawRef) {
            const refUrl = new URL(rawRef);
            safeRef = refUrl.origin + refUrl.pathname;
          }
        } catch {
          safeRef = rawRef;
        }

        const ip = request.headers.get('CF-Connecting-IP') || '';
        const ua = body.uaHash || '';

        const event: TelemetryEvent = {
          ts: Date.now(),
          path: safePath,
          ref: safeRef,
          uaHash: ua,
          ipHash: ip ? djb2Hash(ip) : undefined,
          country: (request as any).cf?.country || body.country,
        };

        const persistMin = parseInt(env.TELEMETRY_PERSIST_MIN || '0', 10) || 0;

        // Forward to Durable Object for rate limiting + broadcast (+ optional retention)
        const hubId = env.TELEMETRY_HUB.idFromName('hub');
        const hub = env.TELEMETRY_HUB.get(hubId);

        await hub.fetch(new Request('http://internal/ingest', {
          method: 'POST',
          body: JSON.stringify({ ...event, _persistMin: persistMin }),
        }));

        return new Response(JSON.stringify({ ok: true }), {
          status: 202,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // Metrics (minute aggregates) passthrough
    if (url.pathname === '/metrics/minute' && request.method === 'GET') {
      const hubId = env.TELEMETRY_HUB.idFromName('hub');
      const hub = env.TELEMETRY_HUB.get(hubId);
      const res = await hub.fetch('http://internal/metrics');
      const text = await res.text();
      return new Response(text, { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404, headers });
  },

  // Cloudflare Cron probe (every minute)
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const ts = new Date().toISOString();
    try {
      // Probe DO status as healthz surrogate
      const hubId = env.TELEMETRY_HUB.idFromName('hub');
      const hub = env.TELEMETRY_HUB.get(hubId);
      const res = await hub.fetch(new Request('http://internal/status', { method: 'GET' }));
      const ok = res.ok;

      if (!ok) {
        probeHealthzFails += 1;
      } else {
        probeHealthzFails = 0;
      }

      // "WS" readiness proxy: if DO responded OK, treat as WS-capable
      const wsOk = ok;
      if (!wsOk) {
        probeWsFails += 1;
      } else {
        probeWsFails = 0;
      }

      if (probeHealthzFails >= 2) {
        await postAlert(env, { ts, probe: 'healthz', reason: 'do_status_failed_consecutive', failures: probeHealthzFails });
        probeHealthzFails = 0; // reset after alert
      }
      if (probeWsFails >= 2) {
        await postAlert(env, { ts, probe: 'ws_connect', reason: 'ws_proxy_failed_consecutive', failures: probeWsFails });
        probeWsFails = 0; // reset after alert
      }
    } catch (err) {
      probeHealthzFails += 1;
      probeWsFails += 1;
      if (probeHealthzFails >= 2 || probeWsFails >= 2) {
        await postAlert(env, { ts, probe: 'scheduled', reason: 'exception', message: (err as Error)?.message || String(err) });
        probeHealthzFails = 0;
        probeWsFails = 0;
      }
    }
  },
};

// Durable Object: TelemetryHub
export class TelemetryHub {
  private sockets: Set<WebSocket>;
  private state: DurableObjectState;
  private rateLimits: Map<string, { tokens: number; lastRefill: number }>;
  private minuteBuckets: Map<number, { total: number; byPath: Record<string, number>; byCountry: Record<string, number> }>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sockets = new Set();
    this.rateLimits = new Map();
    this.minuteBuckets = new Map();
  }

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sockets = new Set();
    this.rateLimits = new Map();
  }

  private refillTokens(bucket: { tokens: number; lastRefill: number }, now: number) {
    const windowMs = 10_000; // 10 seconds
    const maxTokens = 50; // burst
    const ratePerWindow = 10; // soft limit 10 events/10s

    const elapsed = now - bucket.lastRefill;
    if (elapsed <= 0) return;

    const windows = Math.floor(elapsed / windowMs);
    if (windows > 0) {
      bucket.tokens = Math.min(maxTokens, bucket.tokens + windows * ratePerWindow);
      bucket.lastRefill += windows * windowMs;
    }
  }

  private takeToken(uaHash: string, now: number): boolean {
    if (!uaHash) return true; // If no hash, don't rate limit

    let bucket = this.rateLimits.get(uaHash);
    if (!bucket) {
      bucket = { tokens: 50, lastRefill: now };
      this.rateLimits.set(uaHash, bucket);
      return true;
    }

    this.refillTokens(bucket, now);

    if (bucket.tokens <= 0) {
      return false;
    }

    bucket.tokens -= 1;
    return true;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Status endpoint for probes
    if (url.pathname === '/status' && request.method === 'GET') {
      return new Response(JSON.stringify({ ok: true, sockets: this.sockets.size }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Internal ingest (rate limit + broadcast)
    if (url.pathname === '/ingest' && request.method === 'POST') {
      const body = await request.json() as any;
      const event: TelemetryEvent = body as TelemetryEvent;
      const persistMin: number = typeof body?._persistMin === 'number' ? body._persistMin : 0;
      const now = Date.now();

      const allowed = this.takeToken(event.uaHash, now);
      if (!allowed) {
        return new Response(JSON.stringify({ ok: true, sampled_out: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Optional minute-level aggregation
      if (persistMin > 0) {
        const minuteTs = Math.floor(event.ts / 60000) * 60000;
        const bucket = this.minuteBuckets.get(minuteTs) || { total: 0, byPath: {}, byCountry: {} };
        bucket.total += 1;
        bucket.byPath[event.path] = (bucket.byPath[event.path] || 0) + 1;
        if (event.country) {
          bucket.byCountry[event.country] = (bucket.byCountry[event.country] || 0) + 1;
        }
        this.minuteBuckets.set(minuteTs, bucket);
        // Prune old buckets
        const cutoff = minuteTs - persistMin * 60000;
        for (const ts of Array.from(this.minuteBuckets.keys())) {
          if (ts < cutoff) this.minuteBuckets.delete(ts);
        }
      }

      this.broadcast(event);
      return new Response('OK', { status: 200 });
    }

    // Metrics endpoint: return last N minute buckets
    if (url.pathname === '/metrics' && request.method === 'GET') {
      const entries = Array.from(this.minuteBuckets.entries()).sort((a, b) => a[0] - b[0]);
      const data = entries.map(([ts, v]) => ({ ts, total: v.total, byPath: v.byPath, byCountry: v.byCountry }));
      return new Response(JSON.stringify({ ok: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Internal broadcast endpoint
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const event = await request.json();
      this.broadcast(event);
      return new Response('OK', { status: 200 });
    }

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.state.acceptWebSocket(server);
      this.sockets.add(server);

      server.addEventListener('close', () => {
        this.sockets.delete(server);
      });

      server.addEventListener('error', () => {
        this.sockets.delete(server);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not Found', { status: 404 });
  }

  broadcast(event: unknown): void {
    const message = JSON.stringify(event);
    const toRemove: WebSocket[] = [];

    for (const socket of this.sockets) {
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(message);
        } else if (socket.readyState === WebSocket.CLOSED) {
          toRemove.push(socket);
        }
      } catch {
        toRemove.push(socket);
      }
    }

    // Clean up dead sockets
    for (const socket of toRemove) {
      this.sockets.delete(socket);
    }
  }

  // Handle WebSocket messages from hibernation
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // One-way broadcast only, ignore incoming messages
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    this.sockets.delete(ws);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.sockets.delete(ws);
  }
}
