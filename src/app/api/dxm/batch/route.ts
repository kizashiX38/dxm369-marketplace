// src/app/api/dxm/batch/route.ts
// DXM Batch Tracking API for performance optimization

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";
import { log } from "@/lib/log";

export const POST = apiSafe(async (req: NextRequest) => {
  const body = await safeJsonParse<{ events?: any[]; ts?: string }>(req);
  const events = body?.events || [];

  // Process each event in the batch
  for (const event of events) {
    const trackingEvent = {
      ...event,
      batchId: body?.ts,
      userAgent: req.headers.get("user-agent") || "unknown",
      clientIP: req.headers.get("x-forwarded-for") || "unknown",
    };

    log.info("[DXM_BATCH_EVENT]", { trackingEvent });
  }

  return NextResponse.json({ 
    ok: true,
    data: { 
      processed: events.length 
    }
  });
});
