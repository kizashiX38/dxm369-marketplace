// src/lib/env-client.ts
// CLIENT-SAFE Environment Configuration
// Safe to import in client components (only exposes NEXT_PUBLIC_* values)
// DO NOT import server secrets here
// WARNING: Never import from env.ts in this file - causes bundling of secrets!

/**
 * Client-safe public configuration
 * These values are safe to expose to the browser
 * Only uses NEXT_PUBLIC_* environment variables
 * 
 * NOTE: NEXT_PUBLIC_* variables are replaced at build time by Next.js
 * and are safe to access directly without typeof window checks.
 */
export const publicConfig = {
  associateTag: process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'dxm369-20',
  trackingBaseTag: process.env.NEXT_PUBLIC_TRACKING_BASE_TAG || 'dxm369',
  // Smart fallback: Vercel preview uses VERCEL_URL, local dev uses localhost
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  environment: process.env.NEXT_PUBLIC_ENV || 'development',
  adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || '',
} as const;

/**
 * App configuration safe for client components
 * Derived from NEXT_PUBLIC_ENV only
 */
export const appConfig = {
  publicEnv: publicConfig.environment,
  siteUrl: publicConfig.siteUrl,
  baseUrl: publicConfig.baseUrl,
  isProduction: publicConfig.environment === 'production',
  isDevelopment: publicConfig.environment !== 'production',
  isStaging: publicConfig.environment === 'staging',
} as const;

