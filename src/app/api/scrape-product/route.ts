import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        product: { url: 'unknown', isValid: false, error: 'No URL provided' }
      });
    }
    
    // Extract ASIN from URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
    const asin = asinMatch?.[1];

    // Use fetch to get the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        product: { url, isValid: false, error: `HTTP ${response.status}` }
      });
    }

    const html = await response.text();
    
    // Extract data using improved patterns
    const title = extractFromHTML(html, [
      /<span[^>]*id="productTitle"[^>]*>\s*([^<]+?)\s*</i,
      /<title>\s*([^|<]+)/i
    ]);

    const price = extractFromHTML(html, [
      /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([0-9,]+)/i,
      /\$([0-9,]+\.?[0-9]*)/
    ]);

    const brand = extractFromHTML(html, [
      /Visit the ([^<\s]+) Store/i,
      /"brand":\s*"([^"]+)"/i,
      /<tr[^>]*>\s*<td[^>]*>\s*Brand\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i
    ]);

    const rating = extractFromHTML(html, [
      /([0-9]\.[0-9])\s*out\s*of\s*5\s*stars/i
    ]);

    const reviewCount = extractFromHTML(html, [
      /([0-9,]+)\s*customer\s*reviews?/i,
      /([0-9,]+)\s*ratings?/i
    ]);

    const imageUrl = extractFromHTML(html, [
      /"hiRes":"([^"]+)"/,
      /"large":"([^"]+)"/,
      /data-old-hires="([^"]+)"/
    ]);

    const availability = extractFromHTML(html, [
      /<div[^>]*id="availability"[^>]*>.*?<span[^>]*>([^<]+)/i,
      /In Stock/i,
      /Currently unavailable/i
    ]);

    const product = {
      url,
      isValid: true,
      asin,
      title: title?.trim().replace(/\s+/g, ' '),
      price: price?.replace(/,/g, ''),
      rating: rating ? parseFloat(rating) : undefined,
      reviewCount: reviewCount ? parseInt(reviewCount.replace(/,/g, '')) : undefined,
      imageUrl: imageUrl?.replace(/\\u002F/g, '/'),
      brand: brand?.trim(),
      availability: availability?.trim()
    };

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({
      product: { 
        url: 'unknown', 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    });
  }
}

function extractFromHTML(html: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim();
      if (result.length > 0) return result;
    }
  }
  return undefined;
}
