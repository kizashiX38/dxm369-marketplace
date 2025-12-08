// POST /api/admin/products/toggleVisible
// Toggle product visibility

import { NextRequest, NextResponse } from "next/server";
import { updateProductVisibility, getProductById } from "@/lib/services/adminProducts";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ id: number; visible: boolean }>(request);
  
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { id, visible } = body;

  if (!id || visible === undefined) {
    return NextResponse.json(
      { ok: false, error: "Missing id or visible" },
      { status: 400 }
    );
  }

  // Verify product exists
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: "Product not found" },
      { status: 404 }
    );
  }

  // Update visibility
  await updateProductVisibility(id, visible);

  return NextResponse.json({
    ok: true,
    data: { id, visible }
  });
});
