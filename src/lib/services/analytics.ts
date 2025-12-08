// src/lib/services/analytics.ts
// DXM369 Analytics Service
// Backend queries for dashboard analytics

import { db } from "../db";

export interface ClickStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface CategoryClickData {
  category: string;
  count: number;
}

export interface TrendData {
  day: string;
  count: number;
}

export interface TopProduct {
  product_id: number;
  asin: string;
  category: string;
  count: number;
  avg_dxm_score: number;
  avg_price: number;
}

/**
 * Get total click statistics
 */
export async function getTotalClicks(): Promise<ClickStats> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const totalResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM click_events"
  );
  const todayResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM click_events WHERE timestamp >= $1",
    [today]
  );
  const weekResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM click_events WHERE timestamp >= $1",
    [weekAgo]
  );
  const monthResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM click_events WHERE timestamp >= $1",
    [monthAgo]
  );

  return {
    total: totalResult?.rows[0]?.count ? parseInt(totalResult.rows[0].count, 10) : 0,
    today: todayResult?.rows[0]?.count ? parseInt(todayResult.rows[0].count, 10) : 0,
    thisWeek: weekResult?.rows[0]?.count ? parseInt(weekResult.rows[0].count, 10) : 0,
    thisMonth: monthResult?.rows[0]?.count ? parseInt(monthResult.rows[0].count, 10) : 0,
  };
}

/**
 * Get clicks grouped by category
 */
export async function getClicksByCategory(): Promise<CategoryClickData[]> {
  const result = await db.query<CategoryClickData>(
    `SELECT category, COUNT(*)::int AS count
     FROM click_events
     GROUP BY category
     ORDER BY count DESC`
  );

  return result?.rows || [];
}

/**
 * Get click trends over the last 30 days
 */
export async function getClickTrend(days: number = 30): Promise<TrendData[]> {
  const result = await db.query<TrendData>(
    `SELECT DATE(timestamp) AS day, COUNT(*)::int AS count
     FROM click_events
     WHERE timestamp >= NOW() - INTERVAL '${days} days'
     GROUP BY day
     ORDER BY day DESC`
  );

  return result?.rows || [];
}

/**
 * Get top performing products by click count
 */
export async function getTopProducts(limit: number = 10): Promise<TopProduct[]> {
  const result = await db.query<TopProduct>(
    `SELECT 
       ce.product_id,
       ce.asin,
       ce.category,
       COUNT(*)::int AS count,
       AVG(ce.dxm_score)::numeric(4,2) AS avg_dxm_score,
       AVG(ce.price)::numeric(10,2) AS avg_price
     FROM click_events ce
     GROUP BY ce.product_id, ce.asin, ce.category
     ORDER BY count DESC
     LIMIT $1`,
    [limit]
  );

  return result?.rows || [];
}

/**
 * Get revenue projection based on clicks and estimated conversion
 */
export async function getRevenueProjection(): Promise<{
  estimatedClicks: number;
  estimatedConversions: number;
  estimatedRevenue: number;
  conversionRate: number;
}> {
  const stats = await getTotalClicks();
  const conversionRate = 0.02; // 2% estimated conversion rate
  const avgOrderValue = 450; // Estimated average order value

  const estimatedConversions = Math.floor(stats.total * conversionRate);
  const estimatedRevenue = estimatedConversions * avgOrderValue;

  return {
    estimatedClicks: stats.total,
    estimatedConversions,
    estimatedRevenue,
    conversionRate,
  };
}

