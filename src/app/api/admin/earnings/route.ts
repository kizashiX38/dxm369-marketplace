// src/app/api/admin/earnings/route.ts
// Admin Earnings API
// Protected endpoint for earnings dashboard data

import { NextRequest, NextResponse } from "next/server";
import {
  getEarningsSummary,
  getDailyEarningsLast30,
  getEarningsByTrackingId,
  getEarningsSummaryForDateRange,
  getEPCLeaderboard,
  getConversionRateLeaderboard,
} from "@/lib/services/earningsAnalytics";
import { apiSafe, safeQueryParse } from "@/lib/apiSafe";
import { securityConfig } from "@/lib/env";

export const GET = apiSafe(async (request: NextRequest) => {
  // Verify admin access
  const adminKey = request.headers.get("x-admin-key");
  const secret = securityConfig.adminSecret;

  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = safeQueryParse(request);
  const action = searchParams.get("action") || "all";
  const days = parseInt(searchParams.get("days") || "30", 10);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (action === "summary") {
    const data = startDate && endDate
      ? await getEarningsSummaryForDateRange(startDate, endDate)
      : await getEarningsSummary();
    return NextResponse.json({ ok: true, data });
  }

  if (action === "daily") {
    const data = await getDailyEarningsLast30(days);
    return NextResponse.json({ ok: true, data });
  }

  if (action === "tracking") {
    const data = await getEarningsByTrackingId();
    return NextResponse.json({ ok: true, data });
  }

  if (action === "epc-leaderboard") {
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const data = await getEPCLeaderboard(limit);
    return NextResponse.json({ ok: true, data });
  }

  if (action === "conversion-leaderboard") {
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const data = await getConversionRateLeaderboard(limit);
    return NextResponse.json({ ok: true, data });
  }

  // Return all metrics
  const [summary, daily, tracking] = await Promise.all([
    getEarningsSummary(),
    getDailyEarningsLast30(30),
    getEarningsByTrackingId(),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      summary,
      daily,
      tracking,
    }
  });
});
