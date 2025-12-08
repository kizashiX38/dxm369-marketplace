import { NextRequest, NextResponse } from "next/server";
import { getProductByASIN } from "@/lib/amazonAdapter";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const asin = searchParams.get('asin');

    if (!asin) {
      return NextResponse.json({
        success: false,
        error: 'ASIN parameter required'
      }, { status: 400 });
    }

    console.log('🔍 DXM Test Product Lookup:', { asin });

    const product = await getProductByASIN(asin);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      asin,
      found: !!product,
      data: product,
      meta: {
        source: product?.asin.startsWith('MOCK_') ? 'mock_fallback' : 'amazon_api',
        dxmScore: product?.dxmScore
      }
    });

  } catch (error) {
    console.error('❌ DXM Test Product Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
