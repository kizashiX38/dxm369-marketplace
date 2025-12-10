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

export const GET = apiSafe(async (request: NextRequest, context: any) => {
  const params = await context.params;
  const category = params.category.toLowerCase();

  // Query marketplace products from marketplace_products table
  const raw = await queryAll<MarketplaceProductRow>(
    `SELECT * FROM marketplace_products
     WHERE category = $1 AND visible = true
     ORDER BY price DESC
     LIMIT 100`,
    [category]
  );

  // Fallback product images by category
  const fallbackImageMap: Record<string, string> = {
    storage: 'https://m.media-amazon.com/images/I/81qkpJ4ym7L._AC_SX679_.jpg',
    memory: 'https://m.media-amazon.com/images/I/71HNaAQ8U0L._AC_SX679_.jpg',
    'gaming-mice': 'https://m.media-amazon.com/images/I/61t4Z3T7V3L._AC_SX679_.jpg',
    cooling: 'https://m.media-amazon.com/images/I/71-q9tHmKyL._AC_SX679_.jpg',
    motherboards: 'https://m.media-amazon.com/images/I/71BHLDGSrjL._AC_SX679_.jpg',
    psu: 'https://m.media-amazon.com/images/I/71QJr2M3YHL._AC_SX679_.jpg',
    monitors: 'https://m.media-amazon.com/images/I/71U-BfAL3uL._AC_SX679_.jpg',
  };

  // Map to DXM product format
  const products = raw.map(row => ({
    id: `marketplace-${row.asin}`,
    asin: row.asin,
    title: row.title || `${category} Product`,
    name: row.title || `${category} Product`,
    brand: row.title?.split(' ')[0] || 'Unknown',
    category: category,
    price: Number(row.price || 0),
    rating: Number(row.rating || 0),
    reviewCount: row.review_count || 0,
    dxmScore: Number(row.rating || 7.0),
    imageUrl: row.image_url || fallbackImageMap[category] || 'https://m.media-amazon.com/images/I/71U-BfAL3uL._AC_SX679_.jpg',
    availability: 'In Stock',
    vendor: 'Amazon',
    affiliateLink: `https://amazon.com/dp/${row.asin}?tag=dxm369-20`,
    primeEligible: false,
    specs: {},
    lastUpdated: new Date().toISOString(),
  }));

  return NextResponse.json(products);
});
