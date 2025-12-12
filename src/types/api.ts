// src/types/api.ts
// TypeScript guard for API responses

import type { DXMProduct } from "@/lib/types/product";

/**
 * DXMProductResponse - API response shape for /api/dxm/products/* routes
 * Supports legacy array responses and structured { ok, data, error } objects.
 */
export type DXMProductResponse =
  | DXMProduct[]
  | {
      ok: boolean;
      data: DXMProduct[];
      error?: string;
    };

/**
 * Normalize DXM product API responses to an array.
 */
export function extractProductsFromResponse(
  payload: DXMProductResponse
): DXMProduct[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}
