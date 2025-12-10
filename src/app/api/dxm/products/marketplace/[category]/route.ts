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

  // Fallback product images by category (using verified working Amazon CDN images)
  const fallbackImageMap: Record<string, string> = {
    storage: 'https://images-na.ssl-images-amazon.com/images/I/71wF7QBavPL._AC_SY300_SX300_.jpg',
    memory: 'https://images-na.ssl-images-amazon.com/images/I/91Evw9aY7jL._AC_SY300_SX300_.jpg',
    'gaming-mice': 'https://images-na.ssl-images-amazon.com/images/I/61-2ZC4qPaL._AC_SY300_SX300_.jpg',
    cooling: 'https://images-na.ssl-images-amazon.com/images/I/71a-0gJ-UnL._AC_SY300_SX300_.jpg',
    motherboards: 'https://images-na.ssl-images-amazon.com/images/I/81Z-WKqIiOL._AC_SY300_SX300_.jpg',
    psu: 'https://images-na.ssl-images-amazon.com/images/I/71E8CqEcsyL._AC_SY300_SX300_.jpg',
    monitors: 'https://images-na.ssl-images-amazon.com/images/I/71-Hdt4fuwL._AC_SY300_SX300_.jpg',
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
    imageUrl: row.image_url || fallbackImageMap[category] || 'https://images-na.ssl-images-amazon.com/images/I/71-Hdt4fuwL._AC_SY300_SX300_.jpg',
    availability: 'In Stock',
    vendor: 'Amazon',
    affiliateLink: `https://amazon.com/dp/${row.asin}?tag=dxm369-20`,
    primeEligible: false,
    specs: {},
    lastUpdated: new Date().toISOString(),
  }));

  return NextResponse.json(products);
});
