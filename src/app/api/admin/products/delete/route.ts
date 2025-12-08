// POST /api/admin/products/delete
// Delete a product by ID

import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, logSync, getProductById } from "@/lib/services/adminProducts";
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

  // Get product first to log the ASIN
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: "Product not found" },
      { status: 404 }
    );
  }

  // Delete
  await deleteProduct(id);
  await logSync(product.asin, "delete", "success");

  return NextResponse.json({ ok: true });
});
