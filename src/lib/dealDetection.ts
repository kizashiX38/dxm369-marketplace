// src/lib/dealDetection.ts
// Live Deal Detection Engine
// Price drop algorithms, trending detection, and flash sale monitoring

import { DealRadarItem, HardwareCategory } from "@/lib/dealRadar";

// Deal detection configuration
interface DealDetectionConfig {
  priceDropThreshold: number; // Minimum % drop to qualify as deal
  trendingThreshold: number; // Minimum score change for trending
  flashSaleThreshold: number; // Minimum % drop for flash sale
  monitoringInterval: number; // Minutes between checks
  historyDays: number; // Days of price history to analyze
}

const defaultConfig: DealDetectionConfig = {
  priceDropThreshold: 10, // 10% price drop
  trendingThreshold: 0.5, // 0.5 point DXM score increase
  flashSaleThreshold: 20, // 20% flash sale threshold
  monitoringInterval: 15, // Check every 15 minutes
  historyDays: 30 // 30 days of history
};

// Price history entry
interface PriceHistoryEntry {
  timestamp: Date;
  price: number;
  availability: string;
  source: string;
}

// Deal alert types
export type DealAlertType = 
  | "price_drop" 
  | "flash_sale" 
  | "trending_up" 
  | "trending_down" 
  | "back_in_stock" 
  | "limited_stock" 
  | "new_low_price" 
  | "price_spike";

// Deal alert interface
export interface DealAlert {
  id: string;
  type: DealAlertType;
  product: DealRadarItem;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  data: {
    currentPrice: number;
    previousPrice?: number;
    percentChange?: number;
    dxmScoreChange?: number;
    timeframe?: string;
  };
  timestamp: Date;
  expires?: Date;
}

// Trending analysis result
interface TrendingAnalysis {
  direction: "up" | "down" | "stable";
  strength: number; // 0-1 scale
  momentum: number; // Rate of change
  confidence: number; // 0-1 confidence level
  timeframe: string;
}

// Price pattern detection
interface PricePattern {
  type: "seasonal" | "weekly" | "flash" | "gradual" | "volatile";
  confidence: number;
  description: string;
  predictedNext?: {
    price: number;
    timeframe: string;
    confidence: number;
  };
}

// Main deal detection engine
export class DealDetectionEngine {
  private config: DealDetectionConfig;
  private priceHistory = new Map<string, PriceHistoryEntry[]>();
  private activeAlerts = new Map<string, DealAlert[]>();

  constructor(config?: Partial<DealDetectionConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // Add price data point
  addPriceData(productId: string, price: number, availability: string = "In Stock", source: string = "amazon"): void {
    if (!this.priceHistory.has(productId)) {
      this.priceHistory.set(productId, []);
    }

    const history = this.priceHistory.get(productId)!;
    history.push({
      timestamp: new Date(),
      price,
      availability,
      source
    });

    // Keep only recent history
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.historyDays);
    
    const filteredHistory = history.filter(entry => entry.timestamp >= cutoffDate);
    this.priceHistory.set(productId, filteredHistory);
  }

  // Detect price drops
  detectPriceDrops(product: DealRadarItem): DealAlert[] {
    const alerts: DealAlert[] = [];
    const history = this.priceHistory.get(product.id) || [];
    
    if (history.length < 2) return alerts;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const percentDrop = ((previous.price - current.price) / previous.price) * 100;
    
    if (percentDrop >= this.config.priceDropThreshold) {
      const severity = this.calculatePriceDropSeverity(percentDrop);
      
      alerts.push({
        id: `price_drop_${product.id}_${Date.now()}`,
        type: percentDrop >= this.config.flashSaleThreshold ? "flash_sale" : "price_drop",
        product,
        severity,
        message: `Price dropped ${percentDrop.toFixed(1)}% from $${previous.price.toFixed(2)} to $${current.price.toFixed(2)}`,
        data: {
          currentPrice: current.price,
          previousPrice: previous.price,
          percentChange: -percentDrop,
          timeframe: this.getTimeframe(previous.timestamp, current.timestamp)
        },
        timestamp: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }

    // Check for new low price
    const historicalLow = Math.min(...history.map(h => h.price));
    if (current.price <= historicalLow && percentDrop > 0) {
      alerts.push({
        id: `new_low_${product.id}_${Date.now()}`,
        type: "new_low_price",
        product,
        severity: "high",
        message: `New historical low price: $${current.price.toFixed(2)}`,
        data: {
          currentPrice: current.price,
          timeframe: `${this.config.historyDays} days`
        },
        timestamp: new Date(),
        expires: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      });
    }

    return alerts;
  }

  // Analyze trending patterns
  analyzeTrending(product: DealRadarItem): TrendingAnalysis {
    const history = this.priceHistory.get(product.id) || [];
    
    if (history.length < 5) {
      return {
        direction: "stable",
        strength: 0,
        momentum: 0,
        confidence: 0,
        timeframe: "insufficient_data"
      };
    }

    // Calculate price momentum over different timeframes
    const recent = history.slice(-5); // Last 5 data points
    const older = history.slice(-10, -5); // Previous 5 data points
    
    const recentAvg = recent.reduce((sum, h) => sum + h.price, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, h) => sum + h.price, 0) / older.length : recentAvg;
    
    const momentum = (recentAvg - olderAvg) / olderAvg;
    const direction = momentum > 0.02 ? "up" : momentum < -0.02 ? "down" : "stable";
    const strength = Math.abs(momentum);
    
    // Calculate confidence based on consistency
    const priceChanges = recent.slice(1).map((h, i) => h.price - recent[i].price);
    const consistentDirection = priceChanges.filter(change => 
      (momentum > 0 && change > 0) || (momentum < 0 && change < 0)
    ).length;
    const confidence = consistentDirection / priceChanges.length;

    return {
      direction,
      strength: Math.min(strength * 10, 1), // Scale to 0-1
      momentum,
      confidence,
      timeframe: `${recent.length} data points`
    };
  }

  // Detect price patterns
  detectPricePatterns(product: DealRadarItem): PricePattern[] {
    const history = this.priceHistory.get(product.id) || [];
    const patterns: PricePattern[] = [];
    
    if (history.length < 10) return patterns;

    // Detect volatility
    const prices = history.map(h => h.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / avgPrice;

    if (volatility > 0.15) {
      patterns.push({
        type: "volatile",
        confidence: Math.min(volatility * 2, 1),
        description: `High price volatility (${(volatility * 100).toFixed(1)}% coefficient of variation)`
      });
    }

    // Detect gradual trends
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, h) => sum + h.price, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.price, 0) / secondHalf.length;
    
    const trendStrength = Math.abs(secondAvg - firstAvg) / firstAvg;
    
    if (trendStrength > 0.1) {
      patterns.push({
        type: "gradual",
        confidence: Math.min(trendStrength * 3, 1),
        description: `${secondAvg > firstAvg ? "Gradual price increase" : "Gradual price decrease"} over time`,
        predictedNext: {
          price: secondAvg + (secondAvg - firstAvg) * 0.5,
          timeframe: "next week",
          confidence: Math.min(trendStrength * 2, 0.8)
        }
      });
    }

    // Detect flash sales (sudden drops followed by recovery)
    for (let i = 2; i < history.length - 2; i++) {
      const before = history[i - 1].price;
      const during = history[i].price;
      const after = history[i + 1].price;
      
      const dropPercent = (before - during) / before;
      const recoveryPercent = (after - during) / during;
      
      if (dropPercent > 0.15 && recoveryPercent > 0.1) {
        patterns.push({
          type: "flash",
          confidence: Math.min((dropPercent + recoveryPercent) * 2, 1),
          description: `Flash sale pattern detected: ${(dropPercent * 100).toFixed(1)}% drop with quick recovery`
        });
        break; // Only report one flash pattern
      }
    }

    return patterns;
  }

  // Get trending products
  getTrendingProducts(products: DealRadarItem[], limit: number = 10): Array<{
    product: DealRadarItem;
    trending: TrendingAnalysis;
    alerts: DealAlert[];
  }> {
    const trending = products.map(product => ({
      product,
      trending: this.analyzeTrending(product),
      alerts: this.detectPriceDrops(product)
    }));

    // Sort by trending strength and momentum
    return trending
      .filter(t => t.trending.confidence > 0.3) // Only confident trends
      .sort((a, b) => {
        const aScore = a.trending.strength * a.trending.confidence;
        const bScore = b.trending.strength * b.trending.confidence;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  // Get flash sales
  getFlashSales(products: DealRadarItem[]): DealAlert[] {
    const flashSales: DealAlert[] = [];
    
    for (const product of products) {
      const alerts = this.detectPriceDrops(product);
      flashSales.push(...alerts.filter(alert => alert.type === "flash_sale"));
    }

    return flashSales.sort((a, b) => 
      (b.data.percentChange || 0) - (a.data.percentChange || 0)
    );
  }

  // Monitor for deal alerts
  monitorDeals(products: DealRadarItem[]): DealAlert[] {
    const allAlerts: DealAlert[] = [];
    
    for (const product of products) {
      // Price drop detection
      const priceAlerts = this.detectPriceDrops(product);
      allAlerts.push(...priceAlerts);
      
      // Stock alerts
      if (product.availability === "Limited Stock") {
        allAlerts.push({
          id: `limited_stock_${product.id}_${Date.now()}`,
          type: "limited_stock",
          product,
          severity: "medium",
          message: "Limited stock remaining",
          data: { currentPrice: product.price },
          timestamp: new Date(),
          expires: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
        });
      }
      
      // High DXM score alerts
      if (product.dxmScore >= 9.0) {
        allAlerts.push({
          id: `high_score_${product.id}_${Date.now()}`,
          type: "trending_up",
          product,
          severity: "high",
          message: `Exceptional DXM Score: ${product.dxmScore.toFixed(2)}/10`,
          data: { 
            currentPrice: product.price,
            dxmScoreChange: product.dxmScore - 8.0
          },
          timestamp: new Date(),
          expires: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
        });
      }
    }
    
    return allAlerts;
  }

  // Helper methods
  private calculatePriceDropSeverity(percentDrop: number): "low" | "medium" | "high" | "critical" {
    if (percentDrop >= 30) return "critical";
    if (percentDrop >= 20) return "high";
    if (percentDrop >= 15) return "medium";
    return "low";
  }

  private getTimeframe(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return `${Math.round(diffMs / (1000 * 60))} minutes`;
    if (diffHours < 24) return `${Math.round(diffHours)} hours`;
    return `${Math.round(diffHours / 24)} days`;
  }

  // Utility methods
  getPriceHistory(productId: string): PriceHistoryEntry[] {
    return this.priceHistory.get(productId) || [];
  }

  getActiveAlerts(productId?: string): DealAlert[] {
    if (productId) {
      return this.activeAlerts.get(productId) || [];
    }
    
    return Array.from(this.activeAlerts.values()).flat();
  }

  clearExpiredAlerts(): number {
    const now = new Date();
    let cleared = 0;
    
    for (const [productId, alerts] of this.activeAlerts.entries()) {
      const validAlerts = alerts.filter(alert => !alert.expires || alert.expires > now);
      cleared += alerts.length - validAlerts.length;
      
      if (validAlerts.length === 0) {
        this.activeAlerts.delete(productId);
      } else {
        this.activeAlerts.set(productId, validAlerts);
      }
    }
    
    return cleared;
  }

  getStats() {
    return {
      trackedProducts: this.priceHistory.size,
      totalDataPoints: Array.from(this.priceHistory.values()).reduce((sum, history) => sum + history.length, 0),
      activeAlerts: this.getActiveAlerts().length,
      config: this.config
    };
  }
}

// Export singleton instance
export const dealDetectionEngine = new DealDetectionEngine();

// Helper functions for easy use
export function detectDealsForProducts(products: DealRadarItem[]): DealAlert[] {
  // Add current price data for all products
  for (const product of products) {
    dealDetectionEngine.addPriceData(
      product.id, 
      product.price, 
      product.availability || "In Stock"
    );
  }
  
  return dealDetectionEngine.monitorDeals(products);
}

export function getTrendingDealsWithAnalysis(products: DealRadarItem[], limit: number = 6) {
  return dealDetectionEngine.getTrendingProducts(products, limit);
}

export function getFlashSaleAlerts(products: DealRadarItem[]): DealAlert[] {
  return dealDetectionEngine.getFlashSales(products);
}
