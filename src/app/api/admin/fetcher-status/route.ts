// src/app/api/admin/fetcher-status/route.ts
// GET fetcher service status and metrics

import { NextResponse } from 'next/server';
import { apiSafe } from '@/lib/apiSafe';
import { getFetcherState } from '@/lib/services/fetcherState';

export const GET = apiSafe(async () => {
  const state = getFetcherState();
  const uptime = Date.now() - state.startTime;
  const successRate = state.totalFetches > 0
    ? Math.round((state.successfulFetches / state.totalFetches) * 100)
    : 0;

  return NextResponse.json({
    ok: true,
    data: {
      status: state.status,
      uptime,
      totalFetches: state.totalFetches,
      successfulFetches: state.successfulFetches,
      failedFetches: state.failedFetches,
      successRate,
      lastFetch: state.lastFetch,
      cacheSize: state.cacheSize,
      memory: state.memory,
    },
  });
});
