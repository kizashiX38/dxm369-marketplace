// src/app/api/admin/earnings/sync/route.ts
// Earnings Sync API
// Sync Amazon Associates earnings data into database

import { NextRequest, NextResponse } from "next/server";
import {
  saveEarningsReports,
  parseEarningsCSV,
  fetchAmazonEarnings,
  EarningsReport,
} from "@/lib/services/earnings";
import { apiSafe, safeJsonParse, safeQueryParse } from "@/lib/apiSafe";
import { securityConfig } from "@/lib/env";

export const POST = apiSafe(async (request: NextRequest) => {
  // Verify admin access
  const adminKey = request.headers.get("x-admin-key");
  const secret = securityConfig.adminSecret;

  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await safeJsonParse<{
    method: string;
    trackingIds?: string[];
    startDate?: string;
    endDate?: string;
    csvData?: string;
    reports?: any[];
  }>(request);
  
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { method, trackingIds, startDate, endDate, csvData } = body;

  // Validate required fields
  if (!method) {
    return NextResponse.json(
      { ok: false, error: "Method required: 'csv', 'api', or 'manual'" },
      { status: 400 }
    );
  }

  let reports: EarningsReport[] = [];

  switch (method) {
    case "csv":
      // Parse CSV data
      if (!csvData) {
        return NextResponse.json(
          { ok: false, error: "CSV data required for CSV method" },
          { status: 400 }
        );
      }
      reports = parseEarningsCSV(csvData);
      break;

    case "api":
      // Fetch from Amazon Associates API
      if (!trackingIds || !Array.isArray(trackingIds) || trackingIds.length === 0) {
        return NextResponse.json(
          { ok: false, error: "trackingIds array required for API method" },
          { status: 400 }
        );
      }
      if (!startDate || !endDate) {
        return NextResponse.json(
          { ok: false, error: "startDate and endDate required for API method" },
          { status: 400 }
        );
      }
      reports = await fetchAmazonEarnings(trackingIds, startDate, endDate);
      break;

    case "manual":
      // Manual data entry
      if (!body.reports || !Array.isArray(body.reports)) {
        return NextResponse.json(
          { ok: false, error: "reports array required for manual method" },
          { status: 400 }
        );
      }
      reports = body.reports.map((r: any) => ({
        tracking_id: r.tracking_id,
        report_date: r.report_date,
        clicks: r.clicks || 0,
        ordered_items: r.ordered_items || 0,
        shipped_items: r.shipped_items || 0,
        returned_items: r.returned_items || 0,
        revenue: r.revenue || 0,
        commission: r.commission || 0,
        commission_rate: r.commission_rate,
        report_type: r.report_type || "daily",
        source: "manual" as const,
      }));
      break;

    default:
      return NextResponse.json(
        { ok: false, error: "Invalid method. Use 'csv', 'api', or 'manual'" },
        { status: 400 }
      );
  }

  if (reports.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No earnings data to sync" },
      { status: 400 }
    );
  }

  // Save to database
  const result = await saveEarningsReports(reports);

  return NextResponse.json({
    ok: true,
    data: {
      message: `Synced ${result.recordsSynced} earnings reports`,
      ...result,
    }
  });
});

// GET endpoint for sync status
export const GET = apiSafe(async (request: NextRequest) => {
  const adminKey = request.headers.get("x-admin-key");
  const secret = securityConfig.adminSecret;

  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { getLatestSyncStatus } = await import("@/lib/services/earnings");
  const status = await getLatestSyncStatus();

  return NextResponse.json({
    ok: true,
    data: status,
  });
});

