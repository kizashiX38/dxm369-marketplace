// src/app/api/admin/earnings/optimization/route.ts
// Revenue Optimization API
// Returns actionable recommendations for revenue growth

import { NextRequest, NextResponse } from "next/server";
import { generateOptimizationReport, getQuickInsights } from "@/lib/services/revenueOptimization";
import { apiSafe, safeQueryParse } from "@/lib/apiSafe";
import { securityConfig } from "@/lib/env";

export const dynamic = 'force-dynamic';

export const GET = apiSafe(async (request: NextRequest) => {
  // Verify admin access
  const adminKey = request.headers.get("x-admin-key");
  const secret = securityConfig.adminSecret;

  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = safeQueryParse(request);
  const type = searchParams.get("type") || "full"; // "full" | "quick"

  if (type === "quick") {
    const insights = await getQuickInsights();
    return NextResponse.json({
      ok: true,
      data: insights,
    });
  }

  // Full optimization report
  const report = await generateOptimizationReport();

  return NextResponse.json({
    ok: true,
    data: report,
  });
});

