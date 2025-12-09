// src/app/api/shadow/scrape/route.ts
// DXMatrix Shadow Scraper API — Fetch ASINs via Playwright scraper

import { NextRequest, NextResponse } from 'next/server';
import { getScraper, closeScraper, AmazonProductMetadata } from '@/services/shadow-scraper/amazonScraper';

export const maxDuration = 300; // 5 minutes for scraping operations
export const dynamic = 'force-dynamic';

interface ScrapeResponse {
  ok: boolean;
  data?: {
    products: AmazonProductMetadata[];
    scraped: number;
    failed: number;
    errors: string[];
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  // Disable Shadow Scraper on Vercel (Playwright incompatible with serverless)
  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      { ok: false, error: "Shadow Scraper disabled in production environment." },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const asinsParam = searchParams.get('asins');

    if (!asinsParam) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameter: asins' },
        { status: 400 }
      );
    }

    // Parse ASINs
    const asins = asinsParam
      .split(',')
      .map((a) => a.trim().toUpperCase())
      .filter((a) => a.length > 0);

    if (asins.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No valid ASINs provided' },
        { status: 400 }
      );
    }

    if (asins.length > 10) {
      return NextResponse.json(
        { ok: false, error: 'Maximum 10 ASINs per request' },
        { status: 400 }
      );
    }

    console.log(`[Shadow API] Scraping ${asins.length} ASINs...`);

    // Get scraper instance
    const scraper = await getScraper();

    // Scrape all ASINs
    const results: AmazonProductMetadata[] = [];
    const errors: string[] = [];

    for (const asin of asins) {
      try {
        const metadata = await scraper.scrapeASIN(asin);
        if (metadata) {
          results.push(metadata);
        } else {
          errors.push(`Failed to scrape ${asin}`);
        }
      } catch (err) {
        errors.push(`Error scraping ${asin}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        products: results,
        scraped: results.length,
        failed: asins.length - results.length,
        errors,
      },
    });
  } catch (error) {
    console.error('[Shadow API] Scrape error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  // Disable Shadow Scraper on Vercel (Playwright incompatible with serverless)
  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      { ok: false, error: "Shadow Scraper disabled in production environment." },
      { status: 503 }
    );
  }

  try {
    let body: { asins?: string[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    const { asins } = body;

    if (!asins || !Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request: asins must be a non-empty array' },
        { status: 400 }
      );
    }

    if (asins.length > 10) {
      return NextResponse.json(
        { ok: false, error: 'Maximum 10 ASINs per request' },
        { status: 400 }
      );
    }

    console.log(`[Shadow API] Scraping ${asins.length} ASINs (POST)...`);

    // Get scraper instance
    const scraper = await getScraper();

    // Scrape all ASINs
    const results = await scraper.scrapeASINs(asins);
    const errors: string[] = [];

    asins.forEach((asin: string) => {
      if (!results.find((r) => r.asin === asin)) {
        errors.push(`Failed to scrape ${asin}`);
      }
    });

    return NextResponse.json({
      ok: true,
      data: {
        products: results,
        scraped: results.length,
        failed: asins.length - results.length,
        errors,
      },
    });
  } catch (error) {
    console.error('[Shadow API] Scrape error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Cleanup endpoint
export async function DELETE(): Promise<NextResponse> {
  // Disable Shadow Scraper on Vercel (Playwright incompatible with serverless)
  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      { ok: false, error: "Shadow Scraper disabled in production environment." },
      { status: 503 }
    );
  }

  try {
    await closeScraper();
    return NextResponse.json({ ok: true, message: 'Scraper closed successfully' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
