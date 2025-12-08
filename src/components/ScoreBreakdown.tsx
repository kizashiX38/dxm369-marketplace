// src/components/ScoreBreakdown.tsx
// DXM Score Breakdown Tooltip - Professional Transparency Component
// Shows detailed score component breakdown on hover for trust building

"use client";

import { useState } from "react";
import { DXMProduct } from "@/lib/types/product";

interface ScoreBreakdownProps {
  deal: DXMProduct;
  className?: string;
}

interface ScoreComponent {
  name: string;
  value: number;
  weight: number;
  description: string;
  color: string;
  icon: string;
}

export function ScoreBreakdown({ deal, className = "" }: ScoreBreakdownProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Mock score breakdown calculation (in production, this would come from dxmScoring.ts)
  const scoreComponents: ScoreComponent[] = [
    {
      name: "Performance Value",
      value: calculatePerformanceValue(deal),
      weight: 40,
      description: "Performance per dollar vs segment median",
      color: "text-emerald-300 border-emerald-500/60 bg-emerald-500/10",
      icon: "⚡"
    },
    {
      name: "Deal Quality", 
      value: calculateDealQuality(deal),
      weight: 25,
      description: "Price vs MSRP and recent trends",
      color: "text-cyan-300 border-cyan-500/60 bg-cyan-500/10",
      icon: "💰"
    },
    {
      name: "Trust Signal",
      value: calculateTrustSignal(deal),
      weight: 15,
      description: "Amazon rating, review count, brand reputation",
      color: "text-blue-300 border-blue-500/60 bg-blue-500/10",
      icon: "🛡️"
    },
    {
      name: "Efficiency",
      value: calculateEfficiency(deal),
      weight: 10,
      description: "Performance per watt (power efficiency)",
      color: "text-amber-300 border-amber-500/60 bg-amber-500/10",
      icon: "🔋"
    },
    {
      name: "Trend Signal",
      value: calculateTrendSignal(deal),
      weight: 10,
      description: "Click-through rate and momentum indicators",
      color: "text-rose-300 border-rose-500/60 bg-rose-500/10",
      icon: "📈"
    }
  ];

  const finalScore = scoreComponents.reduce((sum, component) => 
    sum + (component.value * component.weight / 100), 0
  );

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Score Display with Hover Trigger */}
      <div
        className="cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-[2px] text-[10px] font-medium text-slate-300 transition-all hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-200">
          <span className="h-[6px] w-[6px] rounded-full bg-current animate-pulse" />
          DXM Score {deal.dxmScore.toFixed(2)}
          <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>

      {/* Tooltip Breakdown */}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-80 -translate-x-1/2 transform">
          <div className="glass-panel p-4 shadow-[0_0_40px_rgba(6,182,212,0.3)] border border-cyan-400/30 clip-corner-tl holographic-sheen">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
                DXM Score Breakdown
              </h3>
              <span className="text-lg font-bold text-white">
                {finalScore.toFixed(2)}
              </span>
            </div>

            {/* Score Components */}
            <div className="space-y-2">
              {scoreComponents.map((component, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{component.icon}</span>
                    <div>
                      <div className="text-[10px] font-medium text-slate-300">
                        {component.name}
                      </div>
                      <div className="text-[9px] text-slate-500 leading-tight">
                        {component.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-mono">
                      {component.weight}%
                    </span>
                    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-medium ${component.color}`}>
                      {component.value.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Methodology Footer */}
            <div className="mt-3 pt-2 border-t border-slate-800/50">
              <p className="text-[8px] text-slate-500 leading-relaxed font-mono">
                DXM Value Score uses segment-normalized performance data, real-time pricing signals, 
                and market intelligence to rank hardware deals. Higher scores indicate better value propositions.
              </p>
            </div>

            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 transform">
              <div className="h-2 w-2 rotate-45 border-b border-r border-cyan-400/30 bg-slate-900/90" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock calculation functions (in production, these would use real DXM scoring logic)
function calculatePerformanceValue(deal: DXMProduct): number {
  // Mock: Higher performance GPUs get better scores, normalized by price
  const vram = deal.specs.vram ? parseInt(deal.specs.vram) : 0;
  const baseScore = deal.category === 'GPU' ? 
    (vram > 0 ? vram * 0.5 : 5) : 7;
  const priceAdjustment = Math.max(0, 10 - (deal.price / 200));
  return Math.min(10, Math.max(0, baseScore + priceAdjustment));
}

function calculateDealQuality(deal: DXMProduct): number {
  // Mock: Based on discount percentage and savingsPercent
  if (!deal.originalPrice || deal.originalPrice <= deal.price) return 5.0;
  
  const discountPercent = deal.savingsPercent ? deal.savingsPercent / 100 : 
    (deal.originalPrice - deal.price) / deal.originalPrice;
  const baseScore = Math.min(10, discountPercent * 50); // 20% discount = 10/10 score
    
  return Math.min(10, Math.max(0, baseScore));
}

function calculateTrustSignal(deal: DXMProduct): number {
  // Mock: Vendor reputation + availability + prime eligibility
  const vendorScore = deal.vendor === 'Amazon' ? 9.0 : 7.5;
  
  const availabilityBonus = deal.availability === 'in_stock' ? 1.0 : 
                           deal.availability === 'limited' ? 0.5 : 0;
  
  const primeBonus = deal.isPrime ? 0.5 : 0;
  
  return Math.min(10, Math.max(0, vendorScore + availabilityBonus + primeBonus));
}

function calculateEfficiency(deal: DXMProduct): number {
  // Mock: Performance per watt calculation
  if (!deal.specs.tdp) return 6.0;
  
  const tdpValue = parseInt(deal.specs.tdp.replace('W', ''));
  const vram = deal.specs.vram ? parseInt(deal.specs.vram) : 0;
  const performanceEstimate = deal.category === 'GPU' ? 
    (vram > 0 ? vram * 10 : 50) : 60;
  
  const efficiency = performanceEstimate / tdpValue;
  return Math.min(10, Math.max(0, efficiency * 2)); // Normalize to 0-10 scale
}

function calculateTrendSignal(deal: DXMProduct): number {
  // Mock: Price momentum and market interest
  const baseTrend = 6.0; // Neutral baseline
  
  // Category popularity bonus
  const categoryBonus = deal.category === 'GPU' ? 1.5 : 
                       deal.category === 'CPU' ? 1.0 : 
                       deal.category === 'Laptop' ? 0.5 : 0;
  
  return Math.min(10, Math.max(0, baseTrend + categoryBonus));
}

// Compact version for smaller spaces
export function CompactScoreBreakdown({ deal, className = "" }: ScoreBreakdownProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        className="text-[9px] text-slate-500 hover:text-cyan-400 transition-colors font-mono"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        Why {deal.dxmScore.toFixed(2)}?
      </button>

      {isVisible && (
        <div className="absolute bottom-full right-0 z-50 mb-1 w-64">
          <div className="glass-panel-secondary p-3 text-[9px] border border-cyan-500/20">
            <div className="text-cyan-300 font-medium mb-1">Quick Breakdown:</div>
            <div className="space-y-0.5 text-slate-400">
              <div>• Performance/$ vs segment: {calculatePerformanceValue(deal).toFixed(1)}/10</div>
              <div>• Deal quality vs MSRP: {calculateDealQuality(deal).toFixed(1)}/10</div>
              <div>• Trust signals: {calculateTrustSignal(deal).toFixed(1)}/10</div>
              <div>• Power efficiency: {calculateEfficiency(deal).toFixed(1)}/10</div>
              <div>• Market momentum: {calculateTrendSignal(deal).toFixed(1)}/10</div>
            </div>
            <div className="absolute top-full right-4">
              <div className="h-1 w-1 rotate-45 border-b border-r border-cyan-500/20 bg-slate-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
