// src/lib/services/newsletterAnalytics.ts
// DXM369 Newsletter Analytics Service
// Subscriber growth, engagement, and source attribution

import { db } from "../db";

export interface Subscriber {
  id: number;
  email: string;
  source: string | null;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
}

export interface SubscriberGrowth {
  day: string;
  count: number;
}

export interface SourceAttribution {
  source: string | null;
  count: number;
  percentage: number;
}

/**
 * Get all active subscribers
 */
export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const result = await db.query<Subscriber>(
    `SELECT id, email, source, subscribed_at, unsubscribed_at
     FROM newsletter_subscribers
     WHERE unsubscribed_at IS NULL
     ORDER BY subscribed_at DESC`
  );

  return result?.rows || [];
}

/**
 * Get subscriber growth over time
 */
export async function getSubscriberGrowth(days: number = 30): Promise<SubscriberGrowth[]> {
  const result = await db.query<SubscriberGrowth>(
    `SELECT DATE(subscribed_at) AS day, COUNT(*)::int AS count
     FROM newsletter_subscribers
     WHERE subscribed_at >= NOW() - INTERVAL '${days} days'
     GROUP BY day
     ORDER BY day DESC`
  );

  return result?.rows || [];
}

/**
 * Get total subscriber statistics
 */
export async function getSubscriberStats(): Promise<{
  total: number;
  active: number;
  unsubscribed: number;
  growthRate: number;
}> {
  const totalResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM newsletter_subscribers"
  );
  const activeResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM newsletter_subscribers WHERE unsubscribed_at IS NULL"
  );
  const unsubscribedResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM newsletter_subscribers WHERE unsubscribed_at IS NOT NULL"
  );

  // Get growth rate (new subscribers in last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM newsletter_subscribers WHERE subscribed_at >= $1",
    [weekAgo]
  );

  const total = totalResult?.rows[0]?.count ? parseInt(totalResult.rows[0].count, 10) : 0;
  const active = activeResult?.rows[0]?.count ? parseInt(activeResult.rows[0].count, 10) : 0;
  const unsubscribed = unsubscribedResult?.rows[0]?.count ? parseInt(unsubscribedResult.rows[0].count, 10) : 0;
  const recent = recentResult?.rows[0]?.count ? parseInt(recentResult.rows[0].count, 10) : 0;

  // Calculate growth rate as percentage of total
  const growthRate = total > 0 ? (recent / total) * 100 : 0;

  return {
    total,
    active,
    unsubscribed,
    growthRate,
  };
}

/**
 * Get source attribution breakdown
 */
export async function getSourceAttribution(): Promise<SourceAttribution[]> {
  const result = await db.query<{ source: string | null; count: string }>(
    `SELECT source, COUNT(*)::int AS count
     FROM newsletter_subscribers
     WHERE unsubscribed_at IS NULL
     GROUP BY source
     ORDER BY count DESC`
  );

  if (!result?.rows) {
    return [];
  }

  const total = result.rows.reduce((sum, row) => sum + parseInt(row.count, 10), 0);

  return result.rows.map((row) => ({
    source: row.source || "unknown",
    count: parseInt(row.count, 10),
    percentage: total > 0 ? (parseInt(row.count, 10) / total) * 100 : 0,
  }));
}

/**
 * Export subscribers to CSV format
 */
export async function exportSubscribersCSV(): Promise<string> {
  const subscribers = await getActiveSubscribers();

  const headers = ["Email", "Source", "Subscribed At"];
  const rows = subscribers.map((sub) => [
    sub.email,
    sub.source || "unknown",
    sub.subscribed_at.toISOString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csv;
}

