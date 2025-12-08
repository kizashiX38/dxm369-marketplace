// src/lib/services/earningsAnalytics.ts
// DXM369 Earnings Analytics Service
// Query affiliate earnings data for admin dashboard

import { db } from "../db";

export interface EarningsSummary {
  totalCommission: number;
  totalBounties: number;
  totalAdFees: number;
  totalRevenue: number;
  totalClicks: number;
  totalOrderedItems: number;
  totalShippedItems: number;
  totalReturnedItems: number;
}

export interface DailyEarnings {
  date: string;
  commission: number;
  bounties: number;
  adFees: number;
  total: number;
  clicks: number;
  orderedItems: number;
}

export interface TrackingIdEarnings {
  trackingId: string;
  totalCommission: number;
  totalBounties: number;
  totalAdFees: number;
  totalRevenue: number;
  totalClicks: number;
  totalOrderedItems: number;
  totalShippedItems: number;
  totalReturnedItems: number;
  marketplace: string;
  // Calculated metrics
  epc: number; // Earnings per click
  conversionRate: number; // Conversion rate (ordered / clicks)
  avgOrderValue: number; // Average order value
  returnRate: number; // Return rate (returned / shipped)
  // Trend indicators
  trend: 'up' | 'down' | 'steady';
  trendPercent: number;
}

/**
 * Get earnings summary (totals)
 */
export async function getEarningsSummary(): Promise<EarningsSummary> {
  const result = await db.query<{
    total_commission: string;
    total_bounties: string;
    total_ad_fees: string;
    total_clicks: string;
    total_ordered_items: string;
    total_shipped_items: string;
    total_returned_items: string;
  }>(
    `SELECT 
      COALESCE(SUM(commission), 0)::numeric(12,2) AS total_commission,
      COALESCE(SUM(bounties), 0)::numeric(12,2) AS total_bounties,
      COALESCE(SUM(ad_fees), 0)::numeric(12,2) AS total_ad_fees,
      COALESCE(SUM(clicks), 0)::int AS total_clicks,
      COALESCE(SUM(ordered_items), 0)::int AS total_ordered_items,
      COALESCE(SUM(shipped_items), 0)::int AS total_shipped_items,
      COALESCE(SUM(returned_items), 0)::int AS total_returned_items
     FROM affiliate_earnings`
  );

  if (!result?.rows[0]) {
    return {
      totalCommission: 0,
      totalBounties: 0,
      totalAdFees: 0,
      totalRevenue: 0,
      totalClicks: 0,
      totalOrderedItems: 0,
      totalShippedItems: 0,
      totalReturnedItems: 0,
    };
  }

  const row = result.rows[0];
  const totalCommission = parseFloat(row.total_commission || "0");
  const totalBounties = parseFloat(row.total_bounties || "0");
  const totalAdFees = parseFloat(row.total_ad_fees || "0");

  return {
    totalCommission,
    totalBounties,
    totalAdFees,
    totalRevenue: totalCommission + totalBounties + totalAdFees,
    totalClicks: parseInt(row.total_clicks || "0", 10),
    totalOrderedItems: parseInt(row.total_ordered_items || "0", 10),
    totalShippedItems: parseInt(row.total_shipped_items || "0", 10),
    totalReturnedItems: parseInt(row.total_returned_items || "0", 10),
  };
}

/**
 * Get daily earnings for the last N days
 */
export async function getDailyEarningsLast30(days: number = 30): Promise<DailyEarnings[]> {
  const result = await db.query<{
    date: string;
    commission: string;
    bounties: string;
    ad_fees: string;
    clicks: string;
    ordered_items: string;
  }>(
    `SELECT 
      report_date AS date,
      COALESCE(SUM(commission), 0)::numeric(12,2) AS commission,
      COALESCE(SUM(bounties), 0)::numeric(12,2) AS bounties,
      COALESCE(SUM(ad_fees), 0)::numeric(12,2) AS ad_fees,
      COALESCE(SUM(clicks), 0)::int AS clicks,
      COALESCE(SUM(ordered_items), 0)::int AS ordered_items
     FROM affiliate_earnings
     WHERE report_date >= CURRENT_DATE - INTERVAL '${days} days'
     GROUP BY report_date
     ORDER BY report_date DESC`
  );

  if (!result?.rows) {
    return [];
  }

  return result.rows.map((row) => {
    const commission = parseFloat(row.commission || "0");
    const bounties = parseFloat(row.bounties || "0");
    const adFees = parseFloat(row.ad_fees || "0");

    return {
      date: row.date,
      commission,
      bounties,
      adFees,
      total: commission + bounties + adFees,
      clicks: parseInt(row.clicks || "0", 10),
      orderedItems: parseInt(row.ordered_items || "0", 10),
    };
  });
}

/**
 * Get earnings aggregated by tracking ID with EPC and conversion metrics
 */
export async function getEarningsByTrackingId(): Promise<TrackingIdEarnings[]> {
  // Get current period (last 30 days)
  const result = await db.query<{
    tracking_id: string;
    marketplace: string;
    total_commission: string;
    total_bounties: string;
    total_ad_fees: string;
    total_clicks: string;
    total_ordered_items: string;
    total_shipped_items: string;
    total_returned_items: string;
  }>(
    `SELECT 
      tracking_id,
      MAX(marketplace) AS marketplace,
      COALESCE(SUM(commission), 0)::numeric(12,2) AS total_commission,
      COALESCE(SUM(bounties), 0)::numeric(12,2) AS total_bounties,
      COALESCE(SUM(ad_fees), 0)::numeric(12,2) AS total_ad_fees,
      COALESCE(SUM(clicks), 0)::int AS total_clicks,
      COALESCE(SUM(ordered_items), 0)::int AS total_ordered_items,
      COALESCE(SUM(shipped_items), 0)::int AS total_shipped_items,
      COALESCE(SUM(returned_items), 0)::int AS total_returned_items
     FROM affiliate_earnings
     WHERE report_date >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY tracking_id
     ORDER BY total_commission DESC`
  );

  // Get previous period for trend calculation
  const previousResult = await db.query<{
    tracking_id: string;
    total_commission: string;
  }>(
    `SELECT 
      tracking_id,
      COALESCE(SUM(commission), 0)::numeric(12,2) AS total_commission
     FROM affiliate_earnings
     WHERE report_date >= CURRENT_DATE - INTERVAL '60 days'
       AND report_date < CURRENT_DATE - INTERVAL '30 days'
     GROUP BY tracking_id`
  );

  const previousMap = new Map<string, number>();
  previousResult?.rows.forEach((row) => {
    previousMap.set(row.tracking_id, parseFloat(row.total_commission || "0"));
  });

  if (!result?.rows) {
    return [];
  }

  return result.rows.map((row) => {
    const totalCommission = parseFloat(row.total_commission || "0");
    const totalBounties = parseFloat(row.total_bounties || "0");
    const totalAdFees = parseFloat(row.total_ad_fees || "0");
    const totalRevenue = totalCommission + totalBounties + totalAdFees;
    const totalClicks = parseInt(row.total_clicks || "0", 10);
    const totalOrderedItems = parseInt(row.total_ordered_items || "0", 10);
    const totalShippedItems = parseInt(row.total_shipped_items || "0", 10);
    const totalReturnedItems = parseInt(row.total_returned_items || "0", 10);

    // Calculate metrics
    const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? totalOrderedItems / totalClicks : 0;
    const avgOrderValue = totalOrderedItems > 0 ? totalRevenue / totalOrderedItems : 0;
    const returnRate = totalShippedItems > 0 ? totalReturnedItems / totalShippedItems : 0;

    // Calculate trend
    const previousCommission = previousMap.get(row.tracking_id) || 0;
    const trendPercent = previousCommission > 0
      ? ((totalCommission - previousCommission) / previousCommission) * 100
      : totalCommission > 0 ? 100 : 0;
    
    let trend: 'up' | 'down' | 'steady' = 'steady';
    if (trendPercent > 5) trend = 'up';
    else if (trendPercent < -5) trend = 'down';

    return {
      trackingId: row.tracking_id,
      marketplace: row.marketplace,
      totalCommission,
      totalBounties,
      totalAdFees,
      totalRevenue,
      totalClicks,
      totalOrderedItems,
      totalShippedItems,
      totalReturnedItems,
      epc,
      conversionRate,
      avgOrderValue,
      returnRate,
      trend,
      trendPercent,
    };
  });
}

/**
 * Get EPC leaderboard (top performing tracking IDs by earnings per click)
 */
export async function getEPCLeaderboard(limit: number = 10): Promise<TrackingIdEarnings[]> {
  const all = await getEarningsByTrackingId();
  return all
    .filter(item => item.totalClicks > 0) // Only IDs with clicks
    .sort((a, b) => b.epc - a.epc) // Sort by EPC descending
    .slice(0, limit);
}

/**
 * Get conversion rate leaderboard
 */
export async function getConversionRateLeaderboard(limit: number = 10): Promise<TrackingIdEarnings[]> {
  const all = await getEarningsByTrackingId();
  return all
    .filter(item => item.totalClicks > 0)
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, limit);
}

/**
 * Get earnings summary for date range
 */
export async function getEarningsSummaryForDateRange(
  startDate: string,
  endDate: string
): Promise<EarningsSummary> {
  const result = await db.query<{
    total_commission: string;
    total_bounties: string;
    total_ad_fees: string;
    total_clicks: string;
    total_ordered_items: string;
    total_shipped_items: string;
    total_returned_items: string;
  }>(
    `SELECT 
      COALESCE(SUM(commission), 0)::numeric(12,2) AS total_commission,
      COALESCE(SUM(bounties), 0)::numeric(12,2) AS total_bounties,
      COALESCE(SUM(ad_fees), 0)::numeric(12,2) AS total_ad_fees,
      COALESCE(SUM(clicks), 0)::int AS total_clicks,
      COALESCE(SUM(ordered_items), 0)::int AS total_ordered_items,
      COALESCE(SUM(shipped_items), 0)::int AS total_shipped_items,
      COALESCE(SUM(returned_items), 0)::int AS total_returned_items
     FROM affiliate_earnings
     WHERE report_date >= $1 AND report_date <= $2`,
    [startDate, endDate]
  );

  if (!result?.rows[0]) {
    return {
      totalCommission: 0,
      totalBounties: 0,
      totalAdFees: 0,
      totalRevenue: 0,
      totalClicks: 0,
      totalOrderedItems: 0,
      totalShippedItems: 0,
      totalReturnedItems: 0,
    };
  }

  const row = result.rows[0];
  const totalCommission = parseFloat(row.total_commission || "0");
  const totalBounties = parseFloat(row.total_bounties || "0");
  const totalAdFees = parseFloat(row.total_ad_fees || "0");

  return {
    totalCommission,
    totalBounties,
    totalAdFees,
    totalRevenue: totalCommission + totalBounties + totalAdFees,
    totalClicks: parseInt(row.total_clicks || "0", 10),
    totalOrderedItems: parseInt(row.total_ordered_items || "0", 10),
    totalShippedItems: parseInt(row.total_shipped_items || "0", 10),
    totalReturnedItems: parseInt(row.total_returned_items || "0", 10),
  };
}

