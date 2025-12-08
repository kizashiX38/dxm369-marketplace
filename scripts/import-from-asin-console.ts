#!/usr/bin/env tsx
// Import products from DXM_ASIN_Console exports to marketplace database

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const ASIN_CONSOLE_DIR = '/home/dxm/Documents/DXM_ASIN_Console/exports';
const AFFILIATE_TAG = 'dxm369-20';

interface ASINProduct {
  ASIN: string;
  Title: string;
  Price: string;
  Brand: string;
  'Review Count': string;
  'Image URLs': string[];
  Availability: string;
  Description: string;
  'Fetch Time': string;
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dxm369',
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}&linkCode=ogi&th=1&psc=1`;
}

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  const match = priceStr.match(/[\d,]+\.?\d*/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, ''));
}

function detectCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();

  if (text.includes('rtx') || text.includes('geforce') || text.includes('radeon') || text.includes('graphics card')) {
    return 'gpu';
  }
  if (text.includes('laptop') || text.includes('notebook')) {
    return 'laptop';
  }
  if (text.includes('ryzen') || text.includes('intel core') || text.includes('processor') && !text.includes('laptop')) {
    return 'cpu';
  }
  if (text.includes('monitor') || text.includes('display') && text.includes('hz')) {
    return 'monitor';
  }
  if (text.includes('ssd') || text.includes('nvme') || text.includes('storage')) {
    return 'storage';
  }
  if (text.includes('ram') || text.includes('memory') && text.includes('ddr')) {
    return 'memory';
  }
  if (text.includes('motherboard') || text.includes('mainboard')) {
    return 'motherboard';
  }
  if (text.includes('power supply') || text.includes('psu')) {
    return 'psu';
  }

  return 'other';
}

async function importProducts() {
  console.log('🔍 Scanning for JSON files in:', ASIN_CONSOLE_DIR);

  const files = readdirSync(ASIN_CONSOLE_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse(); // Latest first

  console.log(`📦 Found ${files.length} JSON files`);

  // Get unique ASINs from all files
  const asinMap = new Map<string, ASINProduct>();

  for (const file of files) {
    const filePath = join(ASIN_CONSOLE_DIR, file);
    const content = readFileSync(filePath, 'utf-8');
    const products: ASINProduct[] = JSON.parse(content);

    for (const product of products) {
      if (!asinMap.has(product.ASIN)) {
        asinMap.set(product.ASIN, product);
      }
    }
  }

  console.log(`\n✅ Found ${asinMap.size} unique products\n`);

  // Import to database
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const [asin, product] of asinMap.entries()) {
    try {
      // Skip if missing critical data
      if (!product.Title || !product['Image URLs'] || product['Image URLs'].length === 0) {
        skipped++;
        continue;
      }

      const price = parsePrice(product.Price);
      const category = detectCategory(product.Title, product.Description || '');
      const affiliateUrl = buildAmazonUrl(asin);
      const imageUrl = product['Image URLs'][0];

      // Check if already exists
      const existing = await pool.query(
        'SELECT asin FROM marketplace_products WHERE asin = $1',
        [asin]
      );

      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      // Insert product
      await pool.query(`
        INSERT INTO marketplace_products (
          asin,
          title,
          category,
          price,
          brand,
          image_url,
          affiliate_url,
          description,
          visible,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        asin,
        product.Title,
        category,
        price,
        product.Brand.replace('Visit the ', '').replace(' Store', ''),
        imageUrl,
        affiliateUrl,
        product.Description,
        true
      ]);

      imported++;
      console.log(`✓ Imported: ${product.Title.substring(0, 60)}... [${category}] $${price}`);

    } catch (error) {
      errors++;
      console.error(`✗ Error importing ${asin}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped (already exists): ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(60));

  await pool.end();
}

importProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
