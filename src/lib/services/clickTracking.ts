// src/lib/services/clickTracking.ts
// DXM369 Click Tracking Service
// Records affiliate click events to database for analytics

import { query, isDatabaseConfigured } from '@/lib/db';

/**
 * Click event data structure
 */
export interface ClickEvent {
  asin: string;
  category: string;
  price?: number;
  dxmScore?: number;
  source?: string;
  brand?: string;
  title?: string;
  userAgent?: string;
  ipHash?: string;
  referrer?: string;
}

/**
 * Recorded click event with metadata
 */
export interface RecordedClick extends ClickEvent {
  id: number;
  productId?: number;
  offerId?: number;
  timestamp: Date;
}

/**
 * Record a click event to the database
 * Gracefully handles missing database configuration
 */
export async function recordClick(event: ClickEvent): Promise<RecordedClick | null> {
  if (!isDatabaseConfigured()) {
    console.log('[DXM369 Clicks] Database not configured, click not recorded:', event.asin);
    return null;
  }
  
  try {
    const result = await query<RecordedClick>(
      `INSERT INTO click_events (
        asin, category, price, dxm_score, source, 
        user_agent, ip_hash, referrer, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, asin, category, price, dxm_score as "dxmScore", 
                source, timestamp`,
      [
        event.asin,
        event.category,
        event.price || null,
        event.dxmScore || null,
        event.source || 'unknown',
        event.userAgent || null,
        event.ipHash || null,
        event.referrer || null,
      ]
    );
    
    if (result && result.rows[0]) {
      console.log('[DXM369 Clicks] Recorded click:', event.asin);
      return result.rows[0];
    }
    
    return null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[DXM369 Clicks] Failed to record click:', err.message);
    return null;
  }
}

/**
 * Get click count for a product
 */
export async function getClickCount(asin: string): Promise<number> {
  if (!isDatabaseConfigured()) {
    return 0;
  }
  
  try {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM click_events WHERE asin = $1',
      [asin]
    );
    
    return result ? parseInt(result.rows[0]?.count || '0', 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Get recent clicks with optional filtering
 */
export async function getRecentClicks(options: {
  limit?: number;
  category?: string;
  since?: Date;
}): Promise<RecordedClick[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }
  
  const { limit = 100, category, since } = options;
  
  let queryText = 'SELECT * FROM click_events WHERE 1=1';
  const params: unknown[] = [];
  let paramIndex = 1;
  
  if (category) {
    queryText += ` AND category = $${paramIndex++}`;
    params.push(category);
  }
  
  if (since) {
    queryText += ` AND timestamp >= $${paramIndex++}`;
    params.push(since);
  }
  
  queryText += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
  params.push(limit);
  
  try {
    const result = await query<RecordedClick>(queryText, params);
    return result?.rows || [];
  } catch {
    return [];
  }
}

/**
 * Get click analytics summary
 */
export async function getClickAnalytics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
  totalClicks: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  topProducts: Array<{ asin: string; clicks: number }>;
}> {
  if (!isDatabaseConfigured()) {
    return {
      totalClicks: 0,
      byCategory: {},
      bySource: {},
      topProducts: [],
    };
  }
  
  const intervals: Record<string, string> = {
    hour: '1 hour',
    day: '1 day',
    week: '7 days',
    month: '30 days',
  };
  
  const interval = intervals[timeframe];
  
  try {
    // Total clicks
    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM click_events WHERE timestamp > NOW() - INTERVAL '${interval}'`
    );
    const totalClicks = parseInt(totalResult?.rows[0]?.count || '0', 10);
    
    // By category
    const categoryResult = await query<{ category: string; count: string }>(
      `SELECT category, COUNT(*) as count FROM click_events 
       WHERE timestamp > NOW() - INTERVAL '${interval}'
       GROUP BY category`
    );
    const byCategory: Record<string, number> = {};
    categoryResult?.rows.forEach(row => {
      byCategory[row.category] = parseInt(row.count, 10);
    });
    
    // By source
    const sourceResult = await query<{ source: string; count: string }>(
      `SELECT source, COUNT(*) as count FROM click_events 
       WHERE timestamp > NOW() - INTERVAL '${interval}'
       GROUP BY source`
    );
    const bySource: Record<string, number> = {};
    sourceResult?.rows.forEach(row => {
      bySource[row.source] = parseInt(row.count, 10);
    });
    
    // Top products
    const topResult = await query<{ asin: string; clicks: string }>(
      `SELECT asin, COUNT(*) as clicks FROM click_events 
       WHERE timestamp > NOW() - INTERVAL '${interval}'
       GROUP BY asin ORDER BY clicks DESC LIMIT 10`
    );
    const topProducts = topResult?.rows.map(row => ({
      asin: row.asin,
      clicks: parseInt(row.clicks, 10),
    })) || [];
    
    return {
      totalClicks,
      byCategory,
      bySource,
      topProducts,
    };
  } catch {
    return {
      totalClicks: 0,
      byCategory: {},
      bySource: {},
      topProducts: [],
    };
  }
}

export const clickTrackingService = {
  recordClick,
  getClickCount,
  getRecentClicks,
  getClickAnalytics,
};

export default clickTrackingService;

