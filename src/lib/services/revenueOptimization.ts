// src/lib/services/revenueOptimization.ts
// DXM369 Revenue Optimization Engine
// Analyzes earnings data and generates actionable recommendations

import {
  getEarningsByTrackingId,
  getEPCLeaderboard,
  getConversionRateLeaderboard,
  TrackingIdEarnings,
} from "./earningsAnalytics";

export interface OptimizationRecommendation {
  id: string;
  type: "tracking_id" | "category" | "source" | "content" | "traffic" | "conversion";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string; // Estimated impact (e.g., "+15% revenue")
  action: string; // Actionable step
  trackingIds?: string[]; // Related tracking IDs
  category?: string;
  source?: string;
}

export interface OptimizationReport {
  generatedAt: string;
  summary: {
    totalRecommendations: number;
    highPriority: number;
    estimatedImpact: string; // Total estimated revenue impact
  };
  topPerformers: {
    trackingIds: TrackingIdEarnings[];
    categories: Array<{ category: string; revenue: number; epc: number }>;
  };
  underperformers: {
    trackingIds: TrackingIdEarnings[];
    categories: Array<{ category: string; revenue: number; epc: number }>;
  };
  recommendations: OptimizationRecommendation[];
}

/**
 * Generate comprehensive revenue optimization report
 */
export async function generateOptimizationReport(): Promise<OptimizationReport> {
  const [allTrackingIds, topEPC, topCR] = await Promise.all([
    getEarningsByTrackingId(),
    getEPCLeaderboard(10),
    getConversionRateLeaderboard(10),
  ]);

  const recommendations: OptimizationRecommendation[] = [];

  // 1. Identify top performers and recommend scaling
  const topPerformers = topEPC.slice(0, 3);
  topPerformers.forEach((performer, index) => {
    recommendations.push({
      id: `scale-top-${index}`,
      type: "tracking_id",
      priority: "high",
      title: `Scale Traffic to ${performer.trackingId}`,
      description: `This tracking ID has the highest EPC ($${performer.epc.toFixed(2)}). Increasing traffic here will maximize revenue per click.`,
      impact: `+${Math.round(performer.epc * 100)}% revenue potential`,
      action: `Double down on content/channels that feed ${performer.trackingId}. Create more content in this category or from this traffic source.`,
      trackingIds: [performer.trackingId],
    });
  });

  // 2. Identify underperformers and recommend optimization
  const underperformers = allTrackingIds
    .filter((t) => t.totalClicks > 50 && t.epc < 0.10) // Low EPC but has traffic
    .sort((a, b) => a.epc - b.epc)
    .slice(0, 5);

  underperformers.forEach((underperformer, index) => {
    recommendations.push({
      id: `optimize-under-${index}`,
      type: "tracking_id",
      priority: "medium",
      title: `Optimize ${underperformer.trackingId}`,
      description: `Low EPC ($${underperformer.epc.toFixed(2)}) despite ${underperformer.totalClicks} clicks. This suggests wrong products, bad pricing, or misaligned intent.`,
      impact: `+${Math.round((0.20 - underperformer.epc) * underperformer.totalClicks)} potential revenue`,
      action: `Review products in this segment. Test different price points, improve product descriptions, or shift to higher-intent content.`,
      trackingIds: [underperformer.trackingId],
    });
  });

  // 3. Conversion rate optimization
  const lowCR = allTrackingIds
    .filter((t) => t.totalClicks > 100 && t.conversionRate < 0.02) // Less than 2% CR
    .sort((a, b) => a.conversionRate - b.conversionRate)
    .slice(0, 3);

  lowCR.forEach((low, index) => {
    recommendations.push({
      id: `improve-cr-${index}`,
      type: "conversion",
      priority: "high",
      title: `Improve Conversion Rate for ${low.trackingId}`,
      description: `Conversion rate is ${(low.conversionRate * 100).toFixed(2)}% (industry avg: 3-5%). This is costing you revenue.`,
      impact: `+${Math.round((0.04 - low.conversionRate) * low.totalClicks * (low.avgOrderValue || 500))} potential revenue`,
      action: `A/B test CTAs, improve product descriptions, add urgency indicators, or optimize page load speed for this segment.`,
      trackingIds: [low.trackingId],
    });
  });

  // 4. Category performance analysis
  const categoryMap = new Map<string, { revenue: number; clicks: number; epc: number }>();
  allTrackingIds.forEach((t) => {
    // Extract category from tracking ID (e.g., "dxmatrix-gpus-20" -> "gpus")
    const categoryMatch = t.trackingId.match(/-(gpus?|cpu|laptops?|storage|mobo|ram|psu|monitors?|cooling|case)-/);
    if (categoryMatch) {
      const category = categoryMatch[1];
      const existing = categoryMap.get(category) || { revenue: 0, clicks: 0, epc: 0 };
      existing.revenue += t.totalRevenue;
      existing.clicks += t.totalClicks;
      categoryMap.set(category, existing);
    }
  });

  // Calculate EPC for each category
  categoryMap.forEach((data, category) => {
    data.epc = data.clicks > 0 ? data.revenue / data.clicks : 0;
  });

  const categoryArray = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.epc - a.epc);

  // Recommend focusing on high-EPC categories
  const topCategory = categoryArray[0];
  if (topCategory && topCategory.epc > 0.20) {
    recommendations.push({
      id: "focus-top-category",
      type: "category",
      priority: "high",
      title: `Focus on ${topCategory.category.toUpperCase()} Category`,
      description: `${topCategory.category} has the highest EPC ($${topCategory.epc.toFixed(2)}). This category converts better than others.`,
      impact: `+${Math.round(topCategory.epc * 50)} potential revenue per 50 clicks`,
      action: `Create more content/products in the ${topCategory.category} category. This is where your money is.`,
      category: topCategory.category,
    });
  }

  // 5. Source-based recommendations
  const sourceMap = new Map<string, { revenue: number; clicks: number; epc: number; cr: number }>();
  allTrackingIds.forEach((t) => {
    // Extract source from tracking ID
    const sourceMatch = t.trackingId.match(/-(seo|youtube|x|ig|email|social|content|direct|main)-/);
    if (sourceMatch) {
      const source = sourceMatch[1];
      const existing = sourceMap.get(source) || { revenue: 0, clicks: 0, epc: 0, cr: 0 };
      existing.revenue += t.totalRevenue;
      existing.clicks += t.totalClicks;
      sourceMap.set(source, existing);
    }
  });

  sourceMap.forEach((data, source) => {
    data.epc = data.clicks > 0 ? data.revenue / data.clicks : 0;
    // Estimate CR from tracking IDs
    const sourceTrackingIds = allTrackingIds.filter((t) => t.trackingId.includes(`-${source}-`));
    const totalConversions = sourceTrackingIds.reduce((sum, t) => sum + t.totalOrderedItems, 0);
    data.cr = data.clicks > 0 ? totalConversions / data.clicks : 0;
  });

  const sourceArray = Array.from(sourceMap.entries())
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.epc - a.epc);

  // Recommend scaling high-performing sources
  const topSource = sourceArray[0];
  if (topSource && topSource.epc > 0.15 && topSource.clicks > 50) {
    recommendations.push({
      id: "scale-top-source",
      type: "source",
      priority: "high",
      title: `Scale ${topSource.source.toUpperCase()} Traffic`,
      description: `${topSource.source} traffic has EPC of $${topSource.epc.toFixed(2)} and CR of ${(topSource.cr * 100).toFixed(2)}%. This is your best traffic source.`,
      impact: `+${Math.round(topSource.epc * 100)} potential revenue per 100 clicks`,
      action: `Increase ${topSource.source} marketing efforts. This traffic converts better than others.`,
      source: topSource.source,
    });
  }

  // 6. Dead tracking IDs (no clicks or very low performance)
  const deadIds = allTrackingIds.filter(
    (t) => t.totalClicks === 0 || (t.totalClicks < 10 && t.totalRevenue < 1)
  );

  if (deadIds.length > 0) {
    recommendations.push({
      id: "deprecate-dead-ids",
      type: "tracking_id",
      priority: "low",
      title: `Deprecate ${deadIds.length} Underperforming Tracking IDs`,
      description: `${deadIds.length} tracking IDs have zero or minimal performance. These are wasting tracking capacity.`,
      impact: "Free up tracking ID slots for A/B testing",
      action: `Remove or repurpose these tracking IDs: ${deadIds.slice(0, 5).map((t) => t.trackingId).join(", ")}`,
      trackingIds: deadIds.map((t) => t.trackingId),
    });
  }

  // Calculate estimated total impact
  const highPriorityRecs = recommendations.filter((r) => r.priority === "high");
  const estimatedImpact = highPriorityRecs.length > 0
    ? `+${Math.round(highPriorityRecs.length * 15)}% revenue potential`
    : "Review recommendations for specific impact";

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRecommendations: recommendations.length,
      highPriority: highPriorityRecs.length,
      estimatedImpact,
    },
    topPerformers: {
      trackingIds: topEPC.slice(0, 5),
      categories: categoryArray.slice(0, 3),
    },
    underperformers: {
      trackingIds: underperformers.slice(0, 5),
      categories: categoryArray.slice(-3), // Bottom 3
    },
    recommendations: recommendations.sort((a, b) => {
      // Sort by priority: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
  };
}

/**
 * Get quick optimization insights (lightweight version)
 */
export async function getQuickInsights(): Promise<{
  topEPC: string;
  topCategory: string;
  biggestOpportunity: string;
}> {
  const [topEPC, allTrackingIds] = await Promise.all([
    getEPCLeaderboard(1),
    getEarningsByTrackingId(),
  ]);

  const top = topEPC[0];
  if (!top) {
    return {
      topEPC: "No data",
      topCategory: "No data",
      biggestOpportunity: "Start tracking earnings",
    };
  }

  // Find biggest opportunity (high clicks, low EPC)
  const opportunity = allTrackingIds
    .filter((t) => t.totalClicks > 100 && t.epc < 0.15)
    .sort((a, b) => b.totalClicks - a.totalClicks)[0];

  return {
    topEPC: `${top.trackingId} ($${top.epc.toFixed(2)} EPC)`,
    topCategory: "Check full report",
    biggestOpportunity: opportunity
      ? `Optimize ${opportunity.trackingId} (${opportunity.totalClicks} clicks, $${opportunity.epc.toFixed(2)} EPC)`
      : "All tracking IDs performing well",
  };
}

