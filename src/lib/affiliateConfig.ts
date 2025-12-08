/**
 * DXM369 Affiliate Configuration
 *
 * Single source of truth for all Amazon affiliate link generation,
 * partner tags, tracking IDs, and revenue attribution.
 *
 * All Amazon links MUST use buildAmazonProductUrl() from this module
 * to ensure proper tracking and centralized configuration management.
 */

import { publicConfig } from "./env-client";

/**
 * Partner Tag (Store ID) - Used in all Amazon affiliate URLs
 * Format: ?tag=dxm369-20
 *
 * This is YOUR Amazon Associates Store ID
 * Commissions flow to this ID when customers buy after clicking your links
 */
export const PARTNER_TAG = publicConfig.associateTag;

/**
 * Base Tracking Tag - Foundation for intelligent tracking ID generation
 * Used by trackingIdRouter to create context-aware variants:
 * - dxm369-gpus-20 (GPU category)
 * - dxm369-cpu-20 (CPU category)
 * - dxm369-seo-20 (SEO traffic source)
 * - dxm369-review-20 (Review intent)
 * etc.
 */
export const TRACKING_BASE_TAG = publicConfig.trackingBaseTag;

/**
 * Amazon domain mapping for regional affiliate programs
 * Allows redirecting users to their regional Amazon store
 * while preserving your affiliate tag
 */
export const AMAZON_DOMAINS = {
  us: "amazon.com",
  uk: "amazon.co.uk",
  de: "amazon.de",
  fr: "amazon.fr",
  ca: "amazon.ca",
  au: "amazon.com.au",
  jp: "amazon.co.jp",
  in: "amazon.in",
  mx: "amazon.com.mx",
  br: "amazon.com.br",
  sa: "amazon.sa",
  ae: "amazon.ae",
} as const;

export type AmazonRegion = keyof typeof AMAZON_DOMAINS;

/**
 * Default region for affiliate links (can be overridden per request)
 */
export const DEFAULT_REGION: AmazonRegion = "us";

/**
 * Category mapping for intelligent tracking
 * Maps product categories to optimized tracking IDs
 */
export const CATEGORY_TRACKING_MAP = {
  gpu: { tag: "gpus", label: "Graphics Cards" },
  cpu: { tag: "cpu", label: "Processors" },
  laptop: { tag: "laptops", label: "Laptops" },
  storage: { tag: "storage", label: "Storage" },
  mobo: { tag: "mobo", label: "Motherboards" },
  ram: { tag: "ram", label: "Memory" },
  psu: { tag: "psu", label: "Power Supplies" },
  monitor: { tag: "monitors", label: "Monitors" },
  cooling: { tag: "cooling", label: "Cooling" },
  case: { tag: "case", label: "Cases" },
} as const;

/**
 * Source attribution mapping
 * Maps traffic sources to tracking variants
 */
export const SOURCE_TRACKING_MAP = {
  seo: "seo",
  youtube: "youtube",
  twitter: "x",
  instagram: "ig",
  blog: "content",
  social: "social",
  email: "email",
  direct: "direct",
} as const;

/**
 * Intent mapping for conversion optimization
 * Different purchase intents convert at different rates
 */
export const INTENT_TRACKING_MAP = {
  review: "review",
  top10: "top10",
  comparison: "compare",
  deal: "deal",
  browse: "main",
} as const;

/**
 * Validation: Ensure PARTNER_TAG is properly configured
 * Warns in development if using fallback
 */
import { appConfig } from "./env";

export function validateAffiliateConfig(): { valid: boolean; message: string } {
  if (!PARTNER_TAG || PARTNER_TAG === "dxm369-20") {
    if (appConfig.isDevelopment) {
      console.warn(
        "[Affiliate Config] Using default PARTNER_TAG: dxm369-20. " +
          "Ensure NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG is set in production."
      );
    }
  }

  if (!TRACKING_BASE_TAG || TRACKING_BASE_TAG === "dxm369") {
    if (appConfig.isDevelopment) {
      console.warn(
        "[Affiliate Config] Using default TRACKING_BASE_TAG: dxm369. " +
          "Ensure NEXT_PUBLIC_TRACKING_BASE_TAG is set in production."
      );
    }
  }

  return {
    valid: !!PARTNER_TAG && !!TRACKING_BASE_TAG,
    message: `Affiliate Config: tag=${PARTNER_TAG}, base=${TRACKING_BASE_TAG}`,
  };
}

/**
 * Build Amazon product URL with affiliate tracking
 * MUST be used for all Amazon links to ensure proper attribution
 *
 * @param asin - Amazon Standard Identification Number
 * @param region - Optional region (defaults to 'us')
 * @param trackingTag - Optional tracking tag override (normally auto-detected)
 * @returns Full Amazon product URL with affiliate tag
 *
 * @example
 * // Basic usage
 * buildAmazonLink("B0CFHX8JTL")
 * // → https://www.amazon.com/dp/B0CFHX8JTL?tag=dxm369-20
 *
 * // With tracking override
 * buildAmazonLink("B0CFHX8JTL", "us", "dxm369-gpus-20")
 * // → https://www.amazon.com/dp/B0CFHX8JTL?tag=dxm369-gpus-20
 *
 * // Regional
 * buildAmazonLink("B0CFHX8JTL", "uk")
 * // → https://www.amazon.co.uk/dp/B0CFHX8JTL?tag=dxm369-20
 */
export function buildAmazonLink(
  asin: string,
  region: AmazonRegion = DEFAULT_REGION,
  trackingTag: string = PARTNER_TAG
): string {
  const domain = AMAZON_DOMAINS[region];
  if (!domain) {
    console.warn(`[Affiliate] Unknown region: ${region}, using US`);
    return buildAmazonLink(asin, "us", trackingTag);
  }

  const url = new URL(`https://www.${domain}/dp/${asin}`);
  url.searchParams.set("tag", trackingTag);
  return url.toString();
}

/**
 * Log affiliate configuration for debugging
 * Run this in development to verify setup
 */
export function logAffiliateConfig(): void {
  const config = validateAffiliateConfig();
  console.log("════════════════════════════════════════");
  console.log("🎯 DXM369 AFFILIATE CONFIGURATION");
  console.log("════════════════════════════════════════");
  console.log(`✓ Partner Tag: ${PARTNER_TAG}`);
  console.log(`✓ Tracking Base: ${TRACKING_BASE_TAG}`);
  console.log(`✓ Default Region: ${DEFAULT_REGION}`);
  console.log(`✓ Status: ${config.valid ? "VALID ✅" : "INVALID ⚠️"}`);
  console.log(`ℹ️  Message: ${config.message}`);
  console.log("════════════════════════════════════════");
}
