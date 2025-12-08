// src/lib/dealRadarTypes.ts
// CLIENT-SAFE: Types and pure utility functions only
// NO server-only imports (no pg, db, amazonPAAPI, etc.)

import { buildAmazonProductUrl } from "@/lib/affiliate";

export type HardwareCategory = "gpu" | "cpu" | "laptop" | "monitor" | "psu" | "motherboard" | "ram" | "ssd" | "case" | "cooling" | "keyboard" | "mouse" | "headset";

export interface DealRadarItem {
  id: string;          // internal DXM ID
  asin: string;        // Amazon ASIN
  title: string;
  brand: string;
  category: HardwareCategory;
  price: number;       // current price (USD or local)
  previousPrice?: number;
  dxmScore: number;    // 0–10 DXM Value Score
  vram?: string;
  tdp?: string;
  boostClock?: string;
  baseClock?: string;
  cores?: string;
  threads?: string;
  memory?: string;
  storage?: string;
  display?: string;
  imageUrl?: string;
  domain?: "com" | "sa" | "ae";
  tags?: string[];
  trend?: number[];    // for sparkline
  availability?: "In Stock" | "Limited Stock" | "Out of Stock";
  primeEligible?: boolean;
  vendor?: string;
}

/**
 * Add affiliate URL to deal (client-safe utility)
 */
export function withAffiliateUrl(deal: DealRadarItem, context?: { source?: string; intent?: string }) {
  return {
    ...deal,
    affiliateUrl: buildAmazonProductUrl(deal.asin, {
      domain: deal.domain ?? "com",
      context: context ? {
        category: deal.category as any,
        source: context.source as any,
        intent: context.intent as any,
        pageType: 'product',
      } : undefined,
    }),
  };
}

/**
 * Calculate savings percentage (client-safe utility)
 */
export function calculateSavingsPercent(deal: DealRadarItem): number | null {
  if (!deal.previousPrice || deal.previousPrice <= deal.price) return null;
  return Math.round(((deal.previousPrice - deal.price) / deal.previousPrice) * 100);
}

/**
 * Get DXM score color class (client-safe utility)
 */
export function getDXMScoreColor(score: number): string {
  // v2: Enhanced color coding with more granular ranges
  if (score >= 9.50) return "text-emerald-200 border-emerald-400/70 bg-emerald-400/15"; // Exceptional
  if (score >= 9.00) return "text-emerald-300 border-emerald-500/60 bg-emerald-500/10"; // Excellent
  if (score >= 8.50) return "text-cyan-200 border-cyan-400/70 bg-cyan-400/15";         // Very Good
  if (score >= 8.00) return "text-cyan-300 border-cyan-500/60 bg-cyan-500/10";         // Good
  if (score >= 7.50) return "text-blue-300 border-blue-500/60 bg-blue-500/10";         // Above Average
  if (score >= 7.00) return "text-amber-300 border-amber-500/60 bg-amber-500/10";      // Average
  if (score >= 6.00) return "text-orange-300 border-orange-500/60 bg-orange-500/10";   // Below Average
  return "text-rose-300 border-rose-500/60 bg-rose-500/10";                            // Poor
}

/**
 * Get DXM score label (client-safe utility)
 */
export function getDXMScoreLabel(score: number): string {
  // v2: Human-readable score labels
  if (score >= 9.50) return "Exceptional";
  if (score >= 9.00) return "Excellent";
  if (score >= 8.50) return "Very Good";
  if (score >= 8.00) return "Good";
  if (score >= 7.50) return "Above Average";
  if (score >= 7.00) return "Average";
  if (score >= 6.00) return "Below Average";
  return "Poor";
}

