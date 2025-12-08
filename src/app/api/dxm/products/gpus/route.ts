// src/app/api/dxm/products/gpus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { queryAll } from "@/lib/db";
import { normalizeDealRadarItemToDXMProduct } from "@/lib/products/normalizeDXMProduct";
import type { DealRadarItem } from "@/lib/dealRadarTypes";

export const dynamic = 'force-dynamic';

export const GET = apiSafe(async (request: NextRequest) => {
  // Query products from marketplace_products table
  const raw = await queryAll<{
    id: number;
    asin: string;
    title: string;
    brand: string;
    category: string;
    image_url?: string;
    price?: number;
    rating?: number;
    review_count?: number;
    affiliate_url?: string;
  }>(
    `SELECT * FROM marketplace_products WHERE category = $1 AND visible = true ORDER BY price DESC LIMIT 50`,
    ["gpu"]
  );

  // Map database rows to DealRadarItem format
  const dealRadarItems: DealRadarItem[] = raw.map(row => {
    const price = typeof row.price === 'number' ? row.price : (row.price ? parseFloat(String(row.price)) : 0);

    return {
      id: `amazon-${row.asin}`,
      asin: row.asin,
      title: row.title,
      brand: row.brand || "Unknown",
      category: "gpu" as any,
      price: price,
      previousPrice: undefined,
      dxmScore: 7.5, // Default score - can be calculated later
      imageUrl: row.image_url,
      availability: price > 0 ? "In Stock" : "Out of Stock",
      primeEligible: true,
      vendor: "Amazon",
      affiliateUrl: row.affiliate_url || `https://www.amazon.com/dp/${row.asin}?tag=dxm369-20`
    };
  });

  // Normalize and filter
  const normalized = dealRadarItems
    .map(item => {
      const normalized = normalizeDealRadarItemToDXMProduct(item);
      if (!normalized) {
        console.warn("[DXM-NORMALIZER] Dropped invalid product:", item?.id, item?.asin);
      }
      return normalized;
    })
    .filter(Boolean);

  return NextResponse.json(normalized);
});

