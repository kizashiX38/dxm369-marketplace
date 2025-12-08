#!/usr/bin/env ts-node
// scripts/rehydrate-products.ts
// Rehydrate broken products using ASIN scraper (no PA-API required)
// Fetches missing metadata for products with incomplete data

if (!process.env.DATABASE_URL) {
  throw new Error(
    "[DXM-DB] DATABASE_URL is not defined. Run via `npm run rehydrate` with .env.local configured."
  );
}

import { queryAll, query } from "../src/lib/db";
import { getAmazonProductsByASIN } from "../src/lib/amazonPAAPI";
import { saveProductToDB } from "../src/lib/services/adminProducts";

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

async function rehydrateProduct(asin: string, category: string): Promise<boolean> {
  try {
    console.log(`  🔄 Fetching ${asin}...`);
    
    // Use Amazon API (will fallback to scraper if API unavailable)
    const products = await getAmazonProductsByASIN([asin]);
    
    if (products.length === 0) {
      console.log(`  ❌ No data found for ${asin}`);
      return false;
    }

    const product = products[0];
    
    // Validate we got real data
    if (!product.title || product.title === "Unknown Product") {
      console.log(`  ⚠️  Incomplete data for ${asin} - skipping`);
      return false;
    }

    if (!product.price || product.price < 50) {
      console.log(`  ⚠️  Suspicious price ($${product.price}) for ${asin} - skipping`);
      return false;
    }

    // Save to database (upsert - updates if exists)
    await saveProductToDB({
      asin: product.asin,
      category: category,
      title: product.title,
      image_url: product.imageUrl,
      price: product.price,
      rating: product.dxmScore,
      review_count: product.dxmScore ? Math.floor(product.dxmScore * 100) : undefined,
      data_raw: {
        ...product,
        brand: product.brand || "Unknown"
      }
    });

    console.log(`  ✅ Rehydrated ${asin}: ${product.title.substring(0, 50)}...`);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ Error rehydrating ${asin}: ${msg}`);
    return false;
  }
}

async function main() {
  const category = process.argv[2] || "gpu";
  const asinArg = process.argv[3]; // Optional: specific ASIN to rehydrate
  
  console.log(`\n🚀 DXM369 Product Rehydration Tool`);
  console.log(`   Category: ${category.toUpperCase()}`);
  console.log(`   Using: ASIN Scraper Bridge (no PA-API required)\n`);

  try {
    if (asinArg) {
      // Rehydrate single ASIN
      console.log(`Rehydrating single ASIN: ${asinArg}\n`);
      const success = await rehydrateProduct(asinArg, category);
      process.exit(success ? 0 : 1);
    }

    // Find all broken products
    const broken = await findBrokenProducts(category);
    
    if (broken.length === 0) {
      console.log(`✅ No broken ${category} products found!`);
      return;
    }

    console.log(`Found ${broken.length} broken ${category} products\n`);
    console.log("Starting rehydration...\n");

    let successCount = 0;
    let failCount = 0;

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < broken.length; i += batchSize) {
      const batch = broken.slice(i, i + batchSize);
      
      console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1} (${batch.length} products):`);
      
      const results = await Promise.all(
        batch.map(p => rehydrateProduct(p.asin, p.category))
      );

      results.forEach((success, idx) => {
        if (success) successCount++;
        else failCount++;
      });

      // Rate limiting: wait 2 seconds between batches
      if (i + batchSize < broken.length) {
        console.log(`   ⏳ Waiting 2s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
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

