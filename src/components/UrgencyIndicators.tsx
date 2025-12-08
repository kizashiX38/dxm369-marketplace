// src/components/UrgencyIndicators.tsx
// Conversion Optimization - Urgency & Scarcity Indicators
// Designed to increase click-through rates and affiliate conversions

"use client";

import { DXMProduct } from "@/lib/types/product";
import { useState, useEffect } from "react";

interface UrgencyIndicatorsProps {
  deal: DXMProduct;
  className?: string;
}

export function UrgencyIndicators({ deal, className = "" }: UrgencyIndicatorsProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  // Calculate urgency factors
  const discountPercent = deal.savingsPercent || (deal.originalPrice && deal.originalPrice > deal.price 
    ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
    : 0);
  
  const isHighDemand = deal.dxmScore >= 8.5;
  const isLimitedStock = deal.availability === "limited";
  const isPrimeEligible = deal.isPrime;
  
  // Simulate flash sale countdown (for demo purposes)
  useEffect(() => {
    if (discountPercent >= 15) {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 6); // 6 hours from now
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = endTime.getTime() - now;
        
        if (distance > 0) {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft("Expired");
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [discountPercent]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Price Drop Alert */}
      {discountPercent >= 10 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-medium">
            Price dropped {discountPercent}% recently
          </span>
        </div>
      )}
      
      {/* Flash Sale Timer */}
      {discountPercent >= 15 && timeLeft && timeLeft !== "Expired" && (
        <div className="flex items-center gap-2 text-xs bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1">
          <div className="h-1.5 w-1.5 bg-rose-400 rounded-full animate-ping" />
          <span className="text-rose-400 font-medium">
            Flash Sale: {timeLeft} left
          </span>
        </div>
      )}
      
      {/* High Demand Indicator */}
      {isHighDemand && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-400 font-medium">
            High demand - DXM Score {deal.dxmScore.toFixed(1)}
          </span>
        </div>
      )}
      
      {/* Limited Stock Warning */}
      {isLimitedStock && (
        <div className="flex items-center gap-2 text-xs bg-orange-500/10 border border-orange-500/30 rounded px-2 py-1">
          <div className="h-1.5 w-1.5 bg-orange-400 rounded-full animate-pulse" />
          <span className="text-orange-400 font-medium">
            Limited stock remaining
          </span>
        </div>
      )}
      
      {/* Price Trend Indicator */}
      {discountPercent > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span className="text-emerald-400 font-medium">
            Price trending down
          </span>
        </div>
      )}
      
      {/* Prime Shipping Benefit */}
      {isPrimeEligible && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full" />
          <span className="text-cyan-400 font-medium">
            Prime: Free next-day delivery
          </span>
        </div>
      )}
    </div>
  );
}

// Recently Viewed Component for Cross-Selling
export function RecentlyViewed({ className = "" }: { className?: string }) {
  const [recentItems, setRecentItems] = useState<DXMProduct[]>([]);
  
  useEffect(() => {
    // Simulate recently viewed items (in production, this would come from localStorage/cookies)
    const mockRecentItems: Partial<DXMProduct>[] = [
      { id: "recent-1", asin: "B0XXXXX1", name: "RTX 4070 SUPER", price: 579, dxmScore: 8.7, category: "GPU", vendor: "Amazon", specs: {}, availability: "in_stock", lastUpdated: new Date().toISOString() },
      { id: "recent-2", asin: "B0XXXXX2", name: "RX 7800 XT", price: 479, dxmScore: 8.2, category: "GPU", vendor: "Amazon", specs: {}, availability: "in_stock", lastUpdated: new Date().toISOString() },
      { id: "recent-3", asin: "B0XXXXX3", name: "RTX 4060", price: 299, dxmScore: 7.9, category: "GPU", vendor: "Amazon", specs: {}, availability: "in_stock", lastUpdated: new Date().toISOString() }
    ];
    
    // Only show if user has viewed items
    if (Math.random() > 0.3) { // 70% chance to show
      setRecentItems(mockRecentItems as DXMProduct[]);
    }
  }, []);
  
  if (recentItems.length === 0) return null;
  
  return (
    <div className={`glass-panel-secondary p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-3">Recently Viewed</h3>
      <div className="space-y-2">
        {recentItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <span className="text-slate-300 truncate">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono">${item.price}</span>
              <span className="text-emerald-400 font-mono">{item.dxmScore?.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
        Compare All →
      </button>
    </div>
  );
}

// Social Proof Component
export function SocialProof({ deal, className = "" }: { deal: DXMProduct; className?: string }) {
  const [viewCount, setViewCount] = useState<number>(0);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  
  useEffect(() => {
    // Simulate social proof metrics (in production, this would come from analytics)
    const baseViews = Math.floor(Math.random() * 500) + 100;
    const basePurchases = Math.floor(baseViews * 0.05); // 5% conversion rate
    
    setViewCount(baseViews);
    setPurchaseCount(basePurchases);
  }, []);
  
  return (
    <div className={`flex items-center gap-4 text-xs text-slate-500 ${className}`}>
      <div className="flex items-center gap-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>{viewCount} viewed today</span>
      </div>
      
      {purchaseCount > 0 && (
        <div className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>{purchaseCount} purchased</span>
        </div>
      )}
      
      {deal.dxmScore >= 8.5 && (
        <div className="flex items-center gap-1 text-emerald-500">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Top rated</span>
        </div>
      )}
    </div>
  );
}

// Price Alert Component
export function PriceAlert({ deal, className = "" }: { deal: DXMProduct; className?: string }) {
  const [isAlertSet, setIsAlertSet] = useState(false);
  
  const handleSetAlert = () => {
    setIsAlertSet(true);
    // In production, this would save to user preferences or send to email service
    console.log(`Price alert set for ${deal.name} at $${deal.price}`);
  };
  
  return (
    <div className={`${className}`}>
      {!isAlertSet ? (
        <button 
          onClick={handleSetAlert}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5V7a12 12 0 1 1 24 0v10z" />
          </svg>
          <span>Set price alert</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Price alert active</span>
        </div>
      )}
    </div>
  );
}
