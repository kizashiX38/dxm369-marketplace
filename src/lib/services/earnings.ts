// src/lib/services/earnings.ts
// DXM369 Earnings Service
// Amazon Associates earnings data fetching and management

import { db } from "../db";
import { earningsConfig } from "../env";

export interface EarningsReport {
  id?: number;
  tracking_id: string;
  report_date: string; // YYYY-MM-DD
  clicks: number;
  ordered_items: number;
  shipped_items: number;
  returned_items: number;
  revenue: number;
  commission: number;
  commission_rate?: number;
  epc?: number;
  conversion_rate?: number;
  report_type: 'daily' | 'weekly' | 'monthly';
  source: 'amazon' | 'manual' | 'api';
  raw_data?: any;
}

export interface EarningsSyncResult {
  success: boolean;
  recordsSynced: number;
  recordsFailed: number;
  trackingIds: string[];
  errors?: string[];
  durationMs: number;
}

export interface EarningsStats {
  totalRevenue: number;
  totalCommission: number;
  totalClicks: number;
  totalOrdered: number;
  totalShipped: number;
  totalReturned: number;
  avgEpc: number;
  avgConversionRate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface EarningsByTrackingId {
  tracking_id: string;
  revenue: number;
  commission: number;
  clicks: number;
  ordered_items: number;
  shipped_items: number;
  epc: number;
  conversion_rate: number;
}

/**
 * Fetch earnings data from Amazon Associates dashboard
 * Supports cookie-based authentication
 */
export async function fetchAmazonEarnings(
  trackingIds: string[],
  startDate: string,
  endDate: string
): Promise<EarningsReport[]> {
  // This is a placeholder for the actual implementation
  // In production, this would:
  // 1. Use Amazon Associates session cookies
  // 2. Make authenticated requests to earnings endpoints
  // 3. Parse JSON/CSV responses
  // 4. Return structured earnings data

  const cookies = earningsConfig.sessionCookies;
  const sessionId = earningsConfig.sessionId;
  const ubidMain = earningsConfig.ubidMain;

  if (!cookies && !sessionId) {
    throw new Error('Amazon session cookies not configured. Set AMAZON_SESSION_COOKIES or AMAZON_SESSION_ID in .env.local');
  }

  // TODO: Implement actual Amazon Associates API scraping
  // For now, return empty array - user will need to provide cookies
  console.warn('[Earnings Service] Amazon earnings fetch not yet implemented. Use manual sync or provide session cookies.');
  
  return [];
}

/**
 * Parse CSV earnings report from Amazon Associates
 */
export function parseEarningsCSV(csvContent: string): EarningsReport[] {
  const lines = csvContent.trim().split('\n');
  const reports: EarningsReport[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handle quoted values)
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    // Amazon Associates CSV format varies, but typically includes:
    // Date, Tracking ID, Clicks, Ordered Items, Shipped Items, Returned Items, Revenue, Commission
    if (values.length >= 8) {
      const report: EarningsReport = {
        tracking_id: values[1] || 'unknown',
        report_date: values[0] || new Date().toISOString().split('T')[0],
        clicks: parseInt(values[2] || '0', 10),
        ordered_items: parseInt(values[3] || '0', 10),
        shipped_items: parseInt(values[4] || '0', 10),
        returned_items: parseInt(values[5] || '0', 10),
        revenue: parseFloat(values[6] || '0'),
        commission: parseFloat(values[7] || '0'),
        report_type: 'daily',
        source: 'amazon',
      };
      
      // Calculate derived metrics
      if (report.clicks > 0) {
        report.epc = report.commission / report.clicks;
        report.conversion_rate = report.ordered_items / report.clicks;
      }
      if (report.revenue > 0) {
        report.commission_rate = report.commission / report.revenue;
      }
      
      reports.push(report);
    }
  }
  
  return reports;
}

/**
 * Save earnings reports to database
 */
export async function saveEarningsReports(
  reports: EarningsReport[]
): Promise<EarningsSyncResult> {
  const startTime = Date.now();
  const trackingIds = [...new Set(reports.map(r => r.tracking_id))];
  let recordsSynced = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  if (!db.isDatabaseConfigured()) {
    throw new Error('Database not configured. Set DATABASE_URL in .env.local');
  }

  for (const report of reports) {
    try {
      // Calculate derived metrics if not provided
      if (!report.epc && report.clicks > 0) {
        report.epc = report.commission / report.clicks;
      }
      if (!report.conversion_rate && report.clicks > 0) {
        report.conversion_rate = report.ordered_items / report.clicks;
      }
      if (!report.commission_rate && report.revenue > 0) {
        report.commission_rate = report.commission / report.revenue;
      }

      // Upsert earnings report
      await db.query(
        `INSERT INTO earnings_reports (
          tracking_id, report_date, clicks, ordered_items, shipped_items,
          returned_items, revenue, commission, commission_rate, epc,
          conversion_rate, report_type, source, raw_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (tracking_id, report_date, report_type)
        DO UPDATE SET
          clicks = EXCLUDED.clicks,
          ordered_items = EXCLUDED.ordered_items,
          shipped_items = EXCLUDED.shipped_items,
          returned_items = EXCLUDED.returned_items,
          revenue = EXCLUDED.revenue,
          commission = EXCLUDED.commission,
          commission_rate = EXCLUDED.commission_rate,
          epc = EXCLUDED.epc,
          conversion_rate = EXCLUDED.conversion_rate,
          source = EXCLUDED.source,
          raw_data = EXCLUDED.raw_data,
          updated_at = NOW()`,
        [
          report.tracking_id,
          report.report_date,
          report.clicks,
          report.ordered_items,
          report.shipped_items,
          report.returned_items,
          report.revenue,
          report.commission,
          report.commission_rate || null,
          report.epc || null,
          report.conversion_rate || null,
          report.report_type,
          report.source,
          report.raw_data ? JSON.stringify(report.raw_data) : null,
        ]
      );
      
      recordsSynced++;
    } catch (error) {
      recordsFailed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to save report for ${report.tracking_id} on ${report.report_date}: ${errorMsg}`);
      console.error('[Earnings Service] Save error:', error);
    }
  }

  // Log sync operation
  const durationMs = Date.now() - startTime;
  const status = recordsFailed === 0 ? 'success' : recordsFailed < reports.length ? 'partial' : 'failed';
  
  try {
    await db.query(
      `INSERT INTO earnings_sync_log (
        sync_type, status, tracking_ids, records_synced, records_failed,
        error_message, started_at, completed_at, duration_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)`,
      [
        'api',
        status,
        trackingIds,
        recordsSynced,
        recordsFailed,
        errors.length > 0 ? errors.join('; ') : null,
        durationMs,
      ]
    );
  } catch (error) {
    console.error('[Earnings Service] Failed to log sync operation:', error);
  }

  return {
    success: recordsFailed === 0,
    recordsSynced,
    recordsFailed,
    trackingIds,
    errors: errors.length > 0 ? errors : undefined,
    durationMs,
  };
}

/**
 * Get earnings statistics for a date range
 */
export async function getEarningsStats(
  startDate: string,
  endDate: string,
  trackingId?: string
): Promise<EarningsStats> {
  let query = `
    SELECT 
      COALESCE(SUM(revenue), 0)::numeric(10,2) AS total_revenue,
      COALESCE(SUM(commission), 0)::numeric(10,2) AS total_commission,
      COALESCE(SUM(clicks), 0)::int AS total_clicks,
      COALESCE(SUM(ordered_items), 0)::int AS total_ordered,
      COALESCE(SUM(shipped_items), 0)::int AS total_shipped,
      COALESCE(SUM(returned_items), 0)::int AS total_returned
    FROM earnings_reports
    WHERE report_date >= $1 AND report_date <= $2
  `;
  
  const params: any[] = [startDate, endDate];
  
  if (trackingId) {
    query += ' AND tracking_id = $3';
    params.push(trackingId);
  }
  
  const result = await db.query<{
    total_revenue: string;
    total_commission: string;
    total_clicks: string;
    total_ordered: string;
    total_shipped: string;
    total_returned: string;
  }>(query, params);
  
  const row = result?.rows[0];
  if (!row) {
    return {
      totalRevenue: 0,
      totalCommission: 0,
      totalClicks: 0,
      totalOrdered: 0,
      totalShipped: 0,
      totalReturned: 0,
      avgEpc: 0,
      avgConversionRate: 0,
      period: { start: startDate, end: endDate },
    };
  }
  
  const totalClicks = parseInt(row.total_clicks, 10);
  const totalCommission = parseFloat(row.total_commission);
  const totalOrdered = parseInt(row.total_ordered, 10);
  
  return {
    totalRevenue: parseFloat(row.total_revenue),
    totalCommission,
    totalClicks,
    totalOrdered: parseInt(row.total_ordered, 10),
    totalShipped: parseInt(row.total_shipped, 10),
    totalReturned: parseInt(row.total_returned, 10),
    avgEpc: totalClicks > 0 ? totalCommission / totalClicks : 0,
    avgConversionRate: totalClicks > 0 ? totalOrdered / totalClicks : 0,
    period: { start: startDate, end: endDate },
  };
}

/**
 * Get earnings grouped by tracking ID
 */
export async function getEarningsByTrackingId(
  startDate: string,
  endDate: string
): Promise<EarningsByTrackingId[]> {
  const result = await db.query<EarningsByTrackingId>(
    `SELECT 
      tracking_id,
      COALESCE(SUM(revenue), 0)::numeric(10,2) AS revenue,
      COALESCE(SUM(commission), 0)::numeric(10,2) AS commission,
      COALESCE(SUM(clicks), 0)::int AS clicks,
      COALESCE(SUM(ordered_items), 0)::int AS ordered_items,
      COALESCE(SUM(shipped_items), 0)::int AS shipped_items,
      CASE 
        WHEN SUM(clicks) > 0 THEN (SUM(commission) / SUM(clicks))::numeric(8,4)
        ELSE 0
      END AS epc,
      CASE 
        WHEN SUM(clicks) > 0 THEN (SUM(ordered_items)::numeric / SUM(clicks)::numeric)::numeric(5,4)
        ELSE 0
      END AS conversion_rate
    FROM earnings_reports
    WHERE report_date >= $1 AND report_date <= $2
    GROUP BY tracking_id
    ORDER BY commission DESC`,
    [startDate, endDate]
  );
  
  return result?.rows.map(row => ({
    tracking_id: row.tracking_id,
    revenue: parseFloat(String(row.revenue)),
    commission: parseFloat(String(row.commission)),
    clicks: parseInt(String(row.clicks), 10),
    ordered_items: parseInt(String(row.ordered_items), 10),
    shipped_items: parseInt(String(row.shipped_items), 10),
    epc: parseFloat(String(row.epc)),
    conversion_rate: parseFloat(String(row.conversion_rate)),
  })) || [];
}

/**
 * Get daily earnings trend
 */
export async function getDailyEarningsTrend(
  startDate: string,
  endDate: string,
  trackingId?: string
): Promise<Array<{ date: string; revenue: number; commission: number; clicks: number }>> {
  let query = `
    SELECT 
      report_date AS date,
      COALESCE(SUM(revenue), 0)::numeric(10,2) AS revenue,
      COALESCE(SUM(commission), 0)::numeric(10,2) AS commission,
      COALESCE(SUM(clicks), 0)::int AS clicks
    FROM earnings_reports
    WHERE report_date >= $1 AND report_date <= $2
  `;
  
  const params: any[] = [startDate, endDate];
  
  if (trackingId) {
    query += ' AND tracking_id = $3';
    params.push(trackingId);
  }
  
  query += `
    GROUP BY report_date
    ORDER BY report_date ASC
  `;
  
  const result = await db.query<{
    date: string;
    revenue: string;
    commission: string;
    clicks: string;
  }>(query, params);
  
  return result?.rows.map(row => ({
    date: row.date,
    revenue: parseFloat(row.revenue),
    commission: parseFloat(row.commission),
    clicks: parseInt(row.clicks, 10),
  })) || [];
}

/**
 * Get latest sync status
 */
export async function getLatestSyncStatus(): Promise<{
  lastSync: string | null;
  status: string;
  recordsSynced: number;
  trackingIds: string[];
} | null> {
  const result = await db.query<{
    started_at: string;
    status: string;
    records_synced: number;
    tracking_ids: string[];
  }>(
    `SELECT started_at, status, records_synced, tracking_ids
     FROM earnings_sync_log
     ORDER BY started_at DESC
     LIMIT 1`
  );
  
  if (!result?.rows[0]) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    lastSync: row.started_at,
    status: row.status,
    recordsSynced: row.records_synced,
    trackingIds: row.tracking_ids || [],
  };
}

