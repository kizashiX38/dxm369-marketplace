import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: 'URLs must be an array' }, { status: 400 });
    }

    const products = [];
    
    for (const url of urls) {
      try {
        // Call our scrape-product API directly
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scrape-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        if (response.ok) {
          const result = await response.json();
          products.push(result.product);
        } else {
          products.push({ url, isValid: false, error: `HTTP ${response.status}` });
        }
      } catch (error) {
        products.push({ 
          url, 
          isValid: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return NextResponse.json({ 
      ok: true, 
      data: products 
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to extract product data' 
    }, { status: 500 });
  }
}
