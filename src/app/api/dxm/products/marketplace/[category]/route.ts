// src/app/api/dxm/products/marketplace/[category]/route.ts
// Generic marketplace products endpoint serving from marketplace_products table
import { NextRequest, NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { queryAll } from "@/lib/db";
import type { DXMProduct } from "@/lib/types/product";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // ISR: revalidate every hour

interface MarketplaceProductRow {
  id: number;
  asin: string;
  category: string;
  title: string;
  image_url?: string;
  price?: number;
  rating?: number;
  review_count?: number;
  visible: boolean;
}

export const GET = apiSafe(async (request: NextRequest, props: { params: Promise<{ category: string }> }) => {
  const params = await props.params;
  const category = params.category.toLowerCase();

  // Query marketplace products from marketplace_products table
  const raw = await queryAll<MarketplaceProductRow>(
    `SELECT * FROM marketplace_products
     WHERE category = $1 AND visible = true
     ORDER BY price DESC
     LIMIT 100`,
    [category]
  );

  // Map to DXM product format
  const products: DXMProduct[] = raw.map(row => ({
    id: `marketplace-${row.asin}`,
    asin: row.asin,
    title: row.title || `${category} Product`,
    brand: row.title?.split(' ')[0] || 'Unknown',
    category: category,
    price: Number(row.price || 0),
    rating: Number(row.rating || 0),
    reviewCount: row.review_count || 0,
    dxmScore: Number(row.rating || 7.0),
    imageUrl: row.image_url,
    availability: 'In Stock',
    affiliateLink: `https://amazon.com/dp/${row.asin}?tag=dxm369-20`,
    primeEligible: false,
  }));

  return NextResponse.json(products);
});
