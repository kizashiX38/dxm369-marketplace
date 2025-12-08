// src/app/api/admin/fetcher-cache/route.ts
// Manage ASIN fetcher cache: clear, stats, etc

import { NextRequest, NextResponse } from 'next/server';
import { apiSafe, safeJsonParse, safeQueryParse } from '@/lib/apiSafe';
import { clearSeedCache } from '@/lib/services/seedLoader';

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const action = searchParams.get('action') || 'stats';

  if (action === 'stats') {
    return NextResponse.json({
      ok: true,
      data: {
        cacheSize: 0,
        cachedItems: 0,
        hitRate: 0,
      },
    });
  }

  return NextResponse.json(
    { ok: false, error: 'Invalid action. Use ?action=stats' },
    { status: 400 }
  );
});

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ action: 'clear' | 'stats' }>(request);

  if (!body || !body.action) {
    return NextResponse.json(
      { ok: false, error: 'Missing action parameter' },
      { status: 400 }
    );
  }

  const { action } = body;

  if (action === 'clear') {
    // Clear seed cache
    clearSeedCache();

    return NextResponse.json({
      ok: true,
      message: 'Cache cleared successfully',
      data: {
        cacheSize: 0,
        itemsCleared: 0,
      },
    });
  }

  if (action === 'stats') {
    return NextResponse.json({
      ok: true,
      data: {
        cacheSize: 0,
        cachedItems: 0,
        hitRate: 0,
      },
    });
  }

  return NextResponse.json(
    { ok: false, error: 'Invalid action' },
    { status: 400 }
  );
});
