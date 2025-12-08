// src/app/api/dxm/click/route.ts
// DXM Affiliate Click Tracking API
// Wired to PostgreSQL via clickTracking service

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";
import { log } from "@/lib/log";
import { recordClick, getClickAnalytics } from "@/lib/services/clickTracking";

export const dynamic = 'force-dynamic';

interface ClickEventBody {
  asin: string;
  category: string;
  price: number;
  dxmScore: number;
  source?: string;
  sessionId?: string;
  userAgent?: string;
}

export const POST = apiSafe(async (req: NextRequest) => {
  const body = await safeJsonParse<ClickEventBody>(req);

  // Validate required fields
  if (!body?.asin || !body.category) {
    return NextResponse.json({
      ok: false,
      error: "ASIN and category are required"
    }, { status: 400 });
  }

  // Extract client info
  const userAgent = req.headers.get("user-agent") || undefined;
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
  const referer = req.headers.get("referer") || undefined;

  // Hash IP for privacy (simple hash, production should use crypto)
  const ipHash = clientIP 
    ? Buffer.from(clientIP).toString('base64').substring(0, 16)
    : undefined;

  // Build click event
  const clickEvent = {
    asin: body.asin,
    category: body.category,
    price: body.price,
    dxmScore: body.dxmScore,
    source: body.source || "unknown",
    userAgent: body.userAgent || userAgent,
    ipHash,
    referrer: referer,
  };

  // Record click to database (gracefully handles missing DB)
  const recorded = await recordClick(clickEvent);

  log.info("[DXM_CLICK_RECORDED]", {
    asin: body.asin,
    category: body.category,
    dxmScore: body.dxmScore,
    source: body.source,
    tracked: !!recorded
  });

  // Always return success to avoid blocking UX
  return NextResponse.json({ 
    ok: true,
    data: {
      tracked: !!recorded,
      sessionId: body.sessionId
    }
  }, { status: 200 });
});

export const GET = apiSafe(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe") || "day";
  
  // Validate timeframe
  const validTimeframes = ['hour', 'day', 'week', 'month'];
  const tf = validTimeframes.includes(timeframe) ? timeframe as 'hour' | 'day' | 'week' | 'month' : 'day';
  
  // Get analytics from database
  const analytics = await getClickAnalytics(tf);
  
  return NextResponse.json({
    ok: true,
    data: {
      timeframe: tf,
      analytics
    }
  });
});
