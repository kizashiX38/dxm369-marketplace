// src/lib/apiSafe.ts
// DXM369 Global API Error Handler
// Wraps API route handlers to ensure consistent error responses
// Never exposes raw errors to clients

import { NextRequest, NextResponse } from "next/server";
import { log } from "./log";
import { appConfig } from "./env";

type ApiHandler = (
  req: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

/**
 * DXM369 Safe API Wrapper
 * 
 * Wraps API route handlers with:
 * - Try/catch error handling
 * - Structured error responses
 * - Local error logging
 * - No raw stack traces exposed
 * 
 * Usage:
 * ```ts
 * export const GET = apiSafe(async (req) => {
 *   const data = await fetchData();
 *   return NextResponse.json({ ok: true, data });
 * });
 * ```
 */
export function apiSafe(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      const response = await handler(req, context);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Log error locally (never expose to client)
      log.error("[API_ERROR]", {
        path: req.nextUrl.pathname,
        method: req.method,
        error: err.message,
        stack: appConfig.isDevelopment ? err.stack : undefined,
      });

      // Return safe, structured error response
      return NextResponse.json(
        {
          ok: false,
          error: "Internal Server Error",
          message: appConfig.isDevelopment 
            ? err.message 
            : "An error occurred processing your request",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * DXM369 Safe JSON Parser
 * 
 * Safely parses JSON from request body with error handling
 */
export async function safeJsonParse<T = unknown>(
  req: NextRequest
): Promise<T | null> {
  try {
    const body = await req.json();
    return body as T;
  } catch (error) {
    log.warn("[API_JSON_PARSE_ERROR]", {
      path: req.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * DXM369 Safe Query Parser
 * 
 * Safely extracts query parameters
 */
export function safeQueryParse(req: NextRequest): URLSearchParams {
  return req.nextUrl.searchParams;
}

