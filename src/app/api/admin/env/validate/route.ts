// src/app/api/admin/env/validate/route.ts
// Environment Validation API Endpoint
// Returns detailed environment validation status

import { NextRequest, NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { env } from "@/lib/env";
import { log } from "@/lib/log";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = apiSafe(async (request: NextRequest) => {
  // Verify admin access using centralized environment access
  const adminKey = request.headers.get("x-admin-key");

  // In development, allow without secret
  const isDevelopment = env.NODE_ENV === "development";
  
  if (!isDevelopment && (!env.ADMIN_SECRET || adminKey !== env.ADMIN_SECRET)) {
    log.warn("[ENV_VALIDATION_ACCESS_DENIED]", {
      hasAdminKey: !!adminKey,
      hasSecret: !!env.ADMIN_SECRET,
      isDevelopment
    });
    
    return NextResponse.json({ 
      ok: false,
      error: "Unauthorized" 
    }, { status: 403 });
  }

  // Lazy import to avoid build-time issues
  const { validateEnvironment, getEnvironmentReadinessScore } = await import("@/lib/env");
  
  const validation = validateEnvironment();
  const score = getEnvironmentReadinessScore();

  // Get service status
  const services = {
    database: {
      configured: !!env.DATABASE_URL,
      url: env.DATABASE_URL ? "***configured***" : "not set",
    },
    amazon: {
      configured: !!(env.AMAZON_ACCESS_KEY_ID && env.AMAZON_SECRET_ACCESS_KEY),
      accessKeyId: env.AMAZON_ACCESS_KEY_ID ? "***configured***" : "not set",
      associateTag: env.AMAZON_ASSOCIATE_TAG || "not set",
    },
    email: {
      configured: !!env.SENDGRID_API_KEY,
      apiKey: env.SENDGRID_API_KEY ? "***configured***" : "not set",
    },
    security: {
      configured: !!(env.ADMIN_SECRET && env.APP_SECRET && env.JWT_SECRET),
      adminSecret: env.ADMIN_SECRET ? "***configured***" : "not set",
      appSecret: env.APP_SECRET ? "***configured***" : "not set",
      jwtSecret: env.JWT_SECRET ? "***configured***" : "not set",
      rateLimitSecret: env.RATE_LIMIT_SECRET ? "***configured***" : "not set",
    },
  };

  return NextResponse.json({
    ok: true,
    data: {
      validation: {
        valid: validation.valid,
        score,
        errors: validation.errors,
        warnings: validation.warnings,
        missing: validation.missing,
        configured: validation.configured,
      },
      environment: {
        nodeEnv: env.NODE_ENV,
        publicEnv: env.NEXT_PUBLIC_ENV,
        siteUrl: env.NEXT_PUBLIC_SITE_URL,
      },
      services
    }
  });
});

