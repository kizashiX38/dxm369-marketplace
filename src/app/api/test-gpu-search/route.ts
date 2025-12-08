import { NextRequest, NextResponse } from "next/server";
import { searchGPUs } from "@/lib/amazonAdapter";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const sortBy = searchParams.get('sortBy') as any || 'Relevance';
    const onlyPrime = searchParams.get('onlyPrime') === 'true';

    console.log('🔍 DXM Test GPU Search:', { maxResults, sortBy, onlyPrime });

    const gpus = await searchGPUs({
      maxResults,
      sortBy,
      onlyPrime
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: gpus.length,
      data: gpus,
      meta: {
        source: gpus.length > 0 && gpus[0].asin.startsWith('MOCK_') ? 'mock_fallback' : 'amazon_api',
        cached: false // TODO: Add cache detection
      }
    });

  } catch (error) {
    console.error('❌ DXM Test GPU Search Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
