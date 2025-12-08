// src/app/api/admin/fetch-asin/route.ts
// Local ASIN fetcher endpoint (replaces Bridge Server)
// GET /api/admin/fetch-asin?asins=B001,B002,B003&category=gpu&debug=true

import { NextRequest, NextResponse } from 'next/server';
import { fetchASINs } from '@/lib/services/asinFetcher';
import { HardwareCategory } from '@/lib/dealRadarTypes';
import { safeQueryParse } from '@/lib/apiSafe';

export const GET = async (request: NextRequest) => {
  try {
    // Parse query params
    const searchParams = safeQueryParse(request);
    const asinsParam = searchParams.get('asins');
    const categoryParam = searchParams.get('category') as HardwareCategory | null;
    const debugParam = searchParams.get('debug') === 'true';

    // Validate
    if (!asinsParam || asinsParam.trim() === '') {
      return NextResponse.json(
        { ok: false, error: 'Missing or empty asins parameter' },
        { status: 400 }
      );
    }

    // Parse ASINs (comma or space separated)
    const asins = asinsParam
      .split(/[\s,]+/)
      .map((a) => a.trim().toUpperCase())
      .filter((a) => a.length > 0);

    if (asins.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No valid ASINs provided' },
        { status: 400 }
      );
    }

    if (debugParam) {
      console.log(`[fetch-asin] Fetching ${asins.length} ASINs:`, asins);
    }

    // Fetch via service
    const result = await fetchASINs({
      asins,
      category: categoryParam || undefined,
      debug: debugParam,
    });

    // Return response
    return NextResponse.json({
      ok: true,
      data: {
        items: result.items,
        sources: result.sources,
        saved: result.items.length,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('[fetch-asin] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
