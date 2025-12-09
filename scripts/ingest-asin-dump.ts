/**
 * ASIN Dump Ingestion Script
 *
 * Reads ASIN exports from DXM_ASIN_Console and imports to Supabase
 * Uses Shadow Scraper for enrichment when data is incomplete
 *
 * Usage: npx tsx scripts/ingest-asin-dump.ts [--dry-run] [--enrich]
 *
 * Affiliate Tag: dxm369-20
 */

import * as fs from 'fs';
import * as path from 'path';

const EXPORTS_DIR = '/home/dxm/Documents/DXM_ASIN_Console/exports';
const AFFILIATE_TAG = 'dxm369-20';
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface RawASINRecord {
  ASIN: string;
  Title: string | null;
  Price: string | null;
  Brand: string | null;
  'Review Count': string | null;
  'Image URLs': string[];
  Availability: string | null;
  Description: string | null;
  'Fetch Time': string;
}

interface CategorizedASIN {
  asin: string;
  title: string | null;
  price: number | null;
  category: 'gpu' | 'cpu' | 'laptop' | 'monitor' | 'storage' | 'memory' | 'motherboard' | 'psu' | 'unknown';
  imageUrl: string | null;
  brand: string | null;
  reviewCount: number | null;
  needsEnrichment: boolean;
}

// Category detection patterns
const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  gpu: [
    /geforce|radeon|rtx\s*\d{4}|rx\s*\d{4}|graphics\s*card|video\s*card/i,
  ],
  cpu: [
    /core\s*i[3579]|ryzen\s*[3579]|processor|desktop\s*processor/i,
  ],
  laptop: [
    /laptop|notebook|victus|legion|rog\s*strix.*laptop|tuf\s*gaming.*laptop|pavilion|aspire/i,
  ],
  monitor: [
    /monitor|display.*inch|gaming\s*monitor/i,
  ],
  storage: [
    /ssd|nvme|hard\s*drive|hdd|solid\s*state/i,
  ],
  memory: [
    /ram|ddr[45]|memory\s*kit|dimm/i,
  ],
  motherboard: [
    /motherboard|mainboard|lga\d{4}|am[45]/i,
  ],
  psu: [
    /power\s*supply|psu|\d+w\s*(modular|atx)/i,
  ],
};

function detectCategory(title: string | null, description?: string | null): CategorizedASIN['category'] {
  const text = `${title || ''} ${description || ''}`.toLowerCase();

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return category as CategorizedASIN['category'];
      }
    }
  }
  return 'unknown';
}

function parsePrice(priceStr: string | null): number | null {
  if (!priceStr) return null;
  const match = priceStr.replace(/[,$]/g, '').match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

function parseReviewCount(reviewStr: string | null): number | null {
  if (!reviewStr) return null;
  const match = reviewStr.replace(/[(),]/g, '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

async function loadAllExports(): Promise<RawASINRecord[]> {
  const files = fs.readdirSync(EXPORTS_DIR).filter(f => f.endsWith('.json'));
  const allRecords: RawASINRecord[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(EXPORTS_DIR, file), 'utf-8');
    try {
      const records = JSON.parse(content) as RawASINRecord[];
      allRecords.push(...records);
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e);
    }
  }

  return allRecords;
}

function deduplicateAndCategorize(records: RawASINRecord[]): CategorizedASIN[] {
  const seen = new Map<string, CategorizedASIN>();

  for (const record of records) {
    if (!record.ASIN || record.ASIN === 'null') continue;

    // Keep the record with most data
    const existing = seen.get(record.ASIN);
    const hasMoreData = record.Title && (!existing || !existing.title);

    if (!existing || hasMoreData) {
      seen.set(record.ASIN, {
        asin: record.ASIN,
        title: record.Title,
        price: parsePrice(record.Price),
        category: detectCategory(record.Title, record.Description),
        imageUrl: record['Image URLs']?.[0] || null,
        brand: record.Brand?.replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '') || null,
        reviewCount: parseReviewCount(record['Review Count']),
        needsEnrichment: !record.Title || !record.Price,
      });
    }
  }

  return Array.from(seen.values());
}

async function enrichWithShadow(asin: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/shadow/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin }),
    });

    if (!response.ok) {
      throw new Error(`Shadow scrape failed: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data?.product : null;
  } catch (e) {
    console.error(`Shadow enrichment failed for ${asin}:`, e);
    return null;
  }
}

async function bulkImport(products: CategorizedASIN[], dryRun = false): Promise<void> {
  const payload = products.map(p => ({
    asin: p.asin,
    title: p.title || `Product ${p.asin}`,
    price: p.price,
    category: p.category,
    imageUrl: p.imageUrl,
    brand: p.brand,
    reviewCount: p.reviewCount,
    affiliateTag: AFFILIATE_TAG,
  }));

  if (dryRun) {
    console.log('\n[DRY RUN] Would import:');
    console.log(JSON.stringify(payload.slice(0, 5), null, 2));
    console.log(`... and ${payload.length - 5} more`);
    return;
  }

  const response = await fetch(`${API_BASE}/api/admin/products/bulkImport`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': process.env.ADMIN_SECRET || '',
    },
    body: JSON.stringify({ products: payload }),
  });

  const result = await response.json();
  console.log('Bulk import result:', result);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const enrich = args.includes('--enrich');

  console.log('='.repeat(60));
  console.log('DXM ASIN Dump Ingestion');
  console.log(`Affiliate Tag: ${AFFILIATE_TAG}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Enrich Unknown: ${enrich}`);
  console.log('='.repeat(60));

  // Load all exports
  console.log('\n[1/4] Loading exports from', EXPORTS_DIR);
  const rawRecords = await loadAllExports();
  console.log(`Loaded ${rawRecords.length} raw records`);

  // Deduplicate and categorize
  console.log('\n[2/4] Deduplicating and categorizing...');
  const categorized = deduplicateAndCategorize(rawRecords);
  console.log(`Unique ASINs: ${categorized.length}`);

  // Category breakdown
  const breakdown: Record<string, number> = {};
  for (const p of categorized) {
    breakdown[p.category] = (breakdown[p.category] || 0) + 1;
  }
  console.log('\nCategory Breakdown:');
  for (const [cat, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Enrich unknown products if requested
  if (enrich) {
    const unknown = categorized.filter(p => p.needsEnrichment);
    console.log(`\n[3/4] Enriching ${unknown.length} products with Shadow Scraper...`);

    for (let i = 0; i < unknown.length; i++) {
      const p = unknown[i];
      console.log(`  [${i + 1}/${unknown.length}] ${p.asin}...`);

      const enriched = await enrichWithShadow(p.asin);
      if (enriched) {
        p.title = enriched.title || p.title;
        p.price = enriched.price || p.price;
        p.imageUrl = enriched.imageUrl || p.imageUrl;
        p.category = detectCategory(enriched.title) || p.category;
        p.needsEnrichment = false;
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 2000));
    }
  } else {
    console.log('\n[3/4] Skipping enrichment (use --enrich to enable)');
  }

  // Import to database
  const readyToImport = categorized.filter(p => p.title && p.category !== 'unknown');
  console.log(`\n[4/4] Importing ${readyToImport.length} products to Supabase...`);

  await bulkImport(readyToImport, dryRun);

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
}

main().catch(console.error);
