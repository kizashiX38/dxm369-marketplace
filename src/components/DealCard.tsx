// src/components/DealCard.tsx
// DXM Revenue-Optimized Deal Card with Affiliate Tracking
// Integrates with DXMProduct data layer and click tracking

"use client";

import { DXMProduct, getAvailabilityDisplay, getAvailabilityColor } from "@/lib/types/product";
import { buildAmazonProductUrl } from "@/lib/affiliate";
import { getDXMScoreColor, getDXMScoreLabel } from "@/lib/dealRadarTypes";
import { trackAffiliateClick } from "@/lib/tracking";
import { ScoreBreakdown, CompactScoreBreakdown } from "@/components/ScoreBreakdown";
import { UrgencyIndicators, SocialProof, PriceAlert } from "@/components/UrgencyIndicators";
import { DXMProductImage } from "@/components/DXMProductImage";
import { useMemo } from "react";

interface DealCardProps {
  deal: DXMProduct;
  source?: string; // tracking source identifier
  variant?: "compact" | "standard" | "detailed";
}

export function DealCard({ deal, source = "deal-grid", variant = "standard" }: DealCardProps) {
  // Use context-aware tracking based on source and page type
  const trackingContext = useMemo(() => {
    // Determine intent based on variant and source
    let intent: 'review' | 'top10' | 'browse' | 'comparison' | 'deal' | undefined;
    if (source.includes('review') || source.includes('comparison')) {
      intent = source.includes('comparison') ? 'comparison' : 'review';
    } else if (source.includes('top10') || source.includes('best')) {
      intent = 'top10';
    } else if (source.includes('deal')) {
      intent = 'deal';
    }

    // Map source to tracking source
    let trackingSource: 'seo' | 'social' | 'youtube' | 'blog' | 'direct' | 'email' | 'twitter' | 'instagram' | undefined;
    if (source.includes('seo') || source.includes('search')) {
      trackingSource = 'seo';
    } else if (source.includes('social') || source.includes('twitter') || source.includes('x')) {
      trackingSource = 'twitter';
    } else if (source.includes('instagram') || source.includes('ig')) {
      trackingSource = 'instagram';
    } else if (source.includes('youtube')) {
      trackingSource = 'youtube';
    } else if (source.includes('email') || source.includes('newsletter')) {
      trackingSource = 'email';
    } else if (source.includes('blog') || source.includes('content')) {
      trackingSource = 'blog';
    }

    return {
      source: trackingSource,
      intent,
    };
  }, [source]);

  const affiliateUrl = useMemo(() => buildAmazonProductUrl(deal.asin, {
    context: {
      category: deal.category.toLowerCase() as any,
      source: trackingContext.source,
      intent: trackingContext.intent,
      pageType: 'product',
    },
  }), [deal.asin, deal.category, trackingContext]);

  const {
    name: title,
    price,
    originalPrice: previousPrice,
    dxmScore,
    specs,
    imageUrl,
    availability,
    isPrime: primeEligible = false,
    vendor = "Amazon",
    savingsPercent: discount,
  } = deal;

  // Extract specs from specs object
  const vram = specs.vram;
  const tdp = specs.tdp;
  const boostClock = specs.boostClock;
  const baseClock = specs.baseClock;
  const cores = specs.cores;
  const threads = specs.threads;
  const memory = specs.memory;
  const storage = specs.storage;

  const scoreColorClass = getDXMScoreColor(dxmScore);
  const availabilityColor = getAvailabilityColor(availability);
  const availabilityDisplay = getAvailabilityDisplay(availability);

  const handleClick = async () => {
    // Fire-and-forget tracking
    trackAffiliateClick({
      asin: deal.asin,
      category: deal.category.toLowerCase() as any,
      price,
      dxmScore,
      source,
      brand: deal.vendor, // Use vendor as brand fallback
      title: deal.name,
    });

    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <article className="group relative flex items-center gap-3 glass-panel p-3 hover:border-cyan-400/60 transition-all duration-200 holographic-sheen">
        {/* Compact Image */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/30">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-contain p-1" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          )}
        </div>

        {/* Compact Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400 font-mono">{vendor}</p>
          <h3 className="text-xs font-semibold text-slate-50 truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-cyan-300">${price}</span>
            {discount && (
              <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-1 py-0.5 rounded-sm">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Compact Score & Action */}
        <div className="flex flex-col items-end gap-1">
          <ScoreBreakdown deal={deal} className="text-right" />
          <button
            onClick={handleClick}
            className="text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            VIEW →
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col glass-panel hover:border-cyan-400/60 transition-all duration-300 overflow-hidden holographic-sheen">
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
      
      {/* Corner accent */}
      <div className="glass-corner-accent" />

      {/* Header with vendor and DXM Score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-mono">
            {vendor}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-50 leading-tight">
            {title}
          </h3>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <ScoreBreakdown deal={deal} />
          <CompactScoreBreakdown deal={deal} />
        </div>
      </div>

      {/* Product Image - DXM Enhanced */}
      <div className="relative h-24 mb-4 bg-slate-900/30 rounded-lg overflow-hidden border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors">
        <DXMProductImage
          product={{
            brand: vendor,
            title,
            category: deal.category.toLowerCase(),
            imageUrl
          }}
          className="w-full h-full"
          width={200}
          height={96}
        />
      </div>

      {/* Pricing Section */}
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-cyan-300">
            ${price.toFixed(0)}
          </span>
          {previousPrice && previousPrice > price && (
            <>
              <span className="text-xs text-slate-500 line-through">
                ${previousPrice.toFixed(0)}
              </span>
              {discount !== null && (
                <span className="rounded-sm bg-emerald-500/15 px-1.5 py-[2px] text-[9px] font-medium text-emerald-300">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Key Specs */}
      {(variant === "standard" || variant === "detailed") && (
        <div className="flex flex-wrap gap-1.5 mb-3 text-[10px] text-slate-400">
          {vram && <span className="rounded-sm border border-slate-700/60 px-1.5 py-[2px] bg-slate-900/30">{vram}</span>}
          {tdp && <span className="rounded-sm border border-slate-700/60 px-1.5 py-[2px] bg-slate-900/30">{tdp}</span>}
          {boostClock && <span className="rounded-sm border border-slate-700/60 px-1.5 py-[2px] bg-slate-900/30">{boostClock}</span>}
          {cores && <span className="rounded-sm border border-slate-700/60 px-1.5 py-[2px] bg-slate-900/30">{cores} cores</span>}
          {memory && <span className="rounded-sm border border-slate-700/60 px-1.5 py-[2px] bg-slate-900/30">{memory}</span>}
        </div>
      )}


      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] mb-4 mt-auto">
        <span className={`${availabilityColor} font-medium`}>
          {availabilityDisplay}
        </span>
        <div className="flex items-center gap-2">
          {primeEligible && (
            <span className="text-orange-400 font-bold text-[9px]">Prime</span>
          )}
          <span className="text-slate-500">{vendor}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleClick}
        className="w-full inline-flex items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-500/10 px-3 py-2.5 text-[11px] font-medium text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-200 hover:bg-cyan-400/20 hover:text-cyan-50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:border-cyan-400/80"
      >
        VIEW DEAL ON AMAZON
        <span className="ml-2 text-[9px] text-cyan-300/80 transition-transform group-hover:translate-x-0.5">↗</span>
      </button>
    </article>
  );
}

// Grid Layout Component for Deal Cards
export function DealGrid({ 
  deals, 
  source = "deal-grid",
  variant = "standard",
  columns = 3,
  className = "" 
}: {
  deals: DXMProduct[];
  source?: string;
  variant?: "compact" | "standard" | "detailed";
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {deals.map((deal) => (
        <DealCard 
          key={deal.id} 
          deal={deal} 
          source={source}
          variant={variant}
        />
      ))}
    </div>
  );
}
