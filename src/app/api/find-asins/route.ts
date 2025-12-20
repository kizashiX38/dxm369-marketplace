import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Search Amazon
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const html = await response.text();
    
    // Extract ASINs and product info
    const results = extractSearchResults(html);
    
    return NextResponse.json({ 
      ok: true, 
      data: results 
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to search products' 
    }, { status: 500 });
  }
}

function extractSearchResults(html: string) {
  const results = [];
  
  // Find product containers with ASINs
  const productMatches = html.matchAll(/data-asin="([A-Z0-9]{10})"/g);
  const asins = new Set();
  
  for (const match of productMatches) {
    const asin = match[1];
    if (asin && asin !== '0000000000' && !asins.has(asin)) {
      asins.add(asin);
      
      // Try to extract product info for this ASIN
      const productInfo = extractProductInfo(html, asin);
      if (productInfo) {
        results.push({
          asin,
          url: `https://www.amazon.com/dp/${asin}`,
          ...productInfo
        });
      }
    }
  }
  
  return results.slice(0, 20); // Limit to 20 results
}

function extractProductInfo(html: string, asin: string) {
  try {
    // Find the product section for this ASIN
    const asinRegex = new RegExp(`data-asin="${asin}"[^>]*>([\\s\\S]*?)(?=data-asin="|$)`, 'i');
    const sectionMatch = html.match(asinRegex);
    
    if (!sectionMatch) return null;
    
    const section = sectionMatch[1];
    
    // Extract title
    const titlePatterns = [
      /<h2[^>]*>.*?<span[^>]*>([^<]+)</i,
      /<a[^>]*><span[^>]*>([^<]+)</i,
      /alt="([^"]+)"/i
    ];
    
    let title = '';
    for (const pattern of titlePatterns) {
      const match = section.match(pattern);
      if (match && match[1].length > 10) {
        title = match[1].trim();
        break;
      }
    }
    
    // Extract price
    const pricePatterns = [
      /\$([0-9,]+\.?[0-9]*)/,
      /"priceAmount":([0-9.]+)/
    ];
    
    let price = '';
    for (const pattern of pricePatterns) {
      const match = section.match(pattern);
      if (match) {
        price = match[1].replace(/,/g, '');
        break;
      }
    }
    
    // Extract image
    const imagePatterns = [
      /src="([^"]*images\/I\/[^"]+)"/i,
      /data-src="([^"]*images\/I\/[^"]+)"/i
    ];
    
    let imageUrl = '';
    for (const pattern of imagePatterns) {
      const match = section.match(pattern);
      if (match) {
        imageUrl = match[1].replace(/\._[^.]*_\./, '._AC_SX300_SY300_.');
        break;
      }
    }
    
    if (!title) return null;
    
    return {
      title: title.substring(0, 100), // Limit title length
      price: price || undefined,
      imageUrl: imageUrl || undefined
    };
  } catch (error) {
    return null;
  }
}
