// src/lib/trackingIdRouter.ts
// DXM369 Elite Tracking ID Router
// Intelligent tracking ID assignment based on context (source, category, intent, geo)
// This is how pros break the Amazon algorithm open.

import { publicConfig } from "./env-client";

export interface TrackingContext {
  // Traffic source
  source?: 'seo' | 'social' | 'youtube' | 'blog' | 'direct' | 'email' | 'twitter' | 'instagram';

  // Product category
  category?: 'gpu' | 'cpu' | 'laptop' | 'storage' | 'mobo' | 'ram' | 'psu' | 'monitor' | 'cooling' | 'case';

  // User intent level
  intent?: 'review' | 'top10' | 'browse' | 'comparison' | 'deal';

  // Geographic region
  geo?: 'us' | 'uk' | 'ca' | 'de' | 'sa' | 'ae';

  // Page type
  pageType?: 'product' | 'category' | 'review' | 'comparison' | 'home';

  // Additional metadata
  metadata?: {
    isFeatured?: boolean;
    isTrending?: boolean;
    segment?: string;
  };
}

/**
 * DXM369 Tracking ID Strategy
 * 
 * Creates intelligent tracking IDs based on:
 * 1. Source (where traffic came from)
 * 2. Category (which product category)
 * 3. Intent (user's state of mind)
 * 4. Geo (geographic region)
 * 
 * This enables:
 * - Revenue attribution
 * - A/B testing
 * - Category intelligence
 * - Traffic-source mapping
 * - EPC/CR optimization
 */
export class TrackingIdRouter {
  private baseTag: string;

  constructor(baseTag: string = 'dxm369') {
    this.baseTag = baseTag;
  }

  /**
   * Get the tracking ID for affiliate links.
   * 
   * IMPORTANT: As of 2024-12-19, ALL category/source/intent/geo-based routing
   * is DISABLED to prevent revenue leakage from unvalidated tracking IDs.
   * 
   * Only the canonical tag (dxm369-20) is active in Amazon Associates.
   * Category-specific tags (dxm369-gpus-20, dxm369-cpu-20, etc.) were never
   * registered and caused $0 commission on all clicks.
   * 
   * To re-enable category routing:
   * 1. Register each tag in Amazon Associates Central
   * 2. Verify ACTIVE status for each tag
   * 3. Uncomment the routing logic below
   * 
   * @param _context - Ignored (kept for API compatibility)
   * @returns The canonical tracking ID: dxm369-20
   */
  getTrackingId(_context: TrackingContext): string {
    // SAFETY: Always return the canonical, validated tracking ID
    // This ensures 100% of clicks generate commissions
    return `${this.baseTag}-20`;

    // ==========================================================================
    // DISABLED: Category/Source/Intent/Geo routing (causes revenue leakage)
    // ==========================================================================
    // 
    // To re-enable after validating tags in Amazon Associates:
    // 
    // // 1. INTENT-BASED (highest priority - most predictive of conversion)
    // if (context.intent === 'review') {
    //   return `${this.baseTag}-review-20`;
    // }
    // if (context.intent === 'top10') {
    //   return `${this.baseTag}-top10-20`;
    // }
    // if (context.intent === 'comparison') {
    //   return `${this.baseTag}-compare-20`;
    // }
    // if (context.intent === 'deal') {
    //   return `${this.baseTag}-deal-20`;
    // }
    //
    // // 2. CATEGORY-BASED (high value - category performance varies massively)
    // if (context.category) {
    //   const categoryMap: Record<string, string> = {
    //     'gpu': `${this.baseTag}-gpus-20`,
    //     'cpu': `${this.baseTag}-cpu-20`,
    //     'laptop': `${this.baseTag}-laptops-20`,
    //     'storage': `${this.baseTag}-storage-20`,
    //     'mobo': `${this.baseTag}-mobo-20`,
    //     'ram': `${this.baseTag}-ram-20`,
    //     'psu': `${this.baseTag}-psu-20`,
    //     'monitor': `${this.baseTag}-monitors-20`,
    //     'cooling': `${this.baseTag}-cooling-20`,
    //     'case': `${this.baseTag}-case-20`,
    //   };
    //   
    //   if (categoryMap[context.category]) {
    //     return categoryMap[context.category];
    //   }
    // }
    //
    // // 3. SOURCE-BASED (traffic quality indicator)
    // if (context.source) {
    //   const sourceMap: Record<string, string> = {
    //     'seo': `${this.baseTag}-seo-20`,
    //     'youtube': `${this.baseTag}-youtube-20`,
    //     'twitter': `${this.baseTag}-x-20`,
    //     'instagram': `${this.baseTag}-ig-20`,
    //     'blog': `${this.baseTag}-content-20`,
    //     'social': `${this.baseTag}-social-20`,
    //     'email': `${this.baseTag}-email-20`,
    //     'direct': `${this.baseTag}-direct-20`,
    //   };
    //   
    //   if (sourceMap[context.source]) {
    //     return sourceMap[context.source];
    //   }
    // }
    //
    // // 4. GEO-BASED (for multi-region operations)
    // if (context.geo && context.geo !== 'us') {
    //   const geoMap: Record<string, string> = {
    //     'uk': `${this.baseTag}-uk-21`,
    //     'ca': `${this.baseTag}-ca-20`,
    //     'de': `${this.baseTag}-de-21`,
    //     'sa': `${this.baseTag}-sa-20`,
    //     'ae': `${this.baseTag}-ae-20`,
    //   };
    //   
    //   if (geoMap[context.geo]) {
    //     return geoMap[context.geo];
    //   }
    // }
    //
    // // 5. DEFAULT (main website traffic)
    // return `${this.baseTag}-main-20`;
  }

  /**
   * Get tracking ID for a product page
   * Automatically detects category and page type
   */
  getProductTrackingId(
    category: string,
    pageType: 'product' | 'review' | 'comparison' = 'product',
    source?: string
  ): string {
    return this.getTrackingId({
      category: category as any,
      intent: pageType === 'review' ? 'review' : pageType === 'comparison' ? 'comparison' : undefined,
      source: source as any,
      pageType,
    });
  }

  /**
   * Get tracking ID for SEO/content pages
   */
  getContentTrackingId(source: string = 'seo'): string {
    return this.getTrackingId({
      source: source as any,
      intent: 'browse',
      pageType: 'category',
    });
  }

  /**
   * Get tracking ID for social media traffic
   */
  getSocialTrackingId(platform: 'twitter' | 'instagram' | 'youtube'): string {
    return this.getTrackingId({
      source: platform === 'twitter' ? 'twitter' : platform === 'instagram' ? 'instagram' : 'youtube',
      pageType: 'home',
    });
  }

  /**
   * Get all configured tracking IDs
   * Useful for earnings sync and analytics
   * 
   * NOTE: As of 2024-12-19, only the canonical tag is active.
   * Other tags are commented out until validated in Amazon Associates.
   */
  getAllTrackingIds(): string[] {
    const base = this.baseTag;
    return [
      // Canonical tag - the ONLY active tracking ID
      `${base}-20`,

      // ==========================================================================
      // DISABLED: These tags are not registered in Amazon Associates
      // Re-enable after validation in Amazon Associates Central
      // ==========================================================================
      // 
      // // Source-based
      // `${base}-main-20`,
      // `${base}-seo-20`,
      // `${base}-content-20`,
      // `${base}-x-20`,
      // `${base}-ig-20`,
      // `${base}-youtube-20`,
      // `${base}-social-20`,
      // `${base}-email-20`,
      // `${base}-direct-20`,
      //
      // // Category-based
      // `${base}-gpus-20`,
      // `${base}-cpu-20`,
      // `${base}-laptops-20`,
      // `${base}-storage-20`,
      // `${base}-mobo-20`,
      // `${base}-ram-20`,
      // `${base}-psu-20`,
      // `${base}-monitors-20`,
      // `${base}-cooling-20`,
      // `${base}-case-20`,
      //
      // // Intent-based
      // `${base}-review-20`,
      // `${base}-top10-20`,
      // `${base}-compare-20`,
      // `${base}-deal-20`,
      //
      // // Geo-based
      // `${base}-uk-21`,
      // `${base}-ca-20`,
      // `${base}-de-21`,
      // `${base}-sa-20`,
      // `${base}-ae-20`,
    ];
  }
}

// Singleton instance
const defaultRouter = new TrackingIdRouter(
  publicConfig.trackingBaseTag
);

/**
 * Get tracking ID from context (convenience function)
 */
export function getTrackingId(context: TrackingContext): string {
  return defaultRouter.getTrackingId(context);
}

/**
 * Get product tracking ID (convenience function)
 */
export function getProductTrackingId(
  category: string,
  pageType: 'product' | 'review' | 'comparison' = 'product',
  source?: string
): string {
  return defaultRouter.getProductTrackingId(category, pageType, source);
}

/**
 * Get all configured tracking IDs (convenience function)
 */
export function getAllTrackingIds(): string[] {
  return defaultRouter.getAllTrackingIds();
}

export default defaultRouter;

