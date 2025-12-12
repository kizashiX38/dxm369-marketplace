/**
 * DXM Affiliate Link Utility - Revenue System v2
 * 
 * Elite tracking ID routing with context-aware affiliate link generation
 * Transforms clicks into attributed revenue streams
 */

import { getTrackingId, TrackingContext } from "./trackingIdRouter";
import { publicConfig } from "./env-client";

export const AMAZON_ASSOCIATE_TAG = publicConfig.associateTag;

export type AmazonDomain =
  | "com"
  | "sa"
  | "ae"
  | "co.uk"
  | "de"
  | "fr"
  | "ca"
  | "jp";

interface BuildAffiliateUrlOptions {
  domain?: AmazonDomain;
  extraQuery?: Record<string, string | number | boolean | undefined>;
  // Context for intelligent tracking ID routing
  context?: TrackingContext;
  // Override tracking ID (if you want to force a specific ID)
  trackingId?: string;
}

/**
 * Build a DXM-compliant Amazon product URL with intelligent tracking ID.
 * 
 * Automatically selects the optimal tracking ID based on:
 * - Traffic source (SEO, social, YouTube, etc.)
 * - Product category (GPU, CPU, storage, etc.)
 * - User intent (review, top10, browse, etc.)
 * - Geographic region (US, UK, CA, etc.)
 * 
 * DXM rule: we NEVER forget `tag`, and we always use context-aware routing.
 */
export function buildAmazonProductUrl(
  asin: string,
  options: BuildAffiliateUrlOptions = {},
): string {
  const domain = options.domain ?? "com";

  const base = new URL(`https://www.amazon.${domain}/dp/${asin}`);

  // Always use the valid Amazon Associate Tag
  // NOTE: Category-specific tags like dxm369-gpus-20 don't exist in Amazon account
  // Only dxm369-20 is valid and active
  const trackingId =
    options.trackingId ||
    (options.context ? getTrackingId(options.context) : AMAZON_ASSOCIATE_TAG);

  // Always attach affiliate tag
  base.searchParams.set("tag", trackingId);

  // Optional extras (e.g. ref, language, campaign codes)
  if (options.extraQuery) {
    for (const [key, value] of Object.entries(options.extraQuery)) {
      if (value !== undefined) {
        base.searchParams.set(key, String(value));
      }
    }
  }

  return base.toString();
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use buildAmazonProductUrl instead
 */
export function getAffiliateLink(asin: string): string {
  return buildAmazonProductUrl(asin);
}

/**
 * Validates if an ASIN is in correct format (10 characters, alphanumeric)
 */
export function isValidASIN(asin: string): boolean {
  return /^[A-Z0-9]{10}$/.test(asin);
}

/**
 * Extract ASIN from Amazon URL
 */
export function extractASINFromUrl(url: string): string | null {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}
