// src/middleware.ts
// DXM369 Admin Route Protection
// Header-based authentication for password-free admin access

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityConfig, appConfig } from "./lib/env";

export function middleware(request: NextRequest) {
  const secret = securityConfig.adminSecret;
  const provided = request.headers.get("x-admin-key");
  const isDevelopment = appConfig.isDevelopment;

  // Protect all /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // In development, always allow access for easier testing
    if (isDevelopment) {
      return NextResponse.next();
    }

    // In production, require authentication if ADMIN_SECRET is set
    if (secret && (!provided || provided !== secret)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // If no secret is set in production, disable access
    if (!secret) {
      return NextResponse.json(
        {
          error: "Admin access not configured",
          message: "Set ADMIN_SECRET in your environment variables to enable admin access"
        },
        { status: 503 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

