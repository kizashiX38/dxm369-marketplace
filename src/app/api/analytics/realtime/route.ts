// Cloudflare Realtime Analytics API Route (DXM369 standard)
// Proxies CF GraphQL to keep tokens server-side

import { NextRequest, NextResponse } from 'next/server';
import { cfQuery } from '@/lib/cf-analytics';
import { REALTIME_QUERY } from '@/lib/cf-queries';
import { apiSafe, safeQueryParse } from '@/lib/apiSafe';
import log from '@/lib/log';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface CFRealtimeData {
  viewer: {
    zones: Array<{
      httpRequests1mGroups: Array<{
        dimensions: {
          datetimeMinute: string;
          clientCountryName: string;
          edgeResponseStatus: number;
          clientRequestPath: string;
        };
        sum: {
          requests: number;
          cachedRequests: number;
          threats: number;
          bytes: number;
        };
      }>;
    }>;
  };
}

export interface RealtimeResponse {
  ts: string;
  window: number;
  totals: {
    requests: number;
    cached: number;
    threats: number;
    bytes: number;
  };
  topPaths: Array<{ path: string; requests: number }>;
  statusCounts: Record<string, number>;
  byCountry: Record<string, number>;
  raw: Array<{
    t: string;
    country: string;
    status: number;
    path: string;
    requests: number;
  }>;
}

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const windowSeconds = (() => {
    const v = parseInt(searchParams.get('window') || '60', 10);
    if (!Number.isFinite(v) || v <= 0) return 60;
    return Math.min(v, 300); // cap to 5 minutes
  })();
  const limit = (() => {
    const v = parseInt(searchParams.get('limit') || '50', 10);
    if (!Number.isFinite(v) || v <= 0) return 50;
    return Math.min(v, 200);
  })();

  const zoneId = process.env.CF_ZONE_ID;
  if (!zoneId) {
    return NextResponse.json({ ok: false, error: 'CF_ZONE_ID not configured' }, { status: 500 });
  }

  const to = new Date();
  const from = new Date(to.getTime() - windowSeconds * 1000);

  try {
    const data = await cfQuery<CFRealtimeData>(REALTIME_QUERY, {
      zone: zoneId,
      from: from.toISOString(),
      to: to.toISOString(),
      limit,
    });

    const groups = data.viewer?.zones?.[0]?.httpRequests1mGroups || [];

    // Aggregate totals
    const totals = { requests: 0, cached: 0, threats: 0, bytes: 0 };
    const pathMap = new Map<string, number>();
    const statusCounts: Record<string, number> = {};
    const countryMap = new Map<string, number>();
    const raw: RealtimeResponse['raw'] = [];

    for (const group of groups) {
      const { dimensions, sum } = group;

      totals.requests += sum.requests;
      totals.cached += sum.cachedRequests;
      totals.threats += sum.threats;
      totals.bytes += sum.bytes;

      // Path aggregation
      const path = dimensions.clientRequestPath || '/';
      pathMap.set(path, (pathMap.get(path) || 0) + sum.requests);

      // Status aggregation
      const status = String(dimensions.edgeResponseStatus);
      statusCounts[status] = (statusCounts[status] || 0) + sum.requests;

      // Country aggregation
      const country = dimensions.clientCountryName || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + sum.requests);

      raw.push({
        t: dimensions.datetimeMinute,
        country,
        status: dimensions.edgeResponseStatus,
        path,
        requests: sum.requests,
      });
    }

    // Sort and limit top paths
    const topPaths = Array.from(pathMap.entries())
      .map(([path, requests]) => ({ path, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    // Convert country map
    const byCountry: Record<string, number> = {};
    for (const [country, requests] of countryMap.entries()) {
      byCountry[country] = requests;
    }

    const response: RealtimeResponse = {
      ts: to.toISOString(),
      window: windowSeconds,
      totals,
      topPaths,
      statusCounts,
      byCountry,
      raw,
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const message = error.message || 'Unknown error';

    // Handle CF 429-like rate limiting explicitly
    if (/429|rate limit/i.test(message)) {
      log.warn('CF realtime rate limited', { retryIn: 5, message });
      return NextResponse.json(
        { ok: false, error: { code: 'rate_limited', retryIn: 5 } },
        { status: 429 }
      );
    }

    log.error('CF realtime analytics error', error);
    return NextResponse.json(
      { ok: false, error: { code: 'internal_error' } },
      { status: 500 }
    );
  }
});
