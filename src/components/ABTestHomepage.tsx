// src/components/ABTestHomepage.tsx
// A/B Testing for Homepage Deal Sections
// Conversion optimization with variant testing

"use client";

import { DXMProduct } from "@/lib/types/product";
import { DealCard } from "@/components/DealCard";
import { UrgencyIndicators, RecentlyViewed } from "@/components/UrgencyIndicators";
import { useState, useEffect } from "react";

interface ABTestHomepageProps {
  featuredDeals: DXMProduct[];
  budgetDeals: DXMProduct[];
  highEndDeals: DXMProduct[];
  trendingDeals: DXMProduct[];
}

type Variant = "control" | "urgency" | "social" | "minimal";

export function ABTestHomepage({ 
  featuredDeals, 
  budgetDeals, 
  highEndDeals, 
  trendingDeals 
}: ABTestHomepageProps) {
  const [variant, setVariant] = useState<Variant>("control");
  
  useEffect(() => {
    // Randomly assign variant (in production, this would be more sophisticated)
    const variants: Variant[] = ["control", "urgency", "social", "minimal"];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    setVariant(randomVariant);
    
    // Track variant assignment for analytics
    console.log(`[AB_TEST] Homepage variant: ${randomVariant}`);
  }, []);

  const getVariantConfig = (variant: Variant) => {
    switch (variant) {
      case "urgency":
        return {
          showUrgency: true,
          showSocial: false,
          headerStyle: "urgent",
          buttonText: "🔥 GET DEAL NOW",
          sectionTitles: {
            featured: "🚨 LIMITED TIME: Top 1440p Deals",
            budget: "💥 FLASH SALE: Under $400",
            highEnd: "⚡ TRENDING NOW: 4K Gaming",
            trending: "📈 PRICE DROPS: Act Fast"
          }
        };
      case "social":
        return {
          showUrgency: false,
          showSocial: true,
          headerStyle: "social",
          buttonText: "Join 10K+ Buyers →",
          sectionTitles: {
            featured: "👥 Most Popular: Top 1440p Deals",
            budget: "⭐ Community Favorites Under $400",
            highEnd: "🏆 Expert Recommended: 4K Gaming",
            trending: "🔥 Trending in Community"
          }
        };
      case "minimal":
        return {
          showUrgency: false,
          showSocial: false,
          headerStyle: "minimal",
          buttonText: "View Deal",
          sectionTitles: {
            featured: "Featured 1440p Deals",
            budget: "Value Deals Under $400",
            highEnd: "4K Gaming GPUs",
            trending: "Price Drops"
          }
        };
      default: // control
        return {
          showUrgency: false,
          showSocial: false,
          headerStyle: "control",
          buttonText: "View Deal on Amazon →",
          sectionTitles: {
            featured: "🎯 DXM Featured: Top 1440p Deals",
            budget: "💰 Best Value Under $400",
            highEnd: "🚀 4K Gaming Powerhouse",
            trending: "📈 Trending Price Drops"
          }
        };
    }
  };

  const config = getVariantConfig(variant);

  return (
    <div className="space-y-8">
      {/* Variant-specific styling */}
      <style jsx>{`
        .variant-${variant} .deal-section-header {
          ${variant === "urgency" ? "animation: pulse 2s infinite;" : ""}
          ${variant === "social" ? "border-left: 3px solid #10b981;" : ""}
        }
      `}</style>

      {/* DXM Featured Section */}
      <section className={`variant-${variant} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 deal-section-header">
            <div className={`h-1 w-1 animate-neon-pulse ${
              variant === "urgency" ? "bg-rose-400 shadow-[0_0_8px_rose]" :
              variant === "social" ? "bg-emerald-400 shadow-[0_0_8px_emerald]" :
              "bg-emerald-400 shadow-[0_0_8px_emerald]"
            }`} />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              {config.sectionTitles.featured}
            </h2>
            {variant === "urgency" && (
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded border border-rose-500/30 animate-pulse">
                6H LEFT
              </span>
            )}
          </div>
          <a 
            href="/deals" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </a>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredDeals.map((deal) => (
            <div key={deal.id} className="relative">
              <DealCard deal={deal} source={`homepage-featured-${variant}`} variant="compact" />
              {config.showUrgency && (
                <div className="absolute top-2 right-2 z-10">
                  <UrgencyIndicators deal={deal} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Best Value Under $400 */}
      <section className={`variant-${variant} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 deal-section-header">
            <div className="h-1 w-1 bg-amber-400 shadow-[0_0_8px_amber] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              {config.sectionTitles.budget}
            </h2>
            {variant === "social" && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                2.1K BOUGHT
              </span>
            )}
          </div>
          <a 
            href="/deals?maxPrice=400" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </a>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} source={`homepage-budget-${variant}`} variant="standard" />
          ))}
        </div>
      </section>

      {/* 4K Gaming Powerhouse */}
      <section className={`variant-${variant} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 deal-section-header">
            <div className="h-1 w-1 bg-rose-400 shadow-[0_0_8px_rose] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              {config.sectionTitles.highEnd}
            </h2>
          </div>
          <a 
            href="/gpus?segment=4k" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </a>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highEndDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} source={`homepage-4k-${variant}`} variant="standard" />
          ))}
        </div>
      </section>

      {/* Trending Price Drops */}
      <section className={`variant-${variant} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 deal-section-header">
            <div className="h-1 w-1 bg-cyan-400 shadow-[0_0_8px_cyan] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              {config.sectionTitles.trending}
            </h2>
          </div>
          <a 
            href="/trending" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </a>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {trendingDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} source={`homepage-trending-${variant}`} variant="compact" />
          ))}
        </div>
      </section>

      {/* Sidebar Components for Social Variant */}
      {variant === "social" && (
        <aside className="lg:fixed lg:right-4 lg:top-1/2 lg:-translate-y-1/2 lg:w-64 space-y-4">
          <RecentlyViewed />
          
          <div className="glass-panel-secondary p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Live Activity</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div>🔥 Sarah from NY just bought RTX 4070</div>
              <div>⚡ Mike from CA saved $120 on RX 7800 XT</div>
              <div>💎 Alex from TX got RTX 4090 deal</div>
            </div>
          </div>
        </aside>
      )}

      {/* Analytics Tracking */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Track A/B test variant
            if (typeof gtag !== 'undefined') {
              gtag('event', 'ab_test_view', {
                'variant': '${variant}',
                'page': 'homepage'
              });
            }
          `,
        }}
      />
    </div>
  );
}
