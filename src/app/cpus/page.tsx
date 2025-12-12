// DXM369 CPU Command Console - Hardware Intelligence Terminal
// Weapons-grade interface for tactical CPU evaluation

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

export const metadata: Metadata = generateCategorySEO("cpu");

export default async function CPUsCommandConsole() {
  try {
    // In production, use absolute URL; in development, relative works
    const baseUrl = appConfig.baseUrl;
    const response = await fetch(`${baseUrl}/api/dxm/products/cpus`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch CPU products: ${response.statusText}`);
    }
    const dealsPayload: DXMProductResponse = await response.json();
    const deals = extractProductsFromResponse(dealsPayload);

    const dealsByScore = [...deals].sort((a, b) => b.dxmScore - a.dxmScore);
    const bestOverall = dealsByScore[0];
    const bestValue = [...deals]
      .filter((d) => d.price > 0)
      .sort((a, b) => (b.dxmScore / b.price) - (a.dxmScore / a.price))[0];
    const bestBudget = [...deals]
      .filter((d) => d.price > 0 && d.price <= 250)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];
    const bestHighEnd = [...deals]
      .filter((d) => d.price >= 450)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];

    const picks = [
      { label: "DXM Best Overall", deal: bestOverall, source: "seo-pick-overall" },
      { label: "DXM Best Value", deal: bestValue, source: "seo-pick-value" },
      { label: "DXM Best Budget", deal: bestBudget, source: "seo-pick-budget" },
      { label: "DXM High-End Pick", deal: bestHighEnd, source: "seo-pick-highend" },
    ].filter((p): p is { label: string; deal: NonNullable<typeof p.deal>; source: string } => Boolean(p.deal));

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "Home", url: "/" },
      { name: "CPUs", url: "/cpus" }
    ]);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What CPU is best for gaming in 2025?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For gaming, Intel 14th gen Core i7/i9 and AMD Ryzen 7000X3D series excel in frame rates. Budget options like i5-14600K offer excellent gaming value. Check DXM scores for recommendations."
          }
        },
        {
          "@type": "Question",
          "name": "How many cores do I need for gaming?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Modern games efficiently use 6-8 cores. For gaming + streaming, 12+ cores recommended. Productivity workloads benefit from higher core counts."
          }
        },
        {
          "@type": "Question",
          "name": "Intel vs AMD: Which should I buy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Intel excels in single-thread gaming performance; AMD offers better multi-thread and value. Both are excellent for 2025. Compare specific models on DXM for your needs."
          }
        },
        {
          "@type": "Question",
          "name": "What is the DXM Value Score?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DXM Score evaluates CPUs on performance value, deal quality, trust signals, efficiency, and market trends. Higher scores indicate better value for the price."
          }
        }
      ]
    };

    // Path A Schema (High-Velocity): ProductCollection + AggregateOffer
    const categorySchemas = generateCategoryPageSchemas("cpu", deals.length);
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
        <div className="command-panel border-b border-amber-400/20 p-6 mb-8">
          <div className="max-w-7xl mx-auto">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="status-online">
                <div className="status-ping bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
                <span className="cyber-subtitle text-amber-400">CPU MATRIX: ONLINE</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">SIGNAL ENGINE:</span>
                <span className="text-green-300">ACTIVE</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">UNITS TRACKED:</span>
                <span className="text-amber-300">{deals.length}</span>
              </div>
            </div>

            {/* Mission Brief */}
            <div className="hologram-sheen">
              <h1 className="cyber-title text-4xl text-white mb-2">
                CENTRAL <span className="text-amber-400 glow-amber">PROCESSING UNITS</span>
              </h1>
              <p className="cyber-subtitle text-lg mb-4 text-amber-400/80">
                HARDWARE INTELLIGENCE TERMINAL / TACTICAL EVALUATION MATRIX
              </p>
              <div className="energy-beam bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-4" />
              <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-4xl">
                Advanced processor reconnaissance data aggregated from multiple intelligence sources.
                <br />
                <span className="text-amber-300">DXM Value Scoring</span> provides quantitative analysis for tactical hardware procurement decisions.
              </p>
            </div>

            {/* Growth CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/gpus"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-amber-200 border border-amber-500/30 hover:border-amber-400/60 transition-colors"
              >
                Pair a GPU
              </Link>
              <Link
                href="/motherboards"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-200 border border-slate-700/40 hover:border-slate-500/60 transition-colors"
              >
                Find a Motherboard
              </Link>
              <Link
                href="/builds"
                className="hologram-button px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-amber-100"
              >
                Browse Builds
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
                  <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <h2 className="cyber-title text-xl text-white">
                    DXM TOP PICKS
                  </h2>
                </div>
                <Link href="/cpus" className="text-xs font-mono uppercase tracking-wider text-amber-300 hover:text-amber-200">
                  Updated picks →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {picks.map((pick) => (
                  <div key={pick.label} className="relative">
                    <div className="absolute -top-2 left-3 z-10 px-2 py-1 text-[9px] font-mono uppercase tracking-widest bg-amber-500/20 border border-amber-400/40 rounded text-amber-200">
                      {pick.label}
                    </div>
                    <CyberDealCard deal={pick.deal} source={pick.source} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Command Controls */}
          <div className="glass-panel-cyber rounded-xl p-4 mb-8 scanlines border-amber-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Sort Matrix */}
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle text-amber-400">SORT MATRIX:</span>
                <select className="glass-panel-premium text-xs font-mono text-amber-300 bg-transparent border-amber-400/30 focus:border-amber-400/60 focus:outline-none px-3 py-2 rounded">
                  <option value="score" className="bg-slate-900">DXM INTELLIGENCE</option>
                  <option value="price" className="bg-slate-900">PRICE VECTOR</option>
                  <option value="cores" className="bg-slate-900">CORE COUNT</option>
                  <option value="clock" className="bg-slate-900">CLOCK SPEED</option>
                </select>
              </div>
              
              {/* View Mode */}
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle text-amber-400">VIEW MODE:</span>
                <div className="flex gap-2">
                  <button className="hologram-button p-2 rounded border-amber-400/30 hover:bg-amber-400/10">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="glass-panel-cyber p-2 rounded border-amber-400/60 bg-amber-400/10">
                    <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <h2 className="cyber-title text-xl text-white">
                TACTICAL HARDWARE MATRIX
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
              <span className="cyber-subtitle text-amber-400">
                {deals.length} UNITS ANALYZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {deals.map((deal) => (
                <CyberDealCard 
                  key={deal.id} 
                  deal={deal} 
                  source="cpu-command-console" 
                />
              ))}
            </div>
          </div>

          {/* Mission Status */}
          <div className="mission-panel rounded-xl p-6 mb-8 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="cyber-title text-lg text-white mb-2">
                  ▣ MISSION STATUS: CPU RECONNAISSANCE
                </h3>
                <p className="cyber-subtitle text-amber-400/80">
                  Intelligence gathering complete. All units evaluated and classified.
                </p>
              </div>
              <button className="hologram-button px-6 py-3 rounded-lg border-amber-400/30 text-amber-100 hover:bg-amber-400/10">
                <span className="text-sm font-mono uppercase tracking-wider">
                  EXPORT DATA
                </span>
                <span className="ml-2 text-amber-300">↗</span>
              </button>
            </div>
          </div>

          {/* Internal Link Cluster - Related Categories */}
          <div className="mb-8">
            <h2 className="cyber-title text-xl text-white mb-6">RELATED INTELLIGENCE CLUSTERS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/intel-i7-14700k-vs-ryzen-7-7800x3d" className="glass-panel-cyber rounded-lg p-6 border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/5 transition">
                <h3 className="cyber-subtitle text-amber-300 mb-2">CPU COMPARISON</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">i7-14700K vs Ryzen 7 7800X3D</p>
                <p className="text-slate-400 text-xs">Gaming vs productivity performance analysis</p>
              </a>
              <a href="/gpus" className="glass-panel-cyber rounded-lg p-6 border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/5 transition">
                <h3 className="cyber-subtitle text-cyan-300 mb-2">GPU MATRIX</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">Graphics Intelligence</p>
                <p className="text-slate-400 text-xs">Explore gaming GPUs paired with top CPUs</p>
              </a>
              <a href="/motherboards" className="glass-panel-cyber rounded-lg p-6 border-purple-400/30 hover:border-purple-400/60 hover:bg-purple-400/5 transition">
                <h3 className="cyber-subtitle text-purple-300 mb-2">MOTHERBOARD COMPAT</h3>
                <p className="text-slate-300 font-mono text-sm mb-4">Socket Compatibility</p>
                <p className="text-slate-400 text-xs">Find compatible chipsets for AMD/Intel builds</p>
              </a>
            </div>
          </div>

          {/* Building Guide Link */}
          <div className="glass-panel-cyber rounded-lg p-6 border-amber-400/20 mb-8">
            <h3 className="cyber-title text-white mb-3">BUILD RECOMMENDATIONS</h3>
            <p className="text-slate-300 mb-4">CPUs pair best with compatible motherboards, RAM, and GPUs for optimal performance.</p>
            <a href="/builds" className="text-amber-300 hover:text-amber-200 font-mono text-sm underline">
              View curated PC builds →
            </a>
          </div>

          {/* Buying Guide Section */}
          <div className="mb-8">
            <BuyingGuideSection guide={BUYING_GUIDE_TEMPLATES.cpu} />
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
