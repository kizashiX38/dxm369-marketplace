// DXM369 GPU Command Console - Hardware Intelligence Terminal
// Weapons-grade interface for tactical GPU evaluation

import { Metadata } from "next";
import Link from "next/link";
import { DXMProductResponse, extractProductsFromResponse } from "@/types/api";
import { CyberDealCard } from "@/components/CyberDealCard";
import { BuyingGuideSection } from "@/components/BuyingGuideSection";
import { appConfig } from "@/lib/env";
import { generateCategorySEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import { BUYING_GUIDE_TEMPLATES } from "@/lib/buyingGuideGenerator";
import { generateCategoryPageSchemas, generateAggregateOfferSchema } from "@/lib/schemaGenerator";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export const metadata: Metadata = generateCategorySEO("gpu");

export default async function GPUsCommandConsole() {
  try {
    // In production, use absolute URL; in development, relative works
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
    const dealsPayload: DXMProductResponse = await response.json();
    const deals = extractProductsFromResponse(dealsPayload);

    const dealsByScore = [...deals].sort((a, b) => b.dxmScore - a.dxmScore);
    const bestOverall = dealsByScore[0];
    const bestValue = [...deals]
      .filter((d) => d.price > 0)
      .sort((a, b) => (b.dxmScore / b.price) - (a.dxmScore / a.price))[0];
    const bestBudget = [...deals]
      .filter((d) => d.price > 0 && d.price <= 350)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];
    const bestHighEnd = [...deals]
      .filter((d) => d.price >= 800)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];

    const picks = [
      { label: "DXM Best Overall", deal: bestOverall, source: "seo-pick-overall" },
      { label: "DXM Best Value", deal: bestValue, source: "seo-pick-value" },
      { label: "DXM Best Budget", deal: bestBudget, source: "seo-pick-budget" },
      { label: "DXM High-End Pick", deal: bestHighEnd, source: "seo-pick-highend" },
    ].filter((p): p is { label: string; deal: NonNullable<typeof p.deal>; source: string } => Boolean(p.deal));

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "Home", url: "/" },
      { name: "GPUs", url: "/gpus" }
    ]);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What GPU is best for gaming in 2025?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best GPU depends on your resolution and budget. RTX 4070 excels at 1440p gaming, RTX 4090 for 4K, and RX 7600 for budget 1080p builds. Check DXM scores for detailed recommendations."
          }
        },
        {
          "@type": "Question",
          "name": "How much VRAM do I need for modern games?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "8GB VRAM is sufficient for 1080p gaming at high settings. 12GB is recommended for 1440p, and 16GB+ for 4K or content creation workflows."
          }
        },
        {
          "@type": "Question",
          "name": "What is the DXM Value Score?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DXM Score evaluates GPUs on performance value, deal quality, trust signals, efficiency, and market trends. Higher scores indicate better value for the price."
          }
        },
        {
          "@type": "Question",
          "name": "Should I buy last-generation GPUs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Previous-generation GPUs often offer excellent value as prices drop. Check current deals and performance for your specific use case."
          }
        }
      ]
    };

    // Path A Schema (High-Velocity): ProductCollection + AggregateOffer
    const categorySchemas = generateCategoryPageSchemas("gpu", deals.length);
    const aggregateOfferSchema = generateAggregateOfferSchema({
      bestOverall,
      bestValue,
      bestBudget,
      bestHighEnd
    });

    return (
      <div className="min-h-screen bg-slate-950 tactical-grid">
        {/* Structured Data */}
        {/* Path A Schema: ProductCollection + AggregateOffer */}
        {categorySchemas.map((schema, idx) => (
          <script key={`category-schema-${idx}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
        {Object.keys(aggregateOfferSchema).length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateOfferSchema) }} />
        )}
        {/* Existing Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        {/* Command Header */}
        <div className="command-panel border-b border-cyan-400/20 p-6 mb-8">
          <div className="max-w-7xl mx-auto">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="status-online">
                <div className="status-ping" />
                <span className="cyber-subtitle">GPU MATRIX: ONLINE</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">SIGNAL ENGINE:</span>
                <span className="text-green-300">ACTIVE</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">DEALS TRACKED:</span>
                <span className="text-cyan-300">{deals.length}</span>
              </div>
            </div>

            {/* Mission Brief */}
            <div className="hologram-sheen">
              <h1 className="cyber-title text-4xl text-white mb-2">
                GRAPHICS <span className="text-cyan-300 glow-cyan">PROCESSING UNITS</span>
              </h1>
              <p className="cyber-subtitle text-lg mb-4">
                HARDWARE INTELLIGENCE TERMINAL / TACTICAL EVALUATION MATRIX
              </p>
              <div className="energy-beam mb-4" />
              <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-4xl">
                Advanced GPU reconnaissance data aggregated from multiple intelligence sources.
                <br />
                <span className="text-cyan-300">DXM Value Scoring</span> provides quantitative analysis for tactical hardware procurement decisions.
              </p>
            </div>

            {/* Growth CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/best-gpu-deals"
                className="hologram-button px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-cyan-100"
              >
                Best GPU Deals
              </Link>
              <Link
                href="/rtx-4070-vs-rx-7800-xt"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-cyan-200 border border-cyan-500/30 hover:border-cyan-400/60 transition-colors"
              >
                Compare: RTX 4070 vs RX 7800 XT
              </Link>
              <Link
                href="/power-supplies"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-200 border border-slate-700/40 hover:border-slate-500/60 transition-colors"
              >
                Match a PSU
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
                  <div className="w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
                  <h2 className="cyber-title text-xl text-white">
                    DXM TOP PICKS
                  </h2>
                </div>
                <Link href="/best-gpu-deals" className="text-xs font-mono uppercase tracking-wider text-cyan-300 hover:text-cyan-200">
                  View all deals →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {picks.map((pick) => (
                  <div key={pick.label} className="relative">
                    <div className="absolute -top-2 left-3 z-10 px-2 py-1 text-[9px] font-mono uppercase tracking-widest bg-cyan-500/20 border border-cyan-400/40 rounded text-cyan-200">
                      {pick.label}
                    </div>
                    <CyberDealCard deal={pick.deal} source={pick.source} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Command Controls */}
          <div className="glass-panel-cyber rounded-xl p-4 mb-8 scanlines">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Sort Matrix */}
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle">SORT MATRIX:</span>
                <select className="glass-panel-premium text-xs font-mono text-cyan-300 bg-transparent border-cyan-400/30 focus:border-cyan-400/60 focus:outline-none px-3 py-2 rounded">
                  <option value="score" className="bg-slate-900">DXM INTELLIGENCE</option>
                  <option value="price" className="bg-slate-900">PRICE VECTOR</option>
                  <option value="performance" className="bg-slate-900">PERFORMANCE INDEX</option>
                  <option value="vram" className="bg-slate-900">MEMORY CAPACITY</option>
                </select>
              </div>
              
              {/* View Mode */}
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle">VIEW MODE:</span>
                <div className="flex gap-2">
                  <button className="hologram-button p-2 rounded">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="glass-panel-cyber p-2 rounded border-cyan-400/60">
                    <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
              <h2 className="cyber-title text-xl text-white">
                TACTICAL HARDWARE MATRIX
              </h2>
              <div className="flex-1 energy-beam" />
              <span className="cyber-subtitle">
                {deals.length} UNITS ANALYZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {deals.map((deal) => (
                <CyberDealCard 
                  key={deal.id} 
                  deal={deal} 
                  source="gpu-command-console" 
                />
              ))}
            </div>
          </div>

          {/* Mission Status */}
          <div className="mission-panel rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="cyber-title text-lg text-white mb-2">
                  ▣ MISSION STATUS: GPU RECONNAISSANCE
                </h3>
                <p className="cyber-subtitle">
                  Intelligence gathering complete. All units evaluated and classified.
                </p>
              </div>
              <button className="hologram-button px-6 py-3 rounded-lg">
                <span className="text-sm font-mono uppercase tracking-wider text-cyan-100">
                  EXPORT DATA
                </span>
                <span className="ml-2 text-cyan-300">↗</span>
              </button>
            </div>
          </div>

          {/* Internal Link Cluster - Related Categories */}
          <div className="mb-8">
            <h2 className="cyber-title text-xl text-white mb-6">RELATED INTELLIGENCE CLUSTERS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/rtx-4070-vs-rx-7800-xt" className="glass-panel-cyber rounded-lg p-6 border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/5 transition">
                <h3 className="cyber-subtitle text-cyan-300 mb-2">GPU COMPARISON</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">RTX 4070 vs RX 7800 XT</p>
                <p className="text-slate-400 text-xs">Performance benchmarks & pricing analysis for 1440p gaming</p>
              </a>
              <a href="/cpus" className="glass-panel-cyber rounded-lg p-6 border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/5 transition">
                <h3 className="cyber-subtitle text-amber-300 mb-2">CPU MATRIX</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">Processor Intelligence</p>
                <p className="text-slate-400 text-xs">Explore gaming & productivity CPUs with DXM scoring</p>
              </a>
              <a href="/power-supplies" className="glass-panel-cyber rounded-lg p-6 border-orange-400/30 hover:border-orange-400/60 hover:bg-orange-400/5 transition">
                <h3 className="cyber-subtitle text-orange-300 mb-2">PSU COMPATIBILITY</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">Power Supply Sizing</p>
                <p className="text-slate-400 text-xs">Find PSU wattage & certification for GPU builds</p>
              </a>
            </div>
          </div>

          {/* Building Guide Link */}
          <div className="glass-panel-cyber rounded-lg p-6 border-cyan-400/20 mb-8">
            <h3 className="cyber-title text-white mb-3">BUILD RECOMMENDATIONS</h3>
            <p className="text-slate-300 mb-4">GPUs perform best when paired with compatible CPUs, motherboards, and power supplies.</p>
            <a href="/builds" className="text-cyan-300 hover:text-cyan-200 font-mono text-sm underline">
              View curated PC builds →
            </a>
          </div>

          {/* Buying Guide Section */}
          <div className="mb-8">
            <BuyingGuideSection guide={BUYING_GUIDE_TEMPLATES.gpu} />
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
        <div className="glass-panel-premium rounded-xl p-8 max-w-md">
          <h1 className="cyber-title text-xl text-red-400 mb-4">SYSTEM ERROR</h1>
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
            {String(error)}
          </pre>
          <div className="energy-beam mt-4" />
          <p className="cyber-subtitle mt-4">
            ATTEMPTING SYSTEM RECOVERY...
          </p>
        </div>
      </div>
    );
  }
}
