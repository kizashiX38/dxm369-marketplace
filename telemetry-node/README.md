# DXM Telemetry Node

Cloudflare Worker + Durable Object for real-time telemetry broadcasting.

## Architecture

- **Worker**: Handles HTTP requests and WebSocket upgrades
- **Durable Object (TelemetryHub)**: Manages WebSocket connections and broadcasts events

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/healthz` | GET | Health check |
| `/ws` | GET (Upgrade) | WebSocket connection for live events |
| `/ingest` | POST | Receive telemetry beacon |

## Event Schema

```typescript
interface TelemetryEvent {
  ts: number;        // Unix timestamp (ms)
  path: string;      // Page path
  ref: string;       // Referrer
  uaHash: string;    // User agent hash (DJB2)
  ipHash?: string;   // IP hash (server-side)
  country?: string;  // Country code (from CF)
}
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Configuration

Set `ALLOWED_ORIGIN` in `wrangler.toml` or as a secret:

```bash
wrangler secret put ALLOWED_ORIGIN
```

## Next.js Integration

1. Deploy the Worker:
   ```bash
   npm run deploy
   ```

2. Note the Worker URL (e.g., `https://dxm-telemetry-node.<account>.workers.dev`)

3. Add to Next.js `.env.local`:
   ```
   NEXT_PUBLIC_TELEMETRY_URL=https://dxm-telemetry-node.<account>.workers.dev
   ```

4. The `TelemetryBeacon` component will automatically send pageview events.

5. Open `/dxm-monitor` to see live traffic.

## Security

- No PII stored or transmitted
- User agent and IP are hashed with DJB2 (non-cryptographic)
- CORS restricted to allowed origin
- WebSocket is one-way (broadcast only)
