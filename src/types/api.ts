// src/types/api.ts
// TypeScript guard for API responses

import type { DXMProduct } from "@/lib/types/product";

/**
 * DXMProductResponse - Type guard for API responses
 * All /api/dxm/products/* routes return DXMProduct[]
 */
export type DXMProductResponse = DXMProduct[];

