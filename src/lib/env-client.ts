// src/lib/env-client.ts
// CLIENT-SAFE Environment Configuration
// Safe to import in client components (only exposes NEXT_PUBLIC_* values)
// DO NOT import server secrets here

import { publicConfig as envPublicConfig } from "./env";

/**
 * Client-safe public configuration
 * These values are safe to expose to the browser
 * Re-exported from env.ts for consistency
 */
export const publicConfig = envPublicConfig;

