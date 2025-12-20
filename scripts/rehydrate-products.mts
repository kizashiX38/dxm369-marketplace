#!/usr/bin/env ts-node
// scripts/rehydrate-products.ts
// Rehydrate broken products using LOCAL STATIC SEED DATA
// Fallback mechanism when API/Scraper are unavailable

if (!process.env.DATABASE_URL) {
  throw new Error(
    "[DXM-DB] DATABASE_URL is not defined. Run via `npm run rehydrate` with .env.local configured."
  );
}

import { queryAll } from "../src/lib/db";
import { saveProductToDB } from "../src/lib/services/adminProducts";
import fs from "fs";
import path from "path";

// Load static seed data
const SEED_DATA_PATH = path.join(process.cwd(), "data", "asin-seed.json");
let SEED_DATA: any = null;

try {
  const rawData = fs.readFileSync(SEED_DATA_PATH, "utf-8");
  SEED_DATA = JSON.parse(rawData);
} catch (e) {
  console.error("❌ Failed to load seed data:", e);
  process.exit(1);
}

interface BrokenProduct {
  id: number;
  asin: string;
  title: string | null;
  category: string;
}

async function findBrokenProducts(category: string = "gpu"): Promise<BrokenProduct[]> {
  const broken = await queryAll<BrokenProduct>(
    `SELECT id, asin, title, category
     FROM marketplace_products
     WHERE category = $1
       AND (
         title IS NULL 
         OR title = '' 
         OR title = 'Unknown Product'
         OR COALESCE(data_raw->>'brand', '') = ''
         OR COALESCE(data_raw->>'brand', '') = 'Unknown'
         OR price IS NULL
         OR price = 0
         OR price < 50
       )
     ORDER BY asin`,
    [category]
  );

  return broken;
}

function findInSeedData(asin: string, category: string): any | null {
  if (!SEED_DATA || !SEED_DATA.products) return null;

  const categoryProducts = SEED_DATA.products[category];
  if (!Array.isArray(categoryProducts)) return null;

  return categoryProducts.find((p: any) => p.asin === asin);
}

async function rehydrateProduct(asin: string, category: string): Promise<boolean> {
  try {
    console.log(`  🔄 Checking ${asin}...`);

    // Look up in seed data
    const seedProduct = findInSeedData(asin, category);

    if (!seedProduct) {
      console.log(`  ❌ Not found in seed data: ${asin}`);
      return false;
    }

    // Save to database (upsert)
    await saveProductToDB({
      asin: seedProduct.asin,
      category: category,
      title: seedProduct.title,
      image_url: seedProduct.imageUrl,
      price: seedProduct.price,
      rating: seedProduct.dxmScore,
      review_count: 100, // Default for seeded items
      data_raw: {
        ...seedProduct,
        brand: seedProduct.brand || "Unknown",
        dataSource: "seed-rehydration"
      }
    });

    console.log(`  ✅ Rehydrated ${asin}: ${seedProduct.title.substring(0, 50)}...`);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ Error rehydrating ${asin}: ${msg}`);
    return false;
  }
}

async function main() {
  const category = process.argv[2] || "gpu";

  console.log(`\n🚀 DXM369 Product Rehydration Tool (Local Seed Mode)`);
  console.log(`   Category: ${category.toUpperCase()}`);
  console.log(`   Source: ${SEED_DATA_PATH}\n`);

  try {
    // Find all broken products
    const broken = await findBrokenProducts(category);

    if (broken.length === 0) {
      console.log(`✅ No broken ${category} products found!`);
      return;
    }

    console.log(`Found ${broken.length} broken ${category} products\n`);
    console.log("Starting rehydration from seed data...\n");

    let successCount = 0;
    let failCount = 0;

    // Process all products
    for (const product of broken) {
      const success = await rehydrateProduct(product.asin, product.category);
      if (success) successCount++;
      else failCount++;
    }

    console.log(`\n✅ Rehydration complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total: ${broken.length}\n`);

  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();

