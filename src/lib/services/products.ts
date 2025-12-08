// src/lib/services/products.ts
// DXM369 Product Persistence Service
// Real-data mode: Save all Amazon products to PostgreSQL
// SERVER-ONLY MODULE - Do not import in client components

import { query, queryOne } from "@/lib/db";
import { DealRadarItem } from "@/lib/dealRadar";
import { databaseConfig } from "@/lib/env";

export interface ProductRecord {
  id: number;
  asin: string;
  title: string;
  brand: string;
  category: string;
  segment?: string;
  image_url?: string;
  msrp_price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface OfferRecord {
  id: number;
  product_id: number;
  price: number;
  list_price?: number;
  discount_percent?: number;
  availability: boolean;
  prime_eligible: boolean;
  vendor?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Save or update a product from Amazon API response
 * Real-data mode: Must succeed or throw error
 */
export async function saveOrUpdateProduct(item: DealRadarItem): Promise<void> {
  if (!databaseConfig.url) {
    throw new Error("DATABASE_URL not configured - real data mode requires database");
  }

  try {
    // 1. Upsert product
    const productResult = await query<ProductRecord>(
      `INSERT INTO products (asin, title, brand, category, segment, image_url, msrp_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (asin) 
       DO UPDATE SET 
         title = EXCLUDED.title,
         brand = EXCLUDED.brand,
         category = EXCLUDED.category,
         segment = EXCLUDED.segment,
         image_url = EXCLUDED.image_url,
         msrp_price = EXCLUDED.msrp_price,
         updated_at = NOW()
       RETURNING id, asin, title, brand, category`,
      [
        item.asin,
        item.title,
        item.brand,
        item.category,
        item.tags?.find(t => ["budget", "mainstream", "premium", "1080p", "1440p", "4k"].includes(t)) || null,
        item.imageUrl || null,
        item.previousPrice || null,
      ]
    );

    if (!productResult || productResult.rows.length === 0) {
      throw new Error(`Failed to save product ${item.asin}`);
    }

    const productId = productResult.rows[0].id;

    // 2. Upsert offer (current price)
    await query<OfferRecord>(
      `INSERT INTO offers (product_id, price, list_price, availability, prime_eligible, vendor)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_id) 
       DO UPDATE SET 
         price = EXCLUDED.price,
         list_price = EXCLUDED.list_price,
         availability = EXCLUDED.availability,
         prime_eligible = EXCLUDED.prime_eligible,
         vendor = EXCLUDED.vendor,
         updated_at = NOW()`,
      [
        productId,
        item.price,
        item.previousPrice || null,
        item.availability === "In Stock",
        item.primeEligible || false,
        item.vendor || "Amazon",
      ]
    );

    // 3. Save price history if price changed
    if (item.previousPrice && item.previousPrice !== item.price) {
      await query(
        `INSERT INTO price_history (product_id, price, list_price, recorded_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [productId, item.price, item.previousPrice]
      );
    }

    // 4. Save DXM score
    await query(
      `INSERT INTO dxm_scores (product_id, dxm_value_score, performance_value, deal_quality, trust_signal, efficiency, trend_signal, calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT DO NOTHING`,
      [
        productId,
        item.dxmScore,
        item.dxmScore * 0.4, // Performance component
        item.dxmScore * 0.3, // Deal quality component
        item.dxmScore * 0.15, // Trust signal
        item.dxmScore * 0.1, // Efficiency
        item.trend ? (item.trend[0] > item.trend[item.trend.length - 1] ? 1 : -1) : 0, // Trend signal
      ]
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Products Service] Failed to save product ${item.asin}:`, errorMsg);
    throw new Error(`Product persistence failed for ${item.asin}: ${errorMsg}`);
  }
}

/**
 * Batch save multiple products
 * Real-data mode: All must succeed
 */
export async function saveOrUpdateProducts(items: DealRadarItem[]): Promise<void> {
  if (!databaseConfig.url) {
    throw new Error("DATABASE_URL not configured - real data mode requires database");
  }

  const errors: string[] = [];

  for (const item of items) {
    try {
      await saveOrUpdateProduct(item);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${item.asin}: ${errorMsg}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to save ${errors.length}/${items.length} products:\n${errors.join("\n")}`);
  }
}

/**
 * Get product by ASIN from database
 */
export async function getProductByASIN(asin: string): Promise<ProductRecord | null> {
  const result = await queryOne<ProductRecord>(
    `SELECT * FROM products WHERE asin = $1`,
    [asin]
  );
  return result;
}

/**
 * Get current offer for product
 */
export async function getCurrentOffer(productId: number): Promise<OfferRecord | null> {
  const result = await queryOne<OfferRecord>(
    `SELECT * FROM offers WHERE product_id = $1 AND availability = true ORDER BY updated_at DESC LIMIT 1`,
    [productId]
  );
  return result;
}

