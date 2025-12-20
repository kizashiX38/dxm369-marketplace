// src/app/api/dxm/products/memory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { getCategoryFallback } from "@/lib/categoryFallback";

export const revalidate = 900;

export const GET = apiSafe(async (request: NextRequest) => {
  // For now, always return fallback data until database is populated with memory products
  return NextResponse.json(
    { ok: true, data: getCategoryFallback("MEMORY") },
    {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
});
