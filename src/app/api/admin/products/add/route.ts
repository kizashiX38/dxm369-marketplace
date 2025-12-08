// POST /api/admin/products/add
// Add a single product by ASIN and category

import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductFromAmazon,
  saveProductToDB,
  logSync,
  getProductByAsin
} from "@/lib/services/adminProducts";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";
import { env } from "@/lib/env";

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ asin: string; category: string }>(request);
  
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { asin, category } = body;

  // Validate input
  if (!asin || !category) {
    return NextResponse.json(
      { ok: false, error: "Missing asin or category" },
      { status: 400 }
    );
  }

  if (!/^B[0-9A-Z]{9}$/.test(asin)) {
    return NextResponse.json(
      { ok: false, error: "Invalid ASIN format" },
      { status: 400 }
    );
  }

  // Check if already exists
  const existing = await getProductByAsin(asin);
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "Product already exists" },
      { status: 409 }
    );
  }

  // Fetch from Amazon
  const amazonData = await fetchProductFromAmazon(asin);
  if (!amazonData) {
    await logSync(asin, "add", "error", "Not found on Amazon");
    return NextResponse.json(
      { ok: false, error: "Product not found on Amazon" },
      { status: 404 }
    );
  }

  // Save to DB
  const product = await saveProductToDB({
    asin,
    category,
    title: amazonData.title,
    image_url: amazonData.imageUrl,
    price: amazonData.price,
    rating: amazonData.dxmScore,
    data_raw: amazonData
  });

  await logSync(asin, "add", "success");

  return NextResponse.json({ ok: true, data: product });
});
