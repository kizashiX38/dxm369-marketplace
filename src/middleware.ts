// src/middleware.ts
// DXM369 Admin & Monitor Route Protection
// Header-based authentication for password-free admin access

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityConfig, appConfig } from "./lib/env";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only process protected routes: /admin/* and /dxm-monitor
  const isProtected = pathname.startsWith("/admin") || pathname === "/dxm-monitor";
  if (!isProtected) {
    return NextResponse.next();
  }

  const isDevelopment = appConfig.isDevelopment;

  // In development, always allow access for easier testing
  if (isDevelopment) {
    return NextResponse.next();
  }

  // Production: Check admin secret
  const secret = securityConfig.adminSecret;

  // If no secret configured, disable admin access entirely
  if (!secret) {
    return NextResponse.json(
      {
        error: "Admin access not configured",
        message: "Set ADMIN_SECRET in your environment variables to enable admin access"
      },
      { status: 503 }
    );
  }

  // Validate provided key
  const provided = request.headers.get("x-admin-key");
  if (!provided || provided !== secret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  // Authenticated successfully
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dxm-monitor"],
};

