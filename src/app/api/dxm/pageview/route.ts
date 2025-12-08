// src/app/api/dxm/pageview/route.ts
// DXM Page View Tracking API

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";
import { log } from "@/lib/log";

interface PageViewBody {
  page?: string;
  category?: string;
  source?: string;
  sessionId?: string;
  ts?: string;
  referrer?: string;
}

export const POST = apiSafe(async (req: NextRequest) => {
  const body = await safeJsonParse<PageViewBody>(req);
  
  if (!body) {
    return NextResponse.json({ 
      ok: false,
      error: "Invalid JSON in request body" 
    }, { status: 400 });
  }

  const trackingEvent = {
    type: "page_view",
    page: body.page,
    category: body.category,
    source: body.source,
    sessionId: body.sessionId,
    timestamp: body.ts || new Date().toISOString(),
    userAgent: req.headers.get("user-agent") || "unknown",
    clientIP: req.headers.get("x-forwarded-for") || "unknown",
    referer: body.referrer || req.headers.get("referer") || "direct",
  };

  log.info("[DXM_PAGE_VIEW]", { trackingEvent });

  return NextResponse.json({ 
    ok: true
  }, { status: 200 });
});
