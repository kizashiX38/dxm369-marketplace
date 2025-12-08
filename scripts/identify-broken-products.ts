#!/usr/bin/env ts-node
// scripts/identify-broken-products.ts
// Identify GPU products with missing metadata (UNKNOWN PRODUCT issue)

import { queryAll } from "../src/lib/db";

interface BrokenProduct {
  id: number;
  asin: string;
  title: string | null;
  brand: string | null;
  price: number | null;
  category: string;
  image_url: string | null;
}

async function identifyBrokenProducts(category: string = "gpu"): Promise<BrokenProduct[]> {
  console.log(`\n🔍 Identifying broken ${category.toUpperCase()} products...\n`);

  const broken = await queryAll<BrokenProduct>(
    `SELECT id, asin, title, 
            COALESCE(data_raw->>'brand', '') as brand,
            price, category, image_url
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
         OR price < 50  -- Suspiciously low prices
         OR image_url IS NULL
       )
     ORDER BY asin`,
    [category]
  );

  return broken;
}

async function main() {
  const category = process.argv[2] || "gpu";
  
  try {
    const broken = await identifyBrokenProducts(category);
    
    if (broken.length === 0) {
      console.log(`✅ No broken ${category} products found!`);
      return;
    }

    console.log(`❌ Found ${broken.length} broken ${category} products:\n`);
    console.log("ASIN\t\tTitle\t\t\t\tBrand\t\tPrice");
    console.log("-".repeat(80));
    
    broken.forEach((p) => {
      const title = (p.title || "NULL").substring(0, 25).padEnd(25);
      const brand = (p.brand || "NULL").substring(0, 12).padEnd(12);
      const price = p.price ? `$${p.price}` : "NULL";
      console.log(`${p.asin}\t${title}\t${brand}\t${price}`);
    });

    console.log(`\n📋 Exporting to broken-${category}-products.json...`);
    const fs = await import("fs/promises");
    await fs.writeFile(
      `broken-${category}-products.json`,
      JSON.stringify(broken, null, 2)
    );
    console.log(`✅ Exported ${broken.length} broken products\n`);

    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Run: npm run rehydrate -- --category ${category}`);
    console.log(`   2. Or manually fix each ASIN using Amazon API\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();

