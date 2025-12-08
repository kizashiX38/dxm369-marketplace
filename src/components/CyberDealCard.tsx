// DXM369 Cyber-Glass Deal Card - Premium Hardware Intelligence Module
// Weapons-grade UI for tactical hardware evaluation

"use client";

import { DXMProduct, getAvailabilityDisplay } from "@/lib/types/product";
import { buildAmazonProductUrl } from "@/lib/affiliate";
import { trackAffiliateClick } from "@/lib/tracking";
import { DXMProductImage } from "@/components/DXMProductImage";
import { useMemo } from "react";

interface CyberDealCardProps {
  deal: DXMProduct;
  source?: string;
}

export function CyberDealCard({ deal, source = "cyber-grid" }: CyberDealCardProps) {
  const affiliateUrl = useMemo(() => buildAmazonProductUrl(deal.asin, {
    context: {
      category: deal.category.toLowerCase() as any,
      source: source.includes('seo') ? 'seo' : source.includes('social') ? 'social' : undefined,
      pageType: 'product',
    },
  }), [deal.asin, deal.category, source]);

  const {
    name: title,
    price,
    originalPrice: previousPrice,
    dxmScore,
    specs,
    imageUrl,
    availability,
    savingsPercent: discount,
    vendor: brand,
  } = deal;

  // Extract specs from specs object
  const vram = specs.vram;
  const tdp = specs.tdp;
  const boostClock = specs.boostClock;
  
  // DXM Score Tier Classification
  const getScoreTier = (score: number) => {
    if (score >= 9.0) return { tier: "PRIME", color: "text-cyan-300", glow: "glow-cyan" };
    if (score >= 8.0) return { tier: "ELITE", color: "text-blue-300", glow: "glow-blue" };
    if (score >= 7.0) return { tier: "SOLID", color: "text-green-300", glow: "glow-green" };
    if (score >= 6.0) return { tier: "WEAK", color: "text-yellow-300", glow: "" };
    return { tier: "JUNK", color: "text-red-300", glow: "" };
  };

  const scoreTier = getScoreTier(dxmScore);
  const energyPercent = Math.min((dxmScore / 10) * 100, 100);

  const handleClick = async () => {
    trackAffiliateClick({
      asin: deal.asin,
      category: deal.category,
      price,
      dxmScore,
      source,
    });
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group relative flex flex-col h-full glass-panel-premium rounded-xl p-4 hologram-sheen scanlines transition-all duration-500 hover:scale-[1.02] hover:glow-cyan-intense">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 tactical-grid opacity-20 rounded-xl" />
      
      {/* Status Indicator */}
      <div className="absolute top-3 right-3 status-online">
        <div className="status-ping" />
        <span className="text-[8px] font-mono uppercase tracking-widest text-cyan-400">
          {availability === "in_stock" ? "ONLINE" : availability === "limited" ? "LIMITED" : "OFFLINE"}
        </span>
      </div>

      {/* Product Image - Hologram Pad */}
      <div className="relative mb-4 p-3 glass-panel-cyber rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-lg" />
        <DXMProductImage
          product={{
            brand,
            title,
            category: deal.category.toLowerCase(),
            imageUrl
          }}
          className="w-full h-28 object-contain relative z-10"
          width={200}
          height={112}
        />
        {/* Hologram Base */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent rounded-full" />
      </div>

      {/* Brand Badge */}
      <div className="mb-2">
        <span className="inline-block px-2 py-1 text-[10px] font-mono uppercase tracking-widest bg-slate-800/60 border border-slate-600/40 rounded text-slate-300">
          {brand}
        </span>
      </div>

      {/* Product Title */}
      <h3 className="cyber-title text-sm text-white mb-3 line-clamp-2 leading-tight">
        {title}
      </h3>

      {/* DXM Score Energy System */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="cyber-subtitle">DXM INTELLIGENCE</span>
          <span className={`text-xs font-mono font-bold ${scoreTier.color}`}>
            {scoreTier.tier}
          </span>
        </div>
        
        {/* Energy Bar */}
        <div className="energy-bar mb-1">
          <div 
            className="energy-fill" 
            style={{ width: `${energyPercent}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${scoreTier.color}`}>
            {dxmScore.toFixed(2)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            /10.00
          </span>
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl font-bold text-green-300 glow-green">
            ${price.toFixed(0)}
          </span>
          {previousPrice && previousPrice > price && (
            <>
              <span className="text-sm text-slate-500 line-through">
                ${previousPrice.toFixed(0)}
              </span>
              {discount && (
                <span className="px-2 py-1 text-[10px] font-mono bg-green-500/20 border border-green-500/40 rounded text-green-300">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tactical Specs */}
      <div className="mb-4 space-y-1">
        <div className="cyber-subtitle mb-2">TACTICAL SPECS</div>
        <div className="flex flex-wrap gap-1">
          {vram && (
            <span className="px-2 py-1 text-[9px] font-mono bg-slate-800/60 border border-cyan-400/30 rounded text-cyan-300">
              {vram}
            </span>
          )}
          {tdp && (
            <span className="px-2 py-1 text-[9px] font-mono bg-slate-800/60 border border-blue-400/30 rounded text-blue-300">
              {tdp}
            </span>
          )}
          {boostClock && (
            <span className="px-2 py-1 text-[9px] font-mono bg-slate-800/60 border border-purple-400/30 rounded text-purple-300">
              {boostClock}
            </span>
          )}
        </div>
      </div>


      {/* Energy Beam Separator */}
      <div className="energy-beam mb-4" />

      {/* Hologram CTA */}
      <button
        onClick={handleClick}
        className="w-full mt-auto hologram-button rounded-lg py-3 px-4 text-sm font-mono uppercase tracking-wider text-cyan-100 hover:text-white transition-colors"
      >
        <span className="relative z-10">VIEW DEAL ON AMAZON</span>
        <span className="ml-2 text-cyan-300">→</span>
      </button>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40 rounded-bl-xl" />
    </article>
  );
}
