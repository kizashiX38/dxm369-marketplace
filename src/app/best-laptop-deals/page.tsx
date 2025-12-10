// src/app/best-laptop-deals/page.tsx
// SEO-Optimized Landing Page for "Best Laptop Deals 2025"
// High-traffic keyword targeting: Laptops category (high EPC, high CR)

import { DXMProductResponse } from "@/types/api";
import { DealCard } from "@/components/DealCard";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { getDealsByCategory } from "@/lib/dealRadar";
import type { Metadata } from "next";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Best Laptop Deals 2025 | Gaming & Business Laptop Discounts | DXM369",
  description: "Find the best laptop deals of 2025. Gaming laptops, business laptops, and ultrabooks with real-time price tracking. RTX 4070, M3 Pro, and budget laptop deals with DXM Value Scoring.",
  keywords: [
    "best laptop deals 2025", "gaming laptop deals", "business laptop deals", "RTX 4070 laptop deals",
    "MacBook Pro deals", "ASUS ROG deals", "budget laptop deals", "laptop under 1000",
    "laptop under 1500", "gaming laptop under 2000", "ultrabook deals", "laptop discounts"
  ],
  openGraph: {
    title: "Best Laptop Deals 2025 | Gaming & Business Laptop Discounts",
    description: "Find the best laptop deals with DXM Value Scoring. Real-time price tracking and affiliate links.",
    url: "/best-laptop-deals",
  },
  alternates: {
    canonical: "https://dxm369.com/best-laptop-deals",
  },
};

export default async function BestLaptopDealsPage() {
  // Fetch directly from library to support static generation
  const allDeals = await getDealsByCategory("laptop");

  // Categorize deals by type
  const gamingDeals = allDeals.filter(product =>
    product.name.toLowerCase().includes('gaming') ||
    product.name.toLowerCase().includes('rog')
  );

  const businessDeals = allDeals.filter(product =>
    product.name.toLowerCase().includes('business') ||
    product.name.toLowerCase().includes('pro') ||
    product.name.toLowerCase().includes('macbook')
  );

  const budgetDeals = allDeals.filter(product => product.price < 1000);
  const premiumDeals = allDeals.filter(product => product.price >= 1500);

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: "Laptops", url: "/laptops" },
    { name: "Best Laptop Deals 2025", url: "/best-laptop-deals" }
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
              <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
                Best Laptop Deals 2025
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              Best <span className="text-cyan-400">Laptop Deals</span> 2025
            </h1>
            <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-cyan-500/40 pl-4 max-w-4xl mb-6">
              Discover the best laptop deals of 2025 with our proprietary DXM Value Scoring system.
              We analyze performance-per-dollar, build quality, display quality, and market trends to surface
              the cleanest laptop deals from RTX 4070 gaming laptops to M3 Pro MacBooks.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">🎮 Gaming Performance</h3>
                <p className="text-xs text-slate-400">RTX 4070, RTX 4060, and AMD GPU laptops for high-refresh gaming</p>
              </div>
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">💼 Business Ready</h3>
                <p className="text-xs text-slate-400">MacBook Pro, ThinkPad, and ultrabook options for professionals</p>
              </div>
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">🔗 Verified Links</h3>
                <p className="text-xs text-slate-400">Direct affiliate links to Amazon with Prime shipping and price protection</p>
              </div>
            </div>
          </header>

          {/* Gaming Laptops */}
          {gamingDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">🎮 Gaming Laptop Deals</h2>
                <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded border border-rose-500/30">
                  RTX 4070 • RTX 4060 • High Refresh
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                High-performance gaming laptops with RTX GPUs, high-refresh displays, and RGB keyboards.
                Perfect for 1440p and 1080p high-refresh gaming.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gamingDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-laptop-deals-gaming" />
                ))}
              </div>
            </section>
          )}

          {/* Business/Professional Laptops */}
          {businessDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">💼 Business & Professional Laptops</h2>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                  MacBook Pro • ThinkPad • Ultrabook
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Professional laptops for content creation, business, and productivity.
                MacBook Pro M3, ThinkPad, and premium ultrabook options.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-laptop-deals-business" />
                ))}
              </div>
            </section>
          )}

          {/* Budget Laptops */}
          {budgetDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">💰 Budget Laptop Deals (Under $1000)</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                  Value • Entry-Level • Student
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Best value laptops under $1000 for students, casual users, and budget-conscious buyers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-laptop-deals-budget" />
                ))}
              </div>
            </section>
          )}

          {/* Premium Laptops */}
          {premiumDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">💎 Premium Laptop Deals ($1500+)</h2>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                  Flagship • 4K • Professional
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Flagship laptops with premium displays, top-tier GPUs, and professional-grade build quality.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumDeals.slice(0, 6).map((product) => (
                  <DealCard key={product.id} deal={product} source="best-laptop-deals-premium" />
                ))}
              </div>
            </section>
          )}

          {/* SEO Content Section */}
          <section className="glass-panel p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">How We Find the Best Laptop Deals</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                Our DXM Value Scoring system analyzes laptop deals using a proprietary algorithm
                that evaluates CPU/GPU performance, display quality, build quality, and market trends.
              </p>

              <h3 className="text-lg font-semibold text-cyan-400 mb-3">What Makes a Great Laptop Deal in 2025?</h3>
              <ul className="text-slate-300 space-y-2 mb-6">
                <li><strong>Performance Per Dollar:</strong> CPU/GPU performance relative to current market price</li>
                <li><strong>Display Quality:</strong> Resolution, refresh rate, color accuracy, and panel type</li>
                <li><strong>Build Quality:</strong> Materials, keyboard quality, trackpad, and durability</li>
                <li><strong>Battery Life:</strong> Real-world usage estimates and power efficiency</li>
                <li><strong>Use Case Match:</strong> Gaming, content creation, business, or general use optimization</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Laptop Categories We Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">Gaming Laptops</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• RTX 4070/4060 - 1440p gaming</li>
                    <li>• RTX 4090/4080 - 4K gaming</li>
                    <li>• High-refresh displays (144Hz+)</li>
                    <li>• RGB keyboards and gaming features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Business Laptops</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• MacBook Pro M3/M3 Pro</li>
                    <li>• ThinkPad series</li>
                    <li>• Ultrabooks (thin & light)</li>
                    <li>• Long battery life</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Budget Laptops</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Under $1000 options</li>
                    <li>• Student-friendly pricing</li>
                    <li>• Entry-level performance</li>
                    <li>• Good value for money</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Premium Laptops</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• $1500+ flagship models</li>
                    <li>• 4K displays</li>
                    <li>• Premium build materials</li>
                    <li>• Professional-grade features</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="glass-hero p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Ready to Find Your Perfect Laptop?</h2>
            <p className="text-slate-400 mb-6">
              Browse our complete laptop catalog with real-time DXM Value Scoring and affiliate links to the best deals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/laptops"
                className="glass-panel px-6 py-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                View All Laptops →
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

