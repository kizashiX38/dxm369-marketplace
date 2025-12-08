// src/app/api/admin/newsletter/route.ts
// Admin Newsletter Analytics API
// Protected endpoint for newsletter dashboard data

import { NextRequest, NextResponse } from "next/server";
import {
  getActiveSubscribers,
  getSubscriberGrowth,
  getSubscriberStats,
  getSourceAttribution,
  exportSubscribersCSV,
} from "@/lib/services/newsletterAnalytics";
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
  const action = searchParams.get("action") || "all";
  const format = searchParams.get("format");

  if (action === "export" && format === "csv") {
    const csv = await exportSubscribersCSV();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
      },
    });
  }

  if (action === "subscribers") {
    const data = await getActiveSubscribers();
    return NextResponse.json({ ok: true, data });
  }

  if (action === "growth") {
    const days = parseInt(searchParams.get("days") || "30", 10);
    const data = await getSubscriberGrowth(days);
    return NextResponse.json({ ok: true, data });
  }

  if (action === "stats") {
    const data = await getSubscriberStats();
    return NextResponse.json({ ok: true, data });
  }

  if (action === "sources") {
    const data = await getSourceAttribution();
    return NextResponse.json({ ok: true, data });
  }

  // Return all metrics
  const [subscribers, growth, stats, sources] = await Promise.all([
    getActiveSubscribers(),
    getSubscriberGrowth(30),
    getSubscriberStats(),
    getSourceAttribution(),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      subscribers,
      growth,
      stats,
      sources,
    }
  });
});

