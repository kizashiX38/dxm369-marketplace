// DXM369 Laptop Command Console - Hardware Intelligence Terminal
// Weapons-grade interface for tactical Laptop evaluation

import { Metadata } from "next";
import { DXMProductResponse, extractProductsFromResponse } from "@/types/api";
import { CyberDealCard } from "@/components/CyberDealCard";
import { appConfig } from "@/lib/env";
import { generateCategorySEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import Link from "next/link";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export const metadata: Metadata = generateCategorySEO("laptop");

export default async function LaptopsCommandConsole() {
  try {
    // In production, use absolute URL; in development, relative works
    const baseUrl = appConfig.baseUrl;
    const response = await fetch(`${baseUrl}/api/dxm/products/laptops`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch laptop products: ${response.statusText}`);
    }
    const dealsPayload: DXMProductResponse = await response.json();
    const deals = extractProductsFromResponse(dealsPayload);

    const dealsByScore = [...deals].sort((a, b) => b.dxmScore - a.dxmScore);
    const bestOverall = dealsByScore[0];
    const bestValue = [...deals]
      .filter((d) => d.price > 0)
      .sort((a, b) => (b.dxmScore / b.price) - (a.dxmScore / a.price))[0];
    const bestBudget = [...deals]
      .filter((d) => d.price > 0 && d.price <= 1000)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];
    const bestHighEnd = [...deals]
      .filter((d) => d.price >= 1600)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];

    const picks = [
      { label: "DXM Best Overall", deal: bestOverall, source: "seo-pick-overall" },
      { label: "DXM Best Value", deal: bestValue, source: "seo-pick-value" },
      { label: "DXM Best Budget", deal: bestBudget, source: "seo-pick-budget" },
      { label: "DXM High-End Pick", deal: bestHighEnd, source: "seo-pick-highend" },
    ].filter((p): p is { label: string; deal: NonNullable<typeof p.deal>; source: string } => Boolean(p.deal));

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "Home", url: "/" },
      { name: "Laptops", url: "/laptops" }
    ]);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the best gaming laptop for 2025?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Best gaming laptops feature RTX 4070/4080 GPUs, high refresh displays (144Hz+), and modern CPUs. Budget options under $1500 offer excellent gaming value. Check DXM scores for detailed recommendations."
          }
        },
        {
          "@type": "Question",
          "name": "How much RAM do I need for a gaming laptop?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "16GB RAM is standard for 2025 gaming laptops. 32GB recommended for streaming, content creation, or running multiple applications. DDR5 memory is increasingly common."
          }
        },
        {
          "@type": "Question",
          "name": "What screen size is best for gaming?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "15.6-16 inches is ideal for gaming; 17 inches for desktop replacement. Consider refresh rate (144Hz+) and panel type (IPS for color, TN for response time)."
          }
        },
        {
          "@type": "Question",
          "name": "Laptop vs Desktop: Which should I buy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Laptops offer portability; desktops offer better performance per dollar. Gaming laptops bridge the gap. Choose based on your mobility needs and budget."
          }
        }
      ]
    };

    return (
      <div className="min-h-screen bg-slate-950 tactical-grid">
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        {/* Command Header */}
        <div className="command-panel border-b border-purple-400/20 p-6 mb-8">
          <div className="max-w-7xl mx-auto">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="status-online">
                <div className="status-ping bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.5)]" />
                <span className="cyber-subtitle text-purple-400">MOBILE MATRIX: ONLINE</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">SIGNAL ENGINE:</span>
                <span className="text-green-300">ACTIVE</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">UNITS TRACKED:</span>
                <span className="text-purple-300">{deals.length}</span>
              </div>
            </div>

            {/* Mission Brief */}
            <div className="hologram-sheen">
              <h1 className="cyber-title text-4xl text-white mb-2">
                MOBILE <span className="text-purple-400 glow-purple">WORKSTATIONS</span>
              </h1>
              <p className="cyber-subtitle text-lg mb-4 text-purple-400/80">
                HARDWARE INTELLIGENCE TERMINAL / TACTICAL EVALUATION MATRIX
              </p>
              <div className="energy-beam bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-4" />
              <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-4xl">
                Advanced laptop reconnaissance data aggregated from multiple intelligence sources.
                <br />
                <span className="text-purple-300">DXM Value Scoring</span> provides quantitative analysis for tactical hardware procurement decisions.
              </p>
            </div>

            {/* Growth CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/best-laptop-deals"
                className="hologram-button px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-purple-100"
              >
                Best Laptop Deals
              </Link>
              <Link
                href="/gaming-laptops"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-purple-200 border border-purple-500/30 hover:border-purple-400/60 transition-colors"
              >
                Gaming Laptops
              </Link>
              <Link
                href="/storage"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-200 border border-slate-700/40 hover:border-slate-500/60 transition-colors"
              >
                SSD Upgrades
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* DXM Picks */}
          {picks.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                  <h2 className="cyber-title text-xl text-white">
                    DXM TOP PICKS
                  </h2>
                </div>
                <Link href="/best-laptop-deals" className="text-xs font-mono uppercase tracking-wider text-purple-300 hover:text-purple-200">
                  View best deals →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {picks.map((pick) => (
                  <div key={pick.label} className="relative">
                    <div className="absolute -top-2 left-3 z-10 px-2 py-1 text-[9px] font-mono uppercase tracking-widest bg-purple-500/20 border border-purple-400/40 rounded text-purple-200">
                      {pick.label}
                    </div>
                    <CyberDealCard deal={pick.deal} source={pick.source} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Command Controls */}
          <div className="glass-panel-cyber rounded-xl p-4 mb-8 scanlines border-purple-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Sort Matrix */}
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle text-purple-400">SORT MATRIX:</span>
                <select className="glass-panel-premium text-xs font-mono text-purple-300 bg-transparent border-purple-400/30 focus:border-purple-400/60 focus:outline-none px-3 py-2 rounded">
                  <option value="score" className="bg-slate-900">DXM INTELLIGENCE</option>
                  <option value="price" className="bg-slate-900">PRICE VECTOR</option>
                  <option value="gpu" className="bg-slate-900">GPU MODEL</option>
                  <option value="display" className="bg-slate-900">DISPLAY TECH</option>
                </select>
              </div>
              
              {/* View Mode */}
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle text-purple-400">VIEW MODE:</span>
                <div className="flex gap-2">
                  <button className="hologram-button p-2 rounded border-purple-400/30 hover:bg-purple-400/10">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="glass-panel-cyber p-2 rounded border-purple-400/60 bg-purple-400/10">
                    <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7m0 0v12m0-12l-3-3m3 3l-3 3M21 6h-7m0 0v12m0-12l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Grid */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              <h2 className="cyber-title text-xl text-white">
                TACTICAL HARDWARE MATRIX
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
              <span className="cyber-subtitle text-purple-400">
                {deals.length} UNITS ANALYZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {deals.map((deal) => (
                <CyberDealCard 
                  key={deal.id} 
                  deal={deal} 
                  source="laptop-command-console" 
                />
              ))}
            </div>
          </div>

          {/* Mission Status */}
          <div className="mission-panel rounded-xl p-6 mb-8 border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="cyber-title text-lg text-white mb-2">
                  ▣ MISSION STATUS: MOBILE RECONNAISSANCE
                </h3>
                <p className="cyber-subtitle text-purple-400/80">
                  Intelligence gathering complete. All units evaluated and classified.
                </p>
              </div>
              <button className="hologram-button px-6 py-3 rounded-lg border-purple-400/30 text-purple-100 hover:bg-purple-400/10">
                <span className="text-sm font-mono uppercase tracking-wider">
                  EXPORT DATA
                </span>
                <span className="ml-2 text-purple-300">↗</span>
              </button>
            </div>
          </div>

          {/* Internal Link Cluster - Related Categories */}
          <div className="mb-8">
            <h2 className="cyber-title text-xl text-white mb-6">RELATED INTELLIGENCE CLUSTERS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/macbook-pro-m3-vs-asus-rog-zephyrus" className="glass-panel-cyber rounded-lg p-6 border-purple-400/30 hover:border-purple-400/60 hover:bg-purple-400/5 transition">
                <h3 className="cyber-subtitle text-purple-300 mb-2">LAPTOP COMPARISON</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">MacBook Pro M3 vs ASUS ROG</p>
                <p className="text-slate-400 text-xs">Productivity vs gaming performance</p>
              </a>
              <a href="/gpus" className="glass-panel-cyber rounded-lg p-6 border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/5 transition">
                <h3 className="cyber-subtitle text-cyan-300 mb-2">GPU PERFORMANCE</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">Mobile GPUs Impact</p>
                <p className="text-slate-400 text-xs">Learn how laptop GPUs compare to desktop variants</p>
              </a>
              <a href="/memory" className="glass-panel-cyber rounded-lg p-6 border-blue-400/30 hover:border-blue-400/60 hover:bg-blue-400/5 transition">
                <h3 className="cyber-subtitle text-blue-300 mb-2">RAM UPGRADES</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">Laptop Memory</p>
                <p className="text-slate-400 text-xs">Best RAM configurations for laptop performance</p>
              </a>
            </div>
          </div>

          {/* Building Guide Link */}
          <div className="glass-panel-cyber rounded-lg p-6 border-purple-400/20 mb-8">
            <h3 className="cyber-title text-white mb-3">BUYING GUIDE</h3>
            <p className="text-slate-300 mb-4">Laptops offer portability for work and gaming. Choose based on GPU, RAM, display refresh rate, and battery life.</p>
            <a href="/best-laptop-deals" className="text-purple-300 hover:text-purple-200 font-mono text-sm underline">
              View best laptop deals →
            </a>
          </div>
        </div>

        {/* Terminal Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-xl p-6 mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="cyber-subtitle">
                © 2025 DXM369 — HARDWARE INTELLIGENCE TERMINAL v9.0
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>SIGNAL ENGINE: <span className="text-green-400">ACTIVE</span></span>
                <span>|</span>
                <span>AFFILIATE PIPELINE: <span className="text-cyan-400">SECURE</span></span>
                <span>|</span>
                <span>NO NOISE. PURE SIGNAL.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="glass-panel-premium rounded-xl p-8 max-w-md border-red-500/30">
          <h1 className="cyber-title text-xl text-red-400 mb-4">SYSTEM ERROR</h1>
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
            {String(error)}
          </pre>
          <div className="energy-beam mt-4 bg-red-500/50" />
          <p className="cyber-subtitle mt-4 text-red-400">
            ATTEMPTING SYSTEM RECOVERY...
          </p>
        </div>
      </div>
    );
  }
}
