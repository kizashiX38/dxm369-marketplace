// src/lib/services/asinFetcher.ts
// Server-side ASIN fetcher with smart fallback chain
// Priority: PA-API → Scraper → Seed JSON

import { DealRadarItem, HardwareCategory } from '@/lib/dealRadarTypes';
import { AmazonPAAPIClient } from '@/lib/amazonPAAPI';
import { calculateDXMScore, DXMScoreInputs } from '@/lib/dxmScoring';
import {
  findSeedProduct,
  transformSeedProductToDealRadar,
  loadSeedData,
} from '@/lib/services/seedLoader';
import { amazonConfig } from '@/lib/env';

export interface FetchASINOptions {
  asins: string[];
  category?: HardwareCategory;
  skipCache?: boolean;
  debug?: boolean;
}

export interface FetchSource {
  asin: string;
  source: 'paapi' | 'scraper' | 'seed' | 'error';
  error?: string;
}

export interface FetchASINResult {
  items: DealRadarItem[];
  sources: FetchSource[];
  errors: string[];
}

const ASIN_REGEX = /^B[0-9A-Z]{9}$/;

/**
 * Validate ASIN format
 */
function isValidASIN(asin: string): boolean {
  return ASIN_REGEX.test(asin);
}

/**
 * Fetch from Amazon PA-API
 */
async function fetchFromPAAPI(asin: string): Promise<DealRadarItem | null> {
  try {
    if (
      !amazonConfig.accessKeyId ||
      !amazonConfig.secretAccessKey
    ) {
      return null; // PA-API not configured
    }

    const client = new AmazonPAAPIClient();
    const items = await client.getItems({
      itemIds: [asin],
      resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Summaries.LowestPrice',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
      ],
    });

    return items.length > 0 ? items[0] : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`PA-API fetch failed for ${asin}:`, error);
    }
    return null;
  }
}

/**
 * Fetch from local Python scraper
 */
async function fetchFromScraper(asin: string): Promise<DealRadarItem | null> {
  try {
    if (!amazonConfig.scraperEnabled) {
      return null;
    }

    const scraperUrl = amazonConfig.scraperUrl || 'http://localhost:5000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(
      `${scraperUrl}/api/scrape?asin=${encodeURIComponent(asin)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Transform scraper response to DealRadarItem
    return {
      id: `scraper-${asin}`,
      asin,
      title: data.title || 'Unknown Product',
      brand: data.brand || 'Unknown',
      category: (data.category || 'gpu') as HardwareCategory,
      price: data.price || 0,
      previousPrice: data.previousPrice,
      dxmScore: data.dxmScore || 6.0,
      imageUrl: data.imageUrl,
      availability: data.availability,
      primeEligible: data.primeEligible,
      vendor: 'Amazon',
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Scraper fetch failed for ${asin}:`, error);
    }
    return null;
  }
}

/**
 * Fetch from seed JSON
 */
async function fetchFromSeed(
  asin: string,
  category?: HardwareCategory
): Promise<DealRadarItem | null> {
  try {
    const seedProduct = await findSeedProduct(asin, category);
    if (!seedProduct) {
      return null;
    }
    return transformSeedProductToDealRadar(seedProduct);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Seed fetch failed for ${asin}:`, error);
    }
    return null;
  }
}

/**
 * Fetch single ASIN with fallback chain
 */
async function fetchSingleASIN(
  asin: string,
  category?: HardwareCategory,
  debug = false
): Promise<{ item: DealRadarItem | null; source: FetchSource }> {
  // Validate format
  if (!isValidASIN(asin)) {
    return {
      item: null,
      source: { asin, source: 'error', error: 'Invalid ASIN format' },
    };
  }

  // Try PA-API first
  let item = await fetchFromPAAPI(asin);
  if (item) {
    if (debug) console.log(`✅ PA-API: ${asin}`);
    return { item, source: { asin, source: 'paapi' } };
  }

  // Try scraper second
  item = await fetchFromScraper(asin);
  if (item) {
    if (debug) console.log(`🟡 Scraper: ${asin}`);
    return { item, source: { asin, source: 'scraper' } };
  }

  // Try seed last
  item = await fetchFromSeed(asin, category);
  if (item) {
    if (debug) console.log(`🔴 Seed: ${asin}`);
    return { item, source: { asin, source: 'seed' } };
  }

  // All failed
  if (debug) console.log(`❌ Failed: ${asin}`);
  return {
    item: null,
    source: { asin, source: 'error', error: 'Not found in any source' },
  };
}

/**
 * Calculate DXM score for a product
 */
function calculateScore(item: DealRadarItem): DealRadarItem {
  try {
    // Prepare scoring inputs (with reasonable defaults)
    const inputs: DXMScoreInputs = {
      asin: item.asin,
      title: item.title,
      brand: item.brand,
      category: item.category,
      segment: 'budget', // Default segment
      currentPrice: item.price || 0,
      perfIndex: 50, // Default perf index (out of 100)
      amazonRating: 4.0,
      ratingCount: 100,
      inStock: item.availability !== 'Out of Stock',
    };

    const scoreResult = calculateDXMScore(inputs);

    return {
      ...item,
      dxmScore: scoreResult.dxmValueScore,
    };
  } catch (error) {
    // Keep original score if calculation fails
    console.error(`Score calculation failed for ${item.asin}:`, error);
    return item;
  }
}

/**
 * Main fetcher: batch fetch multiple ASINs with fallback chain
 */
export async function fetchASINs(
  options: FetchASINOptions
): Promise<FetchASINResult> {
  const { asins, category, debug = false } = options;
  const items: DealRadarItem[] = [];
  const sources: FetchSource[] = [];
  const errors: string[] = [];

  if (!asins || asins.length === 0) {
    errors.push('No ASINs provided');
    return { items, sources, errors };
  }

  // Deduplicate and validate
  const uniqueAsins = [...new Set(asins.map((a) => a.toUpperCase()))];

  if (debug) {
    console.log(`🚀 Fetching ${uniqueAsins.length} ASINs...`);
  }

  // Fetch in parallel
  const results = await Promise.all(
    uniqueAsins.map((asin) => fetchSingleASIN(asin, category, debug))
  );

  // Process results
  for (const { item, source } of results) {
    sources.push(source);

    if (item) {
      // Calculate score
      const scored = calculateScore(item);
      items.push(scored);
    } else if (source.error) {
      errors.push(`${source.asin}: ${source.error}`);
    }
  }

  if (debug) {
    console.log(
      `✨ Result: ${items.length}/${uniqueAsins.length} products fetched`
    );
    console.log(
      `Sources: PA-API=${sources.filter((s) => s.source === 'paapi').length}, Scraper=${sources.filter((s) => s.source === 'scraper').length}, Seed=${sources.filter((s) => s.source === 'seed').length}`
    );
  }

  return { items, sources, errors };
}
