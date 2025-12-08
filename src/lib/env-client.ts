// src/lib/env-client.ts
// CLIENT-SAFE Environment Configuration
// Safe to import in client components (only exposes NEXT_PUBLIC_* values)
// DO NOT import server secrets here
// WARNING: Never import from env.ts in this file - causes bundling of secrets!

/**
 * Client-safe public configuration
 * These values are safe to expose to the browser
 * Only uses NEXT_PUBLIC_* environment variables
 */
export const publicConfig = {
  associateTag: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG : '') || 'dxm369-20',
  trackingBaseTag: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_TRACKING_BASE_TAG : '') || 'dxm369',
  siteUrl: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : '') || 'http://localhost:3000',
  baseUrl: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BASE_URL : '') || (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : '') || 'http://localhost:3000',
  environment: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_ENV : '') || 'development',
  adminKey: (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_ADMIN_KEY : '') || '',
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

