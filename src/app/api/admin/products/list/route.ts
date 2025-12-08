// GET /api/admin/products/list
// List products with optional filtering

import { NextRequest, NextResponse } from "next/server";
import { getProductList } from "@/lib/services/adminProducts";
import { apiSafe, safeQueryParse } from "@/lib/apiSafe";

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const category = searchParams.get("category") || undefined;
  const visible = searchParams.get("visible");

  const products = await getProductList({
    category: category,
    visible: visible !== null ? visible === "true" : undefined
  });

  return NextResponse.json({
    ok: true,
    data: products
  });
});
