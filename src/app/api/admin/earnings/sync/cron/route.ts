// src/app/api/admin/earnings/sync/cron/route.ts
// Vercel Cron Job Endpoint for Automated Earnings Sync
// Runs daily at 2 AM UTC

import { NextRequest, NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { env, securityConfig, trackingConfig, amazonConfig, appConfig } from "@/lib/env";

export const dynamic = 'force-dynamic';

export const GET = apiSafe(async (request: NextRequest) => {
  // Verify this is a Vercel Cron request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${securityConfig.cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startDate = yesterday.toISOString().split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

  // Get tracking IDs from environment or use default
  const trackingIds = trackingConfig.trackingIds.length > 0
    ? trackingConfig.trackingIds
    : [amazonConfig.publicAssociateTag || "dxm369-20"];

  // Call the sync endpoint internally
  const baseUrl = appConfig.baseUrl || "http://localhost:3000";

  const syncResponse = await fetch(`${baseUrl}/api/admin/earnings/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": securityConfig.adminSecret || "",
    },
    body: JSON.stringify({
      method: "api",
      trackingIds,
      startDate,
      endDate,
    }),
  });

  if (!syncResponse.ok) {
    const errorText = await syncResponse.text().catch(() => "Unknown error");
    throw new Error(`Sync failed (${syncResponse.status}): ${errorText}`);
  }

  const syncData = await syncResponse.json().catch(() => ({ ok: false, error: "Invalid JSON response" }));

  return NextResponse.json({
    ok: true,
    data: {
      message: `Synced earnings for ${startDate} to ${endDate}`,
      ...syncData,
      timestamp: new Date().toISOString(),
    }
  });
});

