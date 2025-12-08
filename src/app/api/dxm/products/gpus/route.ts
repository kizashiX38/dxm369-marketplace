// src/app/api/dxm/products/gpus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { queryAll } from "@/lib/db";
import { normalizeDealRadarItemToDXMProduct } from "@/lib/products/normalizeDXMProduct";
import type { DealRadarItem } from "@/lib/dealRadarTypes";

export const dynamic = 'force-dynamic';

export const GET = apiSafe(async (request: NextRequest) => {
  // Query products from product_catalog table (same as CPU route)
  const raw = await queryAll<{
    id: number;
    asin: string;
    title: string;
    brand: string;
    category: string;
    image_url?: string;
    current_price?: number;
    list_price?: number;
    prime_eligible?: boolean;
    dxm_value_score?: number;
  }>(
    `SELECT * FROM product_catalog WHERE category = $1`,
    ["GPU"]
  );

  // Map database rows to DealRadarItem format
  const dealRadarItems: DealRadarItem[] = raw.map(row => ({
    id: `amazon-${row.asin}`,
    asin: row.asin,
    title: row.title,
    brand: row.brand,
    category: row.category.toLowerCase() as any,
    price: row.current_price || 0,
    previousPrice: row.list_price,
    dxmScore: row.dxm_value_score || 0,
    imageUrl: row.image_url,
    availability: row.current_price ? "In Stock" : "Out of Stock",
    primeEligible: row.prime_eligible || false,
    vendor: "Amazon"
  }));

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

