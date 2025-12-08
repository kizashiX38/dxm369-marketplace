"use client";

// src/lib/tracking.ts
// DXM Click + Conversion Tracking Pipeline
// Fire-and-forget analytics for affiliate revenue optimization
// CLIENT-ONLY: Uses browser APIs (document, sessionStorage, navigator)

export interface AffiliateClickEvent {
  asin: string;
  category: string;
  price: number;
  dxmScore: number;
  source: string; // e.g. "gpu-grid", "hero-featured", "trending-card", etc.
  brand?: string;
  title?: string;
}

export interface ConversionEvent {
  asin: string;
  category: string;
  price: number;
  commission?: number;
  source: string;
}

export interface PageViewEvent {
  page: string;
  category?: string;
  source?: string;
}

/**
 * Track affiliate link clicks
 * Fire-and-forget; never blocks UX
 */
export async function trackAffiliateClick(event: AffiliateClickEvent) {
  try {
    // fire-and-forget; we don't await result strictly
    void fetch("/api/dxm/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        ts: new Date().toISOString(),
        sessionId: getSessionId(),
        userAgent: navigator.userAgent,
      }),
      keepalive: true, // better chance of firing before tab close
    });
  } catch {
    // swallow errors; tracking should never block UX
  }
}

/**
 * Track page views for analytics
 */
export async function trackPageView(event: PageViewEvent) {
  try {
    void fetch("/api/dxm/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        ts: new Date().toISOString(),
        sessionId: getSessionId(),
        referrer: document.referrer,
      }),
      keepalive: true,
    });
  } catch {
    // swallow errors
  }
}

/**
 * Track conversions (when we get commission data)
 */
export async function trackConversion(event: ConversionEvent) {
  try {
    void fetch("/api/dxm/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        ts: new Date().toISOString(),
        sessionId: getSessionId(),
      }),
      keepalive: true,
    });
  } catch {
    // swallow errors
  }
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("dxm_session_id");
  if (!sessionId) {
    sessionId = `dxm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("dxm_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Track search queries
 */
export async function trackSearch(query: string, category?: string, resultsCount?: number) {
  try {
    void fetch("/api/dxm/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        category,
        resultsCount,
        ts: new Date().toISOString(),
        sessionId: getSessionId(),
      }),
      keepalive: true,
    });
  } catch {
    // swallow errors
  }
}

/**
 * Batch tracking events for performance
 */
class TrackingBatch {
  private events: any[] = [];
  private timeout: NodeJS.Timeout | null = null;

  add(event: any) {
    this.events.push(event);
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.flush();
    }, 1000); // Batch for 1 second
  }

  private async flush() {
    if (this.events.length === 0) return;

    try {
      void fetch("/api/dxm/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: this.events,
          ts: new Date().toISOString(),
        }),
        keepalive: true,
      });
    } catch {
      // swallow errors
    }

    this.events = [];
    this.timeout = null;
  }
}

export const trackingBatch = new TrackingBatch();
