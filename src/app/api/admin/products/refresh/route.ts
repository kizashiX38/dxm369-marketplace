// POST /api/admin/products/refresh
// Manually refresh a product from Amazon

import { NextRequest, NextResponse } from "next/server";
import { refreshProduct } from "@/lib/services/adminProducts";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ id: number }>(request);
  
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing product id" },
      { status: 400 }
    );
  }

  const product = await refreshProduct(id);

  return NextResponse.json({
    ok: true,
    data: {
      id: product.id,
      asin: product.asin,
      title: product.title,
      price: product.price,
      last_synced: product.last_synced
    }
  });
});
