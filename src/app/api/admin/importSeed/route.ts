// POST /api/admin/importSeed
// Import products from asin-seed.json into PostgreSQL

import { NextRequest, NextResponse } from "next/server";
import { importFromSeedFile } from "@/lib/services/adminProducts";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ seedData: any }>(request);
  
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { seedData } = body;

  if (!seedData) {
    return NextResponse.json(
      { ok: false, error: "Missing seedData" },
      { status: 400 }
    );
  }

  const result = await importFromSeedFile(seedData);

  return NextResponse.json({
    ok: true,
    data: result
  });
});
