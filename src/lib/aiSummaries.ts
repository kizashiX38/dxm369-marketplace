// src/lib/aiSummaries.ts
// DXM AI Product Summary Engine
// Generates intelligent, DXM-style product analysis and recommendations

import { DealRadarItem } from "./dealRadar";

export interface AIProductSummary {
  id: string;
  asin: string;
  title: string;
  category: string;
  
  // Core AI Analysis
  intelligentSummary: string;
  dxmAnalysis: string;
  performanceInsights: string;
  valueProposition: string;
  
  // Comparative Analysis
  competitorComparison?: string;
  marketPosition: 'budget' | 'mid-range' | 'premium' | 'flagship';
  
  // User Recommendations
  bestFor: string[];
  notRecommendedFor: string[];
  alternativeProducts?: string[];
  
  // Technical Insights
  keyStrengths: string[];
  potentialWeaknesses: string[];
  futureProofing: 'excellent' | 'good' | 'fair' | 'limited';
  
  // DXM Scoring Breakdown
  scoreBreakdown: {
    performanceValue: { score: number; reasoning: string };
    dealQuality: { score: number; reasoning: string };
    trustSignal: { score: number; reasoning: string };
    efficiency: { score: number; reasoning: string };
    trendSignal: { score: number; reasoning: string };
  };
  
  // Metadata
  confidence: number; // 0-100% AI confidence in analysis
  lastUpdated: string;
  analysisVersion: string;
}

// AI Summary Templates by Category
const GPU_ANALYSIS_TEMPLATES = {
  performance: {
    flagship: "Delivers exceptional 4K gaming performance with ray tracing capabilities that set the standard for premium gaming experiences.",
    premium: "Provides excellent 1440p gaming with strong ray tracing performance, ideal for enthusiast gamers seeking high-refresh experiences.",
    midRange: "Offers solid 1440p gaming performance with moderate ray tracing capabilities, perfect for mainstream gaming builds.",
    budget: "Delivers reliable 1080p gaming performance with entry-level ray tracing, excellent value for budget-conscious gamers."
  },
  efficiency: {
    excellent: "Outstanding power efficiency with advanced architecture delivering maximum performance per watt.",
    good: "Well-balanced power consumption with modern efficiency features and reasonable thermal requirements.",
    fair: "Moderate power consumption typical for this performance tier, requires adequate cooling solutions.",
    poor: "Higher power consumption requiring robust PSU and cooling, but delivers strong raw performance."
  }
};

const CPU_ANALYSIS_TEMPLATES = {
  performance: {
    flagship: "Flagship-tier processing power with exceptional multi-core performance for professional workloads and high-end gaming.",
    premium: "High-performance processing with excellent multi-threading capabilities for content creation and demanding applications.",
    midRange: "Balanced performance for gaming and productivity with solid multi-core capabilities at competitive pricing.",
    budget: "Efficient processing power for mainstream computing, gaming, and light productivity tasks."
  },
  gaming: {
    excellent: "Exceptional gaming performance with high single-core speeds and optimized gaming features.",
    good: "Strong gaming performance with reliable frame rates across modern titles.",
    adequate: "Suitable gaming performance for most titles at reasonable settings."
  }
};

const LAPTOP_ANALYSIS_TEMPLATES = {
  usage: {
    gaming: "Purpose-built gaming laptop with dedicated graphics and high-refresh display for immersive gaming experiences.",
    creative: "Professional-grade laptop optimized for content creation with color-accurate display and powerful processing.",
    business: "Enterprise-focused laptop with security features, durability, and all-day battery life for professional use.",
    ultrabook: "Ultra-portable design with premium build quality and extended battery life for mobile professionals."
  },
  display: {
    excellent: "Premium display with high resolution, accurate colors, and fast refresh rates for professional and gaming use.",
    good: "Quality display with good color reproduction and adequate refresh rates for most applications.",
    adequate: "Standard display suitable for general computing and light creative work."
  }
};

/**
 * Generate AI-powered product summary using DXM intelligence
 */
export async function generateAIProductSummary(product: DealRadarItem): Promise<AIProductSummary> {
  const category = product.category.toLowerCase();
  
  // Determine market position based on price and specs
  const marketPosition = determineMarketPosition(product);
  
  // Generate category-specific analysis
  let intelligentSummary = "";
  let performanceInsights = "";
  let keyStrengths: string[] = [];
  let potentialWeaknesses: string[] = [];
  let bestFor: string[] = [];
  let notRecommendedFor: string[] = [];
  
  switch (category) {
    case 'gpu':
      ({ intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor } = 
        generateGPUAnalysis(product, marketPosition));
      break;
    case 'cpu':
      ({ intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor } = 
        generateCPUAnalysis(product, marketPosition));
      break;
    case 'laptop':
      ({ intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor } = 
        generateLaptopAnalysis(product, marketPosition));
      break;
    default:
      ({ intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor } = 
        generateGenericAnalysis(product, marketPosition));
  }
  
  // Generate DXM-specific analysis
  const dxmAnalysis = generateDXMAnalysis(product);
  const valueProposition = generateValueProposition(product, marketPosition);
  const scoreBreakdown = generateScoreBreakdown(product);
  const futureProofing = assessFutureProofing(product, marketPosition);
  
  return {
    id: `ai-summary-${product.id}`,
    asin: product.asin,
    title: product.title,
    category: product.category,
    intelligentSummary,
    dxmAnalysis,
    performanceInsights,
    valueProposition,
    marketPosition,
    keyStrengths,
    potentialWeaknesses,
    bestFor,
    notRecommendedFor,
    futureProofing,
    scoreBreakdown,
    confidence: calculateConfidence(product),
    lastUpdated: new Date().toISOString(),
    analysisVersion: "v2.1-dxm"
  };
}

/**
 * Determine market position based on price and category
 */
function determineMarketPosition(product: DealRadarItem): 'budget' | 'mid-range' | 'premium' | 'flagship' {
  const { category, price } = product;
  
  // Price thresholds by category (USD)
  const thresholds = {
    gpu: { budget: 300, midRange: 600, premium: 1000 },
    cpu: { budget: 200, midRange: 400, premium: 600 },
    laptop: { budget: 800, midRange: 1500, premium: 2500 }
  };
  
  const categoryThresholds = thresholds[category as keyof typeof thresholds] || thresholds.gpu;
  
  if (price <= categoryThresholds.budget) return 'budget';
  if (price <= categoryThresholds.midRange) return 'mid-range';
  if (price <= categoryThresholds.premium) return 'premium';
  return 'flagship';
}

/**
 * Generate GPU-specific AI analysis
 */
function generateGPUAnalysis(product: DealRadarItem, position: string) {
  const vramAmount = parseInt(product.vram || "0");
  const tdpValue = parseInt(product.tdp || "0");
  
  let intelligentSummary = `The ${product.title} represents a ${position}-tier graphics solution `;
  
  if (position === 'flagship') {
    intelligentSummary += "delivering cutting-edge performance for 4K gaming and professional workloads with advanced ray tracing capabilities.";
  } else if (position === 'premium') {
    intelligentSummary += "offering excellent 1440p gaming performance with strong ray tracing support for enthusiast-level experiences.";
  } else if (position === 'mid-range') {
    intelligentSummary += "providing solid 1440p gaming performance with competitive ray tracing capabilities at an attractive price point.";
  } else {
    intelligentSummary += "delivering reliable 1080p gaming performance with entry-level ray tracing features for budget-conscious builders.";
  }
  
  const performanceInsights = vramAmount >= 16 ? 
    "Exceptional VRAM capacity ensures smooth performance in VRAM-intensive games and professional applications." :
    vramAmount >= 12 ? 
    "Generous VRAM allocation provides excellent performance headroom for modern gaming and content creation." :
    vramAmount >= 8 ?
    "Adequate VRAM for current gaming demands with good future-proofing for upcoming titles." :
    "VRAM capacity may limit performance in the most demanding modern games at highest settings.";
  
  const keyStrengths = [
    vramAmount >= 12 ? "High VRAM capacity" : "Efficient memory usage",
    tdpValue <= 250 ? "Power efficient design" : "High performance architecture",
    product.dxmScore >= 8.5 ? "Exceptional value proposition" : "Competitive pricing",
    "Advanced ray tracing support"
  ];
  
  const potentialWeaknesses = [
    vramAmount < 8 ? "Limited VRAM for future titles" : null,
    tdpValue > 350 ? "High power consumption" : null,
    product.price > 1000 ? "Premium pricing" : null
  ].filter(Boolean) as string[];
  
  const bestFor = [
    position === 'flagship' ? "4K gaming enthusiasts" : position === 'premium' ? "1440p gaming" : "1080p gaming",
    "Content creators",
    vramAmount >= 12 ? "Professional workloads" : "Gaming builds",
    "Ray tracing experiences"
  ];
  
  const notRecommendedFor = [
    position === 'budget' ? "4K gaming" : null,
    tdpValue > 300 ? "Small form factor builds" : null,
    "Entry-level systems"
  ].filter(Boolean) as string[];
  
  return { intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor };
}

/**
 * Generate CPU-specific AI analysis
 */
function generateCPUAnalysis(product: DealRadarItem, position: string) {
  const coreCount = parseInt(product.cores?.split(' ')[0] || "0");
  const threadCount = parseInt(product.threads || "0");
  
  let intelligentSummary = `The ${product.title} delivers ${position}-tier processing performance `;
  
  if (position === 'flagship') {
    intelligentSummary += "with exceptional multi-core capabilities for professional workloads and high-end gaming systems.";
  } else if (position === 'premium') {
    intelligentSummary += "offering excellent multi-threading performance for content creation and demanding applications.";
  } else if (position === 'mid-range') {
    intelligentSummary += "providing balanced performance for gaming and productivity at competitive pricing.";
  } else {
    intelligentSummary += "offering efficient processing power for mainstream computing and gaming applications.";
  }
  
  const performanceInsights = coreCount >= 12 ? 
    "High core count delivers exceptional multi-threaded performance for professional workloads and heavy multitasking." :
    coreCount >= 8 ?
    "Solid core count provides excellent performance for gaming and content creation with good multitasking capabilities." :
    coreCount >= 6 ?
    "Balanced core configuration offers good gaming performance with adequate multitasking for most users." :
    "Efficient core design optimized for gaming and light productivity tasks.";
  
  const keyStrengths = [
    coreCount >= 8 ? "High core count" : "Efficient architecture",
    threadCount >= 16 ? "Excellent multithreading" : "Good single-core performance",
    product.dxmScore >= 8.5 ? "Outstanding value" : "Competitive pricing",
    "Modern instruction set support"
  ];
  
  const potentialWeaknesses = [
    coreCount < 6 ? "Limited multitasking capability" : null,
    position === 'budget' ? "May limit high-refresh gaming" : null,
    product.price > 500 ? "Premium pricing" : null
  ].filter(Boolean) as string[];
  
  const bestFor = [
    coreCount >= 12 ? "Professional workstations" : "Gaming systems",
    "Content creation",
    threadCount >= 16 ? "Heavy multitasking" : "Mainstream computing",
    "Productivity applications"
  ];
  
  const notRecommendedFor = [
    coreCount < 6 ? "Heavy multitasking" : null,
    position === 'budget' ? "Professional workstations" : null,
    "Entry-level office systems"
  ].filter(Boolean) as string[];
  
  return { intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor };
}

/**
 * Generate Laptop-specific AI analysis
 */
function generateLaptopAnalysis(product: DealRadarItem, position: string) {
  const hasGaming = product.title.toLowerCase().includes('gaming') || product.title.toLowerCase().includes('rog');
  const isUltrabook = product.title.toLowerCase().includes('ultrabook') || product.title.toLowerCase().includes('x1');
  const isMacBook = product.brand.toLowerCase() === 'apple';
  
  let intelligentSummary = `The ${product.title} is a ${position}-tier laptop `;
  
  if (hasGaming) {
    intelligentSummary += "engineered for gaming performance with dedicated graphics and high-refresh display capabilities.";
  } else if (isUltrabook) {
    intelligentSummary += "designed for professional mobility with premium build quality and extended battery life.";
  } else if (isMacBook) {
    intelligentSummary += "offering Apple's ecosystem integration with professional-grade performance for creative workflows.";
  } else {
    intelligentSummary += "balancing performance and portability for versatile computing needs.";
  }
  
  const performanceInsights = hasGaming ?
    "Gaming-optimized configuration with dedicated GPU ensures smooth gameplay and content creation capabilities." :
    isMacBook ?
    "Apple Silicon architecture delivers exceptional performance per watt with industry-leading efficiency." :
    "Balanced performance profile suitable for productivity, light gaming, and professional applications.";
  
  const keyStrengths = [
    hasGaming ? "Gaming performance" : "Professional design",
    isMacBook ? "Premium build quality" : "Versatile connectivity",
    product.dxmScore >= 8.5 ? "Excellent value" : "Competitive features",
    hasGaming ? "High-refresh display" : "Portable form factor"
  ];
  
  const potentialWeaknesses = [
    hasGaming ? "Limited battery life" : null,
    isMacBook ? "Premium pricing" : null,
    position === 'budget' ? "Limited upgrade options" : null
  ].filter(Boolean) as string[];
  
  const bestFor = [
    hasGaming ? "Gaming enthusiasts" : "Business professionals",
    isMacBook ? "Creative professionals" : "Students",
    "Content creation",
    hasGaming ? "Streaming" : "Productivity"
  ];
  
  const notRecommendedFor = [
    !hasGaming ? "Intensive gaming" : null,
    isMacBook ? "Windows-specific workflows" : null,
    "Desktop replacement needs"
  ].filter(Boolean) as string[];
  
  return { intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor };
}

/**
 * Generate generic hardware analysis
 */
function generateGenericAnalysis(product: DealRadarItem, position: string) {
  const intelligentSummary = `The ${product.title} represents a ${position}-tier ${product.category} solution offering competitive performance and features for its market segment.`;
  
  const performanceInsights = `Designed to deliver reliable performance for ${product.category} applications with modern feature support and competitive specifications.`;
  
  const keyStrengths = [
    "Modern feature set",
    "Competitive pricing",
    "Reliable performance",
    "Good build quality"
  ];
  
  const potentialWeaknesses = [
    position === 'budget' ? "Limited premium features" : "Premium pricing"
  ];
  
  const bestFor = [
    "General computing",
    "Mainstream users",
    "Budget builds",
    "Upgrade projects"
  ];
  
  const notRecommendedFor = [
    "Professional workstations",
    "High-end gaming"
  ];
  
  return { intelligentSummary, performanceInsights, keyStrengths, potentialWeaknesses, bestFor, notRecommendedFor };
}

/**
 * Generate DXM-specific analysis
 */
function generateDXMAnalysis(product: DealRadarItem): string {
  const score = product.dxmScore;
  
  if (score >= 9.5) {
    return `Exceptional DXM Score of ${score.toFixed(2)} indicates outstanding value proposition with premium performance, competitive pricing, and strong market positioning. This product represents the top tier of value in its category.`;
  } else if (score >= 9.0) {
    return `Excellent DXM Score of ${score.toFixed(2)} reflects superior value with strong performance metrics, attractive pricing, and positive market trends. Highly recommended for its category.`;
  } else if (score >= 8.5) {
    return `Very good DXM Score of ${score.toFixed(2)} demonstrates solid value proposition with competitive performance and reasonable pricing. A strong choice for most users.`;
  } else if (score >= 8.0) {
    return `Good DXM Score of ${score.toFixed(2)} indicates decent value with acceptable performance and pricing balance. Suitable for budget-conscious buyers.`;
  } else if (score >= 7.5) {
    return `Above-average DXM Score of ${score.toFixed(2)} shows moderate value with some trade-offs in performance or pricing. Consider alternatives in this range.`;
  } else {
    return `Below-average DXM Score of ${score.toFixed(2)} suggests limited value proposition. Significant compromises in performance, pricing, or market position may affect long-term satisfaction.`;
  }
}

/**
 * Generate value proposition analysis
 */
function generateValueProposition(product: DealRadarItem, position: string): string {
  const savings = product.previousPrice ? ((product.previousPrice - product.price) / product.previousPrice * 100) : 0;
  
  let proposition = `At $${product.price.toLocaleString()}, this ${position}-tier ${product.category} `;
  
  if (savings > 20) {
    proposition += `offers exceptional value with ${savings.toFixed(0)}% savings from MSRP, making it an outstanding deal for performance-conscious buyers.`;
  } else if (savings > 10) {
    proposition += `provides good value with ${savings.toFixed(0)}% discount from original pricing, delivering competitive performance at an attractive price point.`;
  } else if (savings > 0) {
    proposition += `maintains competitive pricing with modest ${savings.toFixed(0)}% savings, offering fair value for its performance tier.`;
  } else {
    proposition += `is priced at market rate, justified by its performance capabilities and feature set in the current market.`;
  }
  
  return proposition;
}

/**
 * Generate detailed score breakdown with reasoning
 */
function generateScoreBreakdown(product: DealRadarItem) {
  // Simulate DXM scoring components (in real implementation, this would use actual scoring logic)
  const baseScore = product.dxmScore;
  
  return {
    performanceValue: {
      score: Math.min(10, baseScore * 0.4 + 2.5),
      reasoning: "Performance per dollar analysis considering benchmark results and current market pricing"
    },
    dealQuality: {
      score: Math.min(10, baseScore * 0.25 + 2),
      reasoning: "Price trend analysis and discount evaluation compared to historical pricing data"
    },
    trustSignal: {
      score: Math.min(10, baseScore * 0.15 + 1.5),
      reasoning: "Brand reputation, user reviews, and market presence assessment"
    },
    efficiency: {
      score: Math.min(10, baseScore * 0.1 + 1),
      reasoning: "Power consumption, thermal performance, and architectural efficiency evaluation"
    },
    trendSignal: {
      score: Math.min(10, baseScore * 0.1 + 1),
      reasoning: "Market momentum, price stability, and future outlook analysis"
    }
  };
}

/**
 * Assess future-proofing potential
 */
function assessFutureProofing(product: DealRadarItem, position: string): 'excellent' | 'good' | 'fair' | 'limited' {
  if (position === 'flagship' && product.dxmScore >= 9.0) return 'excellent';
  if (position === 'premium' && product.dxmScore >= 8.5) return 'good';
  if (position === 'mid-range' && product.dxmScore >= 8.0) return 'good';
  if (product.dxmScore >= 7.5) return 'fair';
  return 'limited';
}

/**
 * Calculate AI confidence in analysis
 */
function calculateConfidence(product: DealRadarItem): number {
  let confidence = 85; // Base confidence
  
  // Adjust based on data completeness
  if (product.vram) confidence += 3;
  if (product.tdp) confidence += 3;
  if (product.cores) confidence += 3;
  if (product.previousPrice) confidence += 3;
  if (product.trend && product.trend.length > 3) confidence += 3;
  
  return Math.min(100, confidence);
}

/**
 * Get cached AI summary or generate new one
 */
export async function getAIProductSummary(product: DealRadarItem): Promise<AIProductSummary> {
  // In production, check cache first
  // const cached = await getCachedSummary(product.asin);
  // if (cached && isRecentEnough(cached.lastUpdated)) return cached;
  
  const summary = await generateAIProductSummary(product);
  
  // In production, cache the result
  // await cacheSummary(summary);
  
  return summary;
}

/**
 * Batch generate AI summaries for multiple products
 */
export async function batchGenerateAISummaries(products: DealRadarItem[]): Promise<AIProductSummary[]> {
  const summaries = await Promise.all(
    products.map(product => generateAIProductSummary(product))
  );
  
  return summaries;
}
