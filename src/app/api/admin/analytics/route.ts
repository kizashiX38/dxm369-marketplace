// src/app/api/admin/analytics/route.ts
// Admin Analytics API
// Protected endpoint for dashboard data

import { NextRequest, NextResponse } from "next/server";
import {
  getTotalClicks,
  getClicksByCategory,
  getClickTrend,
  getTopProducts,
  getRevenueProjection,
} from "@/lib/services/analytics";
import { apiSafe, safeQueryParse } from "@/lib/apiSafe";
import { env, securityConfig } from "@/lib/env";

export const dynamic = 'force-dynamic';

export const GET = apiSafe(async (request: NextRequest) => {
  // Verify admin access (middleware should handle this, but double-check)
  const adminKey = request.headers.get("x-admin-key");
  const secret = securityConfig.adminSecret;

  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = safeQueryParse(request);
  const metric = searchParams.get("metric") || "all";

  if (metric === "clicks") {
    const stats = await getTotalClicks();
    return NextResponse.json({ ok: true, data: stats });
  }

  if (metric === "categories") {
    const data = await getClicksByCategory();
    return NextResponse.json({ ok: true, data });
  }

  if (metric === "trend") {
    const days = parseInt(searchParams.get("days") || "30", 10);
    const data = await getClickTrend(days);
    return NextResponse.json({ ok: true, data });
  }

  if (metric === "top-products") {
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const data = await getTopProducts(limit);
    return NextResponse.json({ ok: true, data });
  }

  if (metric === "revenue") {
    const data = await getRevenueProjection();
    return NextResponse.json({ ok: true, data });
  }

  // Return all metrics
  const [clicks, categories, trend, topProducts, revenue] = await Promise.all([
    getTotalClicks(),
    getClicksByCategory(),
    getClickTrend(30),
    getTopProducts(10),
    getRevenueProjection(),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      clicks,
      categories,
      trend,
      topProducts,
      revenue,
    }
  });
});

