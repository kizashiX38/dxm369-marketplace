// src/app/api/admin/fetcher-control/route.ts
// Control fetcher service: start, restart, stop

import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from '@/lib/apiSafe';
import { getFetcherState, updateFetcherState, resetFetcherState } from '@/lib/services/fetcherState';

export const POST = async (request: NextRequest) => {
  try {
    const body = await safeJsonParse<{ action: 'start' | 'restart' | 'stop' }>(request);

    if (!body || !body.action) {
      return NextResponse.json(
        { ok: false, error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    const { action } = body;
    const state = getFetcherState();

    if (action === 'start') {
      if (state.status === 'online') {
        return NextResponse.json({
          ok: false,
          error: 'Fetcher is already running',
        });
      }

      // Simulate starting
      updateFetcherState({
        status: 'online',
        startTime: Date.now(),
      });

      return NextResponse.json({
        ok: true,
        message: 'Fetcher started successfully',
        data: { status: 'online' },
      });
    }

    if (action === 'restart') {
      // Simulate restart
      resetFetcherState();

      return NextResponse.json({
        ok: true,
        message: 'Fetcher restarted successfully',
        data: { status: 'online' },
      });
    }

    if (action === 'stop') {
      if (state.status === 'offline') {
        return NextResponse.json({
          ok: false,
          error: 'Fetcher is already stopped',
        });
      }

      // Simulate stopping
      updateFetcherState({
        status: 'offline',
      });

      return NextResponse.json({
        ok: true,
        message: 'Fetcher stopped successfully',
        data: { status: 'offline' },
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Control operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
