// src/app/best-gpu-deals/page.tsx
// SEO-Optimized Landing Page for "Best GPU Deals 2025"
// High-traffic keyword targeting with structured content

import { DXMProductResponse } from "@/types/api";
import { DealCard } from "@/components/DealCard";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { appConfig } from "@/lib/env";
import type { Metadata } from "next";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Best GPU Deals 2025 | Top Graphics Card Discounts | DXM369",
  description: "Find the best GPU deals of 2025 with DXM Value Scoring. RTX 4090, RTX 4080 SUPER, RTX 4070, RX 7800 XT deals with real-time price tracking and affiliate links.",
  keywords: [
    "best GPU deals 2025", "graphics card deals", "RTX 4090 deals", "RTX 4080 deals",
    "RTX 4070 deals", "RX 7800 XT deals", "GPU price tracker", "graphics card discounts",
    "gaming GPU deals", "4K GPU deals", "1440p GPU deals", "budget GPU deals"
  ],
  openGraph: {
    title: "Best GPU Deals 2025 | Top Graphics Card Discounts",
    description: "Find the best GPU deals with DXM Value Scoring. Real-time price tracking and affiliate links.",
    url: "/best-gpu-deals",
  },
  alternates: {
    canonical: "https://dxm369.com/best-gpu-deals",
  },
};

export default async function BestGPUDealsPage() {
  // Fetch from normalized API route with ISR caching
  const baseUrl = appConfig.baseUrl;
  const response = await fetch(`${baseUrl}/api/dxm/products/gpus`, {
    next: { revalidate: 3600 },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch GPU products: ${response.statusText}`);
  }
  
  const allDeals: DXMProductResponse = await response.json();
  
  // Categorize deals by performance tier
  const flagshipDeals = allDeals.filter(product => product.price >= 800);
  const highEndDeals = allDeals.filter(product => product.price >= 500 && product.price < 800);
  const midRangeDeals = allDeals.filter(product => product.price >= 300 && product.price < 500);
  const budgetDeals = allDeals.filter(product => product.price < 300);
  
  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: "GPU Deals", url: "/gpus" },
    { name: "Best GPU Deals 2025", url: "/best-gpu-deals" }
  ]);

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      
      <div className="min-h-screen py-6 relative">
        <div className="max-w-6xl mx-auto px-4">
          {/* SEO-Optimized Header */}
          <header className="glass-hero mb-8 p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-2 w-2 bg-emerald-400 animate-neon-pulse shadow-[0_0_12px_emerald]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
                Best GPU Deals 2025
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              Best <span className="text-emerald-400">GPU Deals</span> 2025
            </h1>
            <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-emerald-500/40 pl-4 max-w-4xl mb-6">
              Discover the best graphics card deals of 2025 with our proprietary DXM Value Scoring system. 
              We analyze performance-per-dollar, deal quality, trust signals, and market trends to surface 
              the cleanest GPU deals from RTX 4090 flagship cards to budget RX 7600 options.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">🎯 DXM Value Scoring</h3>
                <p className="text-xs text-slate-400">Proprietary algorithm ranking GPUs by performance, price, and market intelligence</p>
              </div>
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">📊 Real-Time Tracking</h3>
                <p className="text-xs text-slate-400">Live price monitoring and deal alerts for RTX 4090, 4080, 4070, and AMD cards</p>
              </div>
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">🔗 Verified Links</h3>
                <p className="text-xs text-slate-400">Direct affiliate links to Amazon with price protection and Prime shipping</p>
              </div>
            </div>
          </header>

          {/* Flagship GPUs (RTX 4090, 4080 SUPER) */}
          {flagshipDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">🚀 Flagship 4K Gaming GPUs</h2>
                <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded border border-rose-500/30">
                  RTX 4090 • RTX 4080 SUPER
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Ultimate 4K gaming performance with RTX 4090 and RTX 4080 SUPER deals. 
                Perfect for 4K 120Hz gaming, content creation, and AI workloads.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flagshipDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-deals-flagship" />
                ))}
              </div>
            </section>
          )}

          {/* High-End GPUs (RTX 4070 SUPER, 4070, RX 7800 XT) */}
          {highEndDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">💎 High-End 1440p Champions</h2>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">
                  RTX 4070 SUPER • RX 7800 XT
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Best value for 1440p high-refresh gaming. RTX 4070 SUPER and RX 7800 XT deals 
                with excellent performance-per-dollar ratios.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highEndDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-deals-high-end" />
                ))}
              </div>
            </section>
          )}

          {/* Mid-Range GPUs (RTX 4060 Ti, RX 7700 XT) */}
          {midRangeDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">🎯 Mid-Range Sweet Spot</h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/30">
                  RTX 4060 Ti • RX 7700 XT
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Perfect balance of performance and price for 1080p/1440p gaming. 
                RTX 4060 Ti and RX 7700 XT deals with strong DXM Value Scores.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {midRangeDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-deals-mid-range" />
                ))}
              </div>
            </section>
          )}

          {/* Budget GPUs (RTX 4060, RX 7600) */}
          {budgetDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">💰 Budget Gaming Champions</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                  RTX 4060 • RX 7600
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Best budget GPU deals under $300. RTX 4060 and RX 7600 options 
                for 1080p gaming with excellent efficiency and value.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-deals-budget" />
                ))}
              </div>
            </section>
          )}

          {/* SEO Content Section */}
          <section className="glass-panel p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">How We Find the Best GPU Deals</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                Our DXM Value Scoring system analyzes thousands of GPU deals daily using a proprietary 
                5-component algorithm that evaluates performance value, deal quality, trust signals, 
                power efficiency, and market trends.
              </p>
              
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">What Makes a Great GPU Deal in 2025?</h3>
              <ul className="text-slate-300 space-y-2 mb-6">
                <li><strong>Performance Per Dollar:</strong> We calculate real-world gaming performance relative to current market price</li>
                <li><strong>Deal Quality:</strong> Price drops, MSRP comparisons, and historical pricing trends</li>
                <li><strong>Trust Signals:</strong> Amazon ratings, review counts, and brand reputation scores</li>
                <li><strong>Power Efficiency:</strong> Performance per watt calculations for long-term value</li>
                <li><strong>Market Trends:</strong> Click-through rates and momentum indicators</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-400 mb-3">GPU Categories We Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">NVIDIA RTX 40 Series</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• RTX 4090 - Ultimate 4K gaming</li>
                    <li>• RTX 4080 SUPER - Premium 4K performance</li>
                    <li>• RTX 4070 SUPER - 1440p champion</li>
                    <li>• RTX 4070 - Solid 1440p gaming</li>
                    <li>• RTX 4060 Ti - 1080p/1440p bridge</li>
                    <li>• RTX 4060 - Budget 1080p king</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">AMD Radeon RX 7000</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• RX 7900 XTX - 4K gaming powerhouse</li>
                    <li>• RX 7800 XT - 1440p value leader</li>
                    <li>• RX 7700 XT - 1440p performance</li>
                    <li>• RX 7600 - Budget 1080p champion</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="glass-hero p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Ready to Upgrade Your Gaming Setup?</h2>
            <p className="text-slate-400 mb-6">
              Browse our complete GPU catalog with real-time DXM Value Scoring and affiliate links to the best deals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/gpus" 
                className="glass-panel px-6 py-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                View All GPU Deals →
              </a>
              <a 
                href="/trending" 
                className="glass-panel-secondary px-6 py-3 text-slate-300 hover:text-white font-semibold transition-colors"
              >
                Trending Deals
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
