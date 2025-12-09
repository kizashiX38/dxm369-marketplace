// src/lib/services/adminProducts.ts
// Admin product management service
// SERVER-ONLY MODULE - Do not import in client components

import { query, queryOne, queryAll } from "@/lib/db";
import { amazonPAAPI } from "@/lib/amazonPAAPI";
import type { DealRadarItem } from "@/lib/dealRadar";

export interface MarketplaceProduct {
  id: number;
  asin: string;
  category: string;
  title: string;
  image_url?: string;
  price?: number;
  rating?: number;
  review_count?: number;
  last_synced?: Date;
  visible: boolean;
  data_raw?: any;
  created_at: Date;
  updated_at: Date;
}

export interface SyncLog {
  id: number;
  asin: string;
  operation: string;
  status: string;
  message?: string;
  synced_at: Date;
}

/**
 * Fetch product from Amazon PA-API
 */
export async function fetchProductFromAmazon(asin: string): Promise<DealRadarItem | null> {
  try {
    const result = await amazonPAAPI.getItems({
      itemIds: [asin],
      condition: "New",
      merchant: "Amazon"
    });
    return result[0] || null;
  } catch (error) {
    console.error(`[adminProducts] Failed to fetch ${asin}:`, error);
    return null;
  }
}

/**
 * Save product to marketplace_products table
 */
export async function saveProductToDB(data: {
  asin: string;
  category: string;
  title: string;
  image_url?: string;
  price?: number;
  rating?: number;
  review_count?: number;
  data_raw?: any;
}): Promise<MarketplaceProduct> {
  const result = await queryOne<MarketplaceProduct>(
    `INSERT INTO marketplace_products
      (asin, category, title, image_url, price, rating, review_count, last_synced, data_raw)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
     ON CONFLICT (asin) DO UPDATE SET
       category = EXCLUDED.category,
       title = EXCLUDED.title,
       image_url = EXCLUDED.image_url,
       price = EXCLUDED.price,
       rating = EXCLUDED.rating,
       review_count = EXCLUDED.review_count,
       last_synced = NOW(),
       data_raw = EXCLUDED.data_raw,
       updated_at = NOW()
     RETURNING *`,
    [
      data.asin,
      data.category,
      data.title,
      data.image_url || null,
      data.price || null,
      data.rating || null,
      data.review_count || null,
      data.data_raw || null
    ]
  );

  if (!result) throw new Error(`Failed to save product ${data.asin}: no result returned`);
  return result;
}

/**
 * Update product visibility
 */
export async function updateProductVisibility(id: number, visible: boolean): Promise<void> {
  const result = await query(
    `UPDATE marketplace_products SET visible = $1, updated_at = NOW() WHERE id = $2`,
    [visible, id]
  );
  if (result.rowCount === 0) throw new Error(`Product ${id} not found`);
}

/**
 * Log sync operation
 */
export async function logSync(
  asin: string,
  operation: string,
  status: string,
  message?: string
): Promise<void> {
  await query(
    `INSERT INTO marketplace_sync_logs (asin, operation, status, message)
     VALUES ($1, $2, $3, $4)`,
    [asin, operation, status, message || null]
  );
}

/**
 * Delete product from marketplace
 */
export async function deleteProduct(id: number): Promise<void> {
  const result = await query(`DELETE FROM marketplace_products WHERE id = $1`, [id]);
  if (result.rowCount === 0) throw new Error(`Product ${id} not found`);
}

/**
 * Get product by ID
 */
export async function getProductById(id: number): Promise<MarketplaceProduct | null> {
  return queryOne<MarketplaceProduct>(
    `SELECT * FROM marketplace_products WHERE id = $1`,
    [id]
  );
}

/**
 * Get product by ASIN
 */
export async function getProductByAsin(asin: string): Promise<MarketplaceProduct | null> {
  return queryOne<MarketplaceProduct>(
    `SELECT * FROM marketplace_products WHERE asin = $1`,
    [asin]
  );
}

/**
 * Get all visible products by category
 */
export async function getProductsByCategory(
  category: string,
  visibleOnly = true
): Promise<MarketplaceProduct[]> {
  const whereClause = visibleOnly ? "WHERE category = $1 AND visible = true" : "WHERE category = $1";
  return queryAll<MarketplaceProduct>(
    `SELECT * FROM marketplace_products ${whereClause} ORDER BY price ASC`,
    [category]
  );
}

/**
 * Get product list with optional filters (admin use)
 */
export async function getProductList(filters?: {
  category?: string;
  visible?: boolean;
}): Promise<MarketplaceProduct[]> {
  let query = "SELECT * FROM marketplace_products";
  const params: any[] = [];
  const conditions: string[] = [];

  if (filters?.category) {
    conditions.push(`category = $${params.length + 1}`);
    params.push(filters.category);
  }

  if (filters?.visible !== undefined) {
    conditions.push(`visible = $${params.length + 1}`);
    params.push(filters.visible);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY category, title";

  return queryAll<MarketplaceProduct>(query, params);
}

/**
 * Get all products (for admin)
 */
export async function getAllProducts(visibleOnly = false): Promise<MarketplaceProduct[]> {
  const whereClause = visibleOnly ? "WHERE visible = true" : "";
  return queryAll<MarketplaceProduct>(
    `SELECT * FROM marketplace_products ${whereClause} ORDER BY category, title`,
    []
  );
}

/**
 * Get sync logs for ASIN
 */
export async function getSyncLogs(asin: string, limit = 10): Promise<SyncLog[]> {
  return queryAll<SyncLog>(
    `SELECT * FROM marketplace_sync_logs WHERE asin = $1 ORDER BY synced_at DESC LIMIT $2`,
    [asin, limit]
  );
}

/**
 * Refresh product from Amazon
 */
export async function refreshProduct(id: number): Promise<MarketplaceProduct> {
  const product = await getProductById(id);
  if (!product) throw new Error(`Product ${id} not found`);

  try {
    const amazonData = await fetchProductFromAmazon(product.asin);
    if (!amazonData) throw new Error("Product not found on Amazon");

    const updated = await saveProductToDB({
      asin: product.asin,
      category: product.category,
      title: amazonData.title || product.title,
      image_url: amazonData.imageUrl || product.image_url,
      price: amazonData.price || product.price,
      rating: amazonData.dxmScore,
      review_count: amazonData.dxmScore ? Math.floor(amazonData.dxmScore * 100) : undefined,
      data_raw: amazonData
    });

    await logSync(product.asin, "refresh", "success", "Refreshed from Amazon");
    return updated;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await logSync(product.asin, "refresh", "error", msg);
    throw error;
  }
}

/**
 * Import products from JSON array
 * If title is provided, allows direct import without Amazon API validation (for bulk seeding)
 */
export async function bulkImportProducts(
  products: Array<{ asin: string; category: string; title?: string }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of products) {
    try {
      // Validate ASIN
      if (!item.asin || !/^B[0-9A-Z]{9}$/.test(item.asin)) {
        throw new Error(`Invalid ASIN format: ${item.asin}`);
      }

      // If title is provided, allow direct insert (for bulk seeding POC)
      if (item.title) {
        await saveProductToDB({
          asin: item.asin,
          category: item.category,
          title: item.title,
          price: 99.99, // Placeholder for POC
        });

        await logSync(item.asin, "import", "success", "Direct import (seeding)");
        success++;
      } else {
        // ATOMIC OPERATION: Fetch from Amazon FIRST, only insert if successful
        const amazonData = await fetchProductFromAmazon(item.asin);
        if (!amazonData) {
          throw new Error("Product not found on Amazon");
        }

        // STRICT VALIDATION: Only save if we have complete metadata
        // This prevents "UNKNOWN PRODUCT" from entering the database
        if (!amazonData.title || amazonData.title === "Unknown Product") {
          throw new Error("Incomplete product data: missing or invalid title");
        }

        if (!amazonData.price || amazonData.price < 50) {
          throw new Error(`Suspicious price ($${amazonData.price}) - likely placeholder data`);
        }

        // Save to DB only after validation passes
        await saveProductToDB({
          asin: item.asin,
          category: item.category,
          title: item.title || amazonData.title,
          image_url: amazonData.imageUrl,
          price: amazonData.price,
          rating: amazonData.dxmScore,
          data_raw: amazonData
        });

        await logSync(item.asin, "import", "success");
        success++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${item.asin}: ${msg}`);
      await logSync(item.asin, "import", "error", msg);
      failed++;
    }
  }

  return { success, failed, errors };
}

/**
 * Import products from asin-seed.json
 */
export async function importFromSeedFile(seedData: any): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  try {
    const products = seedData.products || {};

    for (const [category, items] of Object.entries(products)) {
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        try {
          await saveProductToDB({
            asin: (item as any).asin,
            category: (item as any).category || category,
            title: (item as any).title,
            image_url: (item as any).imageUrl,
            price: (item as any).price,
            rating: (item as any).dxmScore,
            data_raw: item
          });
          success++;
        } catch (e) {
          failed++;
        }
      }
    }
  } catch (error) {
    console.error("[adminProducts] Failed to import seed file:", error);
  }

  return { success, failed };
}
