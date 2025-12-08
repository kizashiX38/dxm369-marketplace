// src/lib/services/newsletter.ts
// DXM369 Newsletter Subscription Service
// Manages email subscriptions to database

import { query, queryOne, isDatabaseConfigured } from '@/lib/db';

/**
 * Newsletter subscriber data
 */
export interface Subscriber {
  id: number;
  email: string;
  source?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

/**
 * Subscription result
 */
export interface SubscriptionResult {
  success: boolean;
  message: string;
  subscriber?: Subscriber;
  isNew?: boolean;
}

/**
 * Subscribe an email to the newsletter
 * Handles duplicate subscriptions gracefully
 */
export async function subscribe(
  email: string,
  source?: string
): Promise<SubscriptionResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email address format',
    };
  }
  
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!isDatabaseConfigured()) {
    console.log('[DXM369 Newsletter] Database not configured, subscription not saved:', normalizedEmail);
    return {
      success: true,
      message: 'Subscription received (database not configured)',
      isNew: true,
    };
  }
  
  try {
    // Check if already subscribed
    const existing = await queryOne<Subscriber>(
      'SELECT * FROM newsletter_subscribers WHERE email = $1',
      [normalizedEmail]
    );
    
    if (existing) {
      // If previously unsubscribed, resubscribe
      if (existing.unsubscribedAt) {
        await query(
          `UPDATE newsletter_subscribers 
           SET unsubscribed_at = NULL, source = $2, subscribed_at = NOW()
           WHERE email = $1`,
          [normalizedEmail, source || existing.source]
        );
        
        return {
          success: true,
          message: 'Welcome back! You have been resubscribed.',
          subscriber: { ...existing, unsubscribedAt: undefined },
          isNew: false,
        };
      }
      
      return {
        success: true,
        message: 'You are already subscribed!',
        subscriber: existing,
        isNew: false,
      };
    }
    
    // New subscription
    const result = await query<Subscriber>(
      `INSERT INTO newsletter_subscribers (email, source, subscribed_at)
       VALUES ($1, $2, NOW())
       RETURNING id, email, source, subscribed_at as "subscribedAt"`,
      [normalizedEmail, source || 'website']
    );
    
    if (result && result.rows[0]) {
      console.log('[DXM369 Newsletter] New subscriber:', normalizedEmail);
      return {
        success: true,
        message: 'Successfully subscribed! Welcome to DXM369.',
        subscriber: result.rows[0],
        isNew: true,
      };
    }
    
    return {
      success: false,
      message: 'Failed to subscribe. Please try again.',
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[DXM369 Newsletter] Subscription error:', err.message);
    return {
      success: false,
      message: 'An error occurred. Please try again later.',
    };
  }
}

/**
 * Unsubscribe an email from the newsletter
 */
export async function unsubscribe(email: string): Promise<SubscriptionResult> {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!isDatabaseConfigured()) {
    return {
      success: true,
      message: 'Unsubscription processed',
    };
  }
  
  try {
    const result = await query(
      `UPDATE newsletter_subscribers 
       SET unsubscribed_at = NOW() 
       WHERE email = $1 AND unsubscribed_at IS NULL`,
      [normalizedEmail]
    );
    
    if (result && result.rowCount && result.rowCount > 0) {
      console.log('[DXM369 Newsletter] Unsubscribed:', normalizedEmail);
      return {
        success: true,
        message: 'You have been unsubscribed successfully.',
      };
    }
    
    return {
      success: true,
      message: 'Email not found or already unsubscribed.',
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[DXM369 Newsletter] Unsubscribe error:', err.message);
    return {
      success: false,
      message: 'An error occurred. Please try again later.',
    };
  }
}

/**
 * Check if an email is subscribed
 */
export async function isSubscribed(email: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM newsletter_subscribers 
       WHERE email = $1 AND unsubscribed_at IS NULL`,
      [normalizedEmail]
    );
    
    return parseInt(result?.count || '0', 10) > 0;
  } catch {
    return false;
  }
}

/**
 * Get subscriber count
 */
export async function getSubscriberCount(): Promise<number> {
  if (!isDatabaseConfigured()) {
    return 0;
  }
  
  try {
    const result = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM newsletter_subscribers WHERE unsubscribed_at IS NULL'
    );
    
    return parseInt(result?.count || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Get all active subscribers
 */
export async function getActiveSubscribers(limit: number = 1000): Promise<Subscriber[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }
  
  try {
    const result = await query<Subscriber>(
      `SELECT id, email, source, subscribed_at as "subscribedAt"
       FROM newsletter_subscribers 
       WHERE unsubscribed_at IS NULL
       ORDER BY subscribed_at DESC
       LIMIT $1`,
      [limit]
    );
    
    return result?.rows || [];
  } catch {
    return [];
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribed: number;
  bySource: Record<string, number>;
}> {
  if (!isDatabaseConfigured()) {
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      unsubscribed: 0,
      bySource: {},
    };
  }
  
  try {
    // Total and active
    const countResult = await queryOne<{
      total: string;
      active: string;
      unsubscribed: string;
    }>(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE unsubscribed_at IS NULL) as active,
        COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as unsubscribed
       FROM newsletter_subscribers`
    );
    
    // By source
    const sourceResult = await query<{ source: string; count: string }>(
      `SELECT source, COUNT(*) as count 
       FROM newsletter_subscribers 
       WHERE unsubscribed_at IS NULL
       GROUP BY source`
    );
    
    const bySource: Record<string, number> = {};
    sourceResult?.rows.forEach(row => {
      bySource[row.source || 'unknown'] = parseInt(row.count, 10);
    });
    
    return {
      totalSubscribers: parseInt(countResult?.total || '0', 10),
      activeSubscribers: parseInt(countResult?.active || '0', 10),
      unsubscribed: parseInt(countResult?.unsubscribed || '0', 10),
      bySource,
    };
  } catch {
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      unsubscribed: 0,
      bySource: {},
    };
  }
}

export const newsletterService = {
  subscribe,
  unsubscribe,
  isSubscribed,
  getSubscriberCount,
  getActiveSubscribers,
  getSubscriptionStats,
};

export default newsletterService;

