// src/lib/dxmScoring.ts
// DXM Value Score Algorithm v2 - Enterprise Architecture
// "One score to rule the market" - Quantitative trading engine for hardware

export interface DXMScoreInputs {
  // Product basics
  asin: string;
  title: string;
  brand: string;
  category: string;
  segment: string; // 'budget', '1080p-mainstream', '1440p-high', '4k-flagship', 'enthusiast'
  
  // Pricing
  currentPrice: number;
  msrpPrice?: number;
  listPrice?: number;
  priceHistory?: number[]; // last 30 days for momentum analysis
  baselinePrice?: number; // 30-day median
  
  // Performance
  perfIndex: number; // 0-100 normalized performance score
  tdpWatts?: number;
  
  // Trust signals
  amazonRating?: number; // 0-5
  ratingCount?: number;
  brandReputation?: number; // 0-1, manual weight
  
  // Trend data
  clicks7d?: number;
  impressions7d?: number;
  inStock?: boolean;
  socialTrendIndex?: number; // Future: Reddit/YouTube buzz
  
  // Segment medians (for normalization)
  segmentMedians?: {
    perfPerDollar: number;
    perfPerWatt: number;
    ctr: number;
    avgPrice: number;
  };
}

export interface DXMScoreResult {
  performanceValue: number; // 0.00-10.00
  dealQuality: number; // 0.00-10.00
  trustSignal: number; // 0.00-10.00
  efficiency: number; // 0.00-10.00
  trendSignal: number; // 0.00-10.00
  dxmValueScore: number; // 0.00-10.00 final score (2 decimal precision)
  breakdown: string; // human readable explanation
  componentWeights: {
    performance: number;
    deal: number;
    trust: number;
    efficiency: number;
    trend: number;
  };
}

// Enhanced segment medians with v2 precision
const SEGMENT_MEDIANS_V2 = {
  'budget': { 
    perfPerDollar: 0.35, 
    perfPerWatt: 0.45, 
    ctr: 0.018, 
    avgPrice: 250 
  },
  '1080p-mainstream': { 
    perfPerDollar: 0.25, 
    perfPerWatt: 0.35, 
    ctr: 0.025, 
    avgPrice: 400 
  },
  '1440p-high': { 
    perfPerDollar: 0.18, 
    perfPerWatt: 0.28, 
    ctr: 0.032, 
    avgPrice: 700 
  },
  '4k-flagship': { 
    perfPerDollar: 0.12, 
    perfPerWatt: 0.22, 
    ctr: 0.028, 
    avgPrice: 1200 
  },
  'enthusiast': { 
    perfPerDollar: 0.08, 
    perfPerWatt: 0.18, 
    ctr: 0.035, 
    avgPrice: 1600 
  },
};

// Enhanced brand reputation with v2 precision
const BRAND_TRUST_INDEX: Record<string, number> = {
  'NVIDIA': 1.00,
  'AMD': 0.95,
  'INTEL': 0.98,
  'ASUS': 0.92,
  'MSI': 0.90,
  'GIGABYTE': 0.88,
  'EVGA': 0.88,
  'CORSAIR': 0.85,
  'SEASONIC': 0.87,
  'SAMSUNG': 0.94,
  'WESTERN DIGITAL': 0.89,
  'SEAGATE': 0.82,
  'ZOTAC': 0.80,
  'PNY': 0.75,
  'POWERCOLOR': 0.78,
  'XFX': 0.76,
  'unknown': 0.70,
};

/**
 * Enhanced normalization function for v2 precision
 * Ensures cross-category stability and prevents anomalies
 */
function normalizeV2(value: number, segmentMedian: number, min: number = 0, max: number = 10): number {
  if (segmentMedian === 0) return 5.00; // neutral if no median
  
  const ratio = value / segmentMedian;
  const normalized = Math.min(Math.max(ratio * 5, min), max); // 1.0x = 5.0, 2.0x = 10.0
  
  return Math.round(normalized * 100) / 100; // 2 decimal precision
}

/**
 * Clamp function with v2 precision
 */
function clampV2(value: number, min: number, max: number): number {
  return Math.round(Math.min(Math.max(value, min), max) * 100) / 100;
}

/**
 * A) PerformanceValue (40% weight) - v2 Enhanced
 * "How much performance per $ you get vs other products in its segment"
 */
function calculatePerformanceValueV2(inputs: DXMScoreInputs): number {
  const { perfIndex, currentPrice, segment, segmentMedians } = inputs;
  
  if (!perfIndex || !currentPrice || currentPrice <= 0) return 5.00; // neutral
  
  const perfPerDollar = perfIndex / currentPrice;
  const segmentPPD = segmentMedians?.perfPerDollar || 
    SEGMENT_MEDIANS_V2[segment as keyof typeof SEGMENT_MEDIANS_V2]?.perfPerDollar || 0.2;
  
  // Enhanced normalization with segment awareness
  const score = normalizeV2(perfPerDollar, segmentPPD, 0, 10);
  
  // Bonus for exceptional value (>1.5x segment median)
  const ratio = perfPerDollar / segmentPPD;
  const exceptionalBonus = ratio > 1.5 ? Math.min((ratio - 1.5) * 2, 1.0) : 0;
  
  return clampV2(score + exceptionalBonus, 0, 10);
}

/**
 * B) DealQuality (25% weight) - v2 Enhanced
 * "How strong is today's price compared to historical patterns?"
 */
function calculateDealQualityV2(inputs: DXMScoreInputs): number {
  const { currentPrice, baselinePrice, msrpPrice, listPrice, priceHistory } = inputs;
  
  // Use best available reference price
  const referencePrice = baselinePrice || msrpPrice || listPrice || currentPrice * 1.15;
  
  if (currentPrice >= referencePrice) return 3.00; // no deal
  
  // Base discount score
  const rawDiscount = (referencePrice - currentPrice) / referencePrice;
  const discount = clampV2(rawDiscount, 0, 0.50); // cap at 50% discount
  let score = (discount / 0.50) * 8; // up to 8 points for discount
  
  // Price momentum analysis (v2 enhancement)
  if (priceHistory && priceHistory.length >= 7) {
    const recent7d = priceHistory.slice(-7);
    const recent14d = priceHistory.slice(-14, -7);
    
    const avg7d = recent7d.reduce((a, b) => a + b, 0) / recent7d.length;
    const avg14d = recent14d.length > 0 ? recent14d.reduce((a, b) => a + b, 0) / recent14d.length : avg7d;
    
    // Recent price spike penalty
    if (currentPrice > avg7d * 1.05) {
      score -= 2.0; // significant penalty for recent price increases
    }
    
    // Price momentum bonus
    if (avg14d > avg7d && avg7d > currentPrice) {
      const momentumBonus = Math.min(((avg14d - currentPrice) / avg14d) * 5, 2.0);
      score += momentumBonus; // bonus for consistent price drops
    }
    
    // Consecutive drop bonus
    let consecutiveDrops = 0;
    for (let i = priceHistory.length - 1; i > 0; i--) {
      if (priceHistory[i] < priceHistory[i - 1]) {
        consecutiveDrops++;
      } else {
        break;
      }
    }
    
    if (consecutiveDrops >= 5) {
      score += 1.0; // bonus for sustained price decline
    }
  }
  
  return clampV2(score, 0, 10);
}

/**
 * C) TrustSignal (15% weight) - v2 Enhanced
 * "Should the customer trust buying this?"
 */
function calculateTrustSignalV2(inputs: DXMScoreInputs): number {
  const { amazonRating = 4.0, ratingCount = 100, brand, brandReputation } = inputs;
  
  // Rating score component (60% of trust signal)
  const ratingScore = (amazonRating / 5.0) * 6.0; // up to 6 points
  
  // Review count score component (25% of trust signal)
  const reviewCountScore = 
    ratingCount >= 5000 ? 2.5 :
    ratingCount >= 2000 ? 2.0 :
    ratingCount >= 1000 ? 1.5 :
    ratingCount >= 500 ? 1.0 :
    ratingCount >= 100 ? 0.5 : 0.0;
  
  // Brand trust index component (15% of trust signal)
  const brandTrust = brandReputation || 
    BRAND_TRUST_INDEX[brand?.toUpperCase() || 'unknown'] || 0.70;
  const brandScore = brandTrust * 1.5; // up to 1.5 points
  
  const totalScore = ratingScore + reviewCountScore + brandScore;
  
  return clampV2(totalScore, 0, 10);
}

/**
 * D) Efficiency (10% weight) - v2 Enhanced
 * "Does this product waste energy or money?"
 */
function calculateEfficiencyV2(inputs: DXMScoreInputs): number {
  const { perfIndex, tdpWatts, segment, segmentMedians } = inputs;
  
  if (!perfIndex || !tdpWatts || tdpWatts <= 0) return 6.00; // neutral default
  
  const perfPerWatt = perfIndex / tdpWatts;
  const segmentPPW = segmentMedians?.perfPerWatt || 
    SEGMENT_MEDIANS_V2[segment as keyof typeof SEGMENT_MEDIANS_V2]?.perfPerWatt || 0.3;
  
  const score = normalizeV2(perfPerWatt, segmentPPW, 0, 10);
  
  // Bonus for exceptional efficiency
  const ratio = perfPerWatt / segmentPPW;
  const efficiencyBonus = ratio > 1.3 ? Math.min((ratio - 1.3) * 3, 1.5) : 0;
  
  return clampV2(score + efficiencyBonus, 0, 10);
}

/**
 * E) TrendSignal (10% weight) - v2 Enhanced
 * "Is this product currently hot?"
 */
function calculateTrendSignalV2(inputs: DXMScoreInputs): number {
  const { 
    clicks7d = 0, 
    impressions7d = 1, 
    priceHistory, 
    segment, 
    segmentMedians,
    socialTrendIndex = 0 
  } = inputs;
  
  // CTR deviation component (50% of trend signal)
  const ctr = clicks7d / Math.max(impressions7d, 1);
  const segmentCTR = segmentMedians?.ctr || 
    SEGMENT_MEDIANS_V2[segment as keyof typeof SEGMENT_MEDIANS_V2]?.ctr || 0.025;
  
  const ctrRatio = ctr / segmentCTR;
  const ctrScore = normalizeV2(ctrRatio, 1.0, 0, 5); // up to 5 points
  
  // Price momentum component (30% of trend signal)
  let momentumScore = 0;
  if (priceHistory && priceHistory.length >= 7) {
    const recent = priceHistory[priceHistory.length - 1];
    const weekAgo = priceHistory[priceHistory.length - 7];
    
    if (weekAgo > recent) {
      const priceDropLast7d = (weekAgo - recent) / weekAgo;
      
      momentumScore = 
        priceDropLast7d > 0.20 ? 3.0 :
        priceDropLast7d > 0.15 ? 2.5 :
        priceDropLast7d > 0.10 ? 2.0 :
        priceDropLast7d > 0.05 ? 1.5 :
        priceDropLast7d > 0.02 ? 1.0 : 0.5;
    }
  }
  
  // Social trend component (20% of trend signal) - placeholder for future
  const socialScore = Math.min(socialTrendIndex * 2, 2.0); // up to 2 points
  
  const totalScore = ctrScore + momentumScore + socialScore;
  
  return clampV2(totalScore, 0, 10);
}

/**
 * Main DXM Value Score Calculator v2
 * Enhanced precision, improved normalization, enterprise-grade
 */
export function calculateDXMScoreV2(inputs: DXMScoreInputs): DXMScoreResult {
  const performanceValue = calculatePerformanceValueV2(inputs);
  const dealQuality = calculateDealQualityV2(inputs);
  const trustSignal = calculateTrustSignalV2(inputs);
  const efficiency = calculateEfficiencyV2(inputs);
  const trendSignal = calculateTrendSignalV2(inputs);
  
  // Component weights (v2 specification)
  const weights = {
    performance: 0.40,
    deal: 0.25,
    trust: 0.15,
    efficiency: 0.10,
    trend: 0.10
  };
  
  // Weighted final score with v2 precision
  const dxmValueScore = 
    weights.performance * performanceValue +
    weights.deal * dealQuality +
    weights.trust * trustSignal +
    weights.efficiency * efficiency +
    weights.trend * trendSignal;
  
  // Round to 2 decimal places for professional appearance
  const finalScore = Math.round(dxmValueScore * 100) / 100;
  
  // Generate enhanced breakdown explanation
  const breakdown = generateScoreBreakdownV2({
    performanceValue,
    dealQuality,
    trustSignal,
    efficiency,
    trendSignal,
    dxmValueScore: finalScore,
    inputs
  });
  
  return {
    performanceValue: Math.round(performanceValue * 100) / 100,
    dealQuality: Math.round(dealQuality * 100) / 100,
    trustSignal: Math.round(trustSignal * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    trendSignal: Math.round(trendSignal * 100) / 100,
    dxmValueScore: finalScore,
    breakdown,
    componentWeights: weights
  };
}

function generateScoreBreakdownV2(data: any): string {
  const { performanceValue, dealQuality, trustSignal, efficiency, trendSignal, dxmValueScore, inputs } = data;
  
  const perfRating = 
    performanceValue >= 8.5 ? "Exceptional" : 
    performanceValue >= 7.0 ? "Excellent" : 
    performanceValue >= 5.5 ? "Good" : "Fair";
    
  const dealRating = 
    dealQuality >= 8.0 ? "Outstanding Deal" : 
    dealQuality >= 6.5 ? "Great Value" : 
    dealQuality >= 5.0 ? "Fair Price" : "Overpriced";
  
  const trustRating = 
    trustSignal >= 8.0 ? "Highly Trusted" : 
    trustSignal >= 6.5 ? "Reliable" : 
    trustSignal >= 5.0 ? "Acceptable" : "Risky";
  
  return `DXM ${dxmValueScore}: ${perfRating} performance/$ (${performanceValue.toFixed(2)}), ${dealRating} (${dealQuality.toFixed(2)}), ${trustRating} (${trustSignal.toFixed(2)})`;
}

/**
 * Quick score for existing products (simplified inputs) - v2
 */
export function quickDXMScoreV2(
  perfIndex: number,
  currentPrice: number,
  msrpPrice: number,
  brand: string = "unknown",
  segment: string = "1440p-high"
): number {
  const inputs: DXMScoreInputs = {
    asin: "quick",
    title: "Quick Score v2",
    brand,
    category: "gpu",
    segment,
    currentPrice,
    msrpPrice,
    perfIndex,
    amazonRating: 4.2,
    ratingCount: 500,
    inStock: true
  };
  
  return calculateDXMScoreV2(inputs).dxmValueScore;
}

// Enhanced GPU Performance Index Database (v2 with more models)
export const GPU_PERFORMANCE_INDEX_V2: Record<string, number> = {
  // RTX 40 Series
  'RTX 4090': 100.0,
  'RTX 4080 SUPER': 85.0,
  'RTX 4080': 82.0,
  'RTX 4070 Ti SUPER': 75.0,
  'RTX 4070 Ti': 72.0,
  'RTX 4070 SUPER': 68.0,
  'RTX 4070': 65.0,
  'RTX 4060 Ti 16GB': 58.0,
  'RTX 4060 Ti': 55.0,
  'RTX 4060': 48.0,
  
  // RX 7000 Series
  'RX 7900 XTX': 88.0,
  'RX 7900 XT': 80.0,
  'RX 7800 XT': 70.0,
  'RX 7700 XT': 62.0,
  'RX 7600 XT': 52.0,
  'RX 7600': 45.0,
  
  // RTX 30 Series (legacy but still relevant)
  'RTX 3090 Ti': 92.0,
  'RTX 3090': 90.0,
  'RTX 3080 Ti': 78.0,
  'RTX 3080': 75.0,
  'RTX 3070 Ti': 65.0,
  'RTX 3070': 62.0,
  'RTX 3060 Ti': 55.0,
  'RTX 3060': 45.0,
  'RTX 3050': 35.0,
  
  // RX 6000 Series (legacy)
  'RX 6950 XT': 76.0,
  'RX 6900 XT': 74.0,
  'RX 6800 XT': 70.0,
  'RX 6800': 66.0,
  'RX 6700 XT': 58.0,
  'RX 6600 XT': 50.0,
  'RX 6600': 44.0,
  'RX 6500 XT': 30.0,
};

/**
 * Enhanced GPU model extraction with v2 precision
 */
export function extractGPUModelV2(title: string): string | null {
  const models = Object.keys(GPU_PERFORMANCE_INDEX_V2);
  
  // Sort by length (longest first) to match more specific models first
  const sortedModels = models.sort((a, b) => b.length - a.length);
  
  for (const model of sortedModels) {
    if (title.toUpperCase().includes(model)) {
      return model;
    }
  }
  
  return null;
}

/**
 * Get performance index from GPU title with v2 precision
 */
export function getGPUPerformanceIndexV2(title: string): number {
  const model = extractGPUModelV2(title);
  return model ? GPU_PERFORMANCE_INDEX_V2[model] : 50.0; // default to mid-range
}

/**
 * Enhanced segment classification with v2 logic
 */
export function classifyGPUSegmentV2(title: string, price: number): string {
  // Price-based classification with model awareness
  if (price < 250) return "budget";
  if (price > 1400) return "enthusiast";
  
  // Model-specific overrides
  const model = extractGPUModelV2(title);
  if (model) {
    if (model.includes("4090") || model.includes("7900 XTX")) return "4k-flagship";
    if (model.includes("4080") || model.includes("7900 XT")) return "4k-flagship";
    if (model.includes("4070") || model.includes("7800 XT")) return "1440p-high";
    if (model.includes("4060") || model.includes("7600")) return "1080p-mainstream";
  }
  
  // Fallback to price-based classification
  if (price > 1000) return "4k-flagship";
  if (price > 600) return "1440p-high";
  if (price > 350) return "1080p-mainstream";
  return "budget";
}

// Backward compatibility exports
export const calculateDXMScore = calculateDXMScoreV2;
export const quickDXMScore = quickDXMScoreV2;
export const getGPUPerformanceIndex = getGPUPerformanceIndexV2;
export const extractGPUModel = extractGPUModelV2;
export const GPU_PERFORMANCE_INDEX = GPU_PERFORMANCE_INDEX_V2;