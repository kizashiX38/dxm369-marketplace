// DXM369 Memory Command Console - Hardware Intelligence Terminal
// Tactical RAM/Memory evaluation matrix

import { Metadata } from "next";
import { DXMProductResponse, extractProductsFromResponse } from "@/types/api";
import { CyberDealCard } from "@/components/CyberDealCard";
import { BuyingGuideSection } from "@/components/BuyingGuideSection";
import { appConfig } from "@/lib/env";
import { generateCategorySEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import { BUYING_GUIDE_TEMPLATES } from "@/lib/buyingGuideGenerator";
import { generateCategoryPageSchemas, generateAggregateOfferSchema } from "@/lib/schemaGenerator";
import Link from "next/link";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export const metadata: Metadata = generateCategorySEO("ram");

export default async function MemoryCommandConsole() {
  try {
    // Fetch from normalized API route
    const baseUrl = appConfig.baseUrl;
    const response = await fetch(`${baseUrl}/api/dxm/products/memory`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const dealsPayload: DXMProductResponse = await response.json();
    const deals = extractProductsFromResponse(dealsPayload);

    const dealsByScore = [...deals].sort((a, b) => b.dxmScore - a.dxmScore);
    const bestOverall = dealsByScore[0];
    const bestValue = [...deals]
      .filter((d) => d.price > 0)
      .sort((a, b) => (b.dxmScore / b.price) - (a.dxmScore / a.price))[0];
    const bestBudget = [...deals]
      .filter((d) => d.price > 0 && d.price <= 80)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];
    const bestHighEnd = [...deals]
      .filter((d) => d.price >= 200)
      .sort((a, b) => b.dxmScore - a.dxmScore)[0];

    const picks = [
      { label: "DXM Best Overall", deal: bestOverall, source: "seo-pick-overall" },
      { label: "DXM Best Value", deal: bestValue, source: "seo-pick-value" },
      { label: "DXM Best Budget", deal: bestBudget, source: "seo-pick-budget" },
      { label: "DXM High-End Pick", deal: bestHighEnd, source: "seo-pick-highend" },
    ].filter((p): p is { label: string; deal: NonNullable<typeof p.deal>; source: string } => Boolean(p.deal));

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "Home", url: "/" },
      { name: "Memory", url: "/memory" }
    ]);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much RAM do I need for gaming?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "16GB is standard for 2025 gaming. 32GB recommended for streaming, content creation, or heavy multitasking. 64GB+ for professional workloads."
          }
        },
        {
          "@type": "Question",
          "name": "DDR5 vs DDR4: Should I upgrade?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DDR5 is faster but more expensive. For gaming, DDR4 remains excellent value. Choose DDR5 for new builds with modern CPUs (Intel 13th gen+, AMD Ryzen 7000+)."
          }
        },
        {
          "@type": "Question",
          "name": "What speed (MHz) RAM should I buy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DDR4: 3200-3600MHz is ideal. DDR5: 5600MHz+ recommended. Higher speeds improve gaming performance slightly but cost more."
          }
        },
        {
          "@type": "Question",
          "name": "Is brand (Corsair, G.Skill, Kingston) important?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Top brands offer reliability and warranty. Any major brand is fine for gaming. Compatibility matters more—check motherboard specs for support."
          }
        }
      ]
    };

    // Path A Schema (High-Velocity): ProductCollection + AggregateOffer
    const categorySchemas = generateCategoryPageSchemas("ram", deals.length);
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
        <div className="command-panel border-b border-blue-400/20 p-6 mb-8">
          <div className="max-w-7xl mx-auto">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="status-online">
                <div className="status-ping bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                <span className="cyber-subtitle text-blue-400">MEMORY MATRIX: ONLINE</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">SIGNAL ENGINE:</span>
                <span className="text-green-300">ACTIVE</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">UNITS TRACKED:</span>
                <span className="text-blue-300">{deals.length}</span>
              </div>
            </div>

            {/* Mission Brief */}
            <div className="hologram-sheen">
              <h1 className="cyber-title text-4xl text-white mb-2">
                MEMORY <span className="text-blue-300 glow-blue">RAM & MODULES</span>
              </h1>
              <p className="cyber-subtitle text-lg mb-4 text-blue-400/80">
                HARDWARE INTELLIGENCE TERMINAL / TACTICAL EVALUATION MATRIX
              </p>
              <div className="energy-beam bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-4" />
              <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-4xl">
                Advanced memory reconnaissance data aggregated from multiple intelligence sources.
                <br />
                <span className="text-blue-300">DXM Value Scoring</span> provides quantitative analysis for tactical memory procurement decisions.
              </p>
            </div>

            {/* Growth CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/storage"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-blue-200 border border-blue-500/30 hover:border-blue-400/60 transition-colors"
              >
                Pair an SSD
              </Link>
              <Link
                href="/gaming-laptops"
                className="glass-panel-cyber px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-200 border border-slate-700/40 hover:border-slate-500/60 transition-colors"
              >
                Laptop Upgrades
              </Link>
              <Link
                href="/builds"
                className="hologram-button px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-blue-100"
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
                  <div className="w-2 h-2 bg-blue-400 rounded-full glow-blue" />
                  <h2 className="cyber-title text-xl text-white">DXM TOP PICKS</h2>
                </div>
                <Link href="/memory" className="text-xs font-mono uppercase tracking-wider text-blue-300 hover:text-blue-200">
                  Updated picks →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {picks.map((pick) => (
                  <div key={pick.label} className="relative">
                    <div className="absolute -top-2 left-3 z-10 px-2 py-1 text-[9px] font-mono uppercase tracking-widest bg-blue-500/20 border border-blue-400/40 rounded text-blue-200">
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
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle">SORT MATRIX:</span>
                <select className="glass-panel-premium text-xs font-mono text-blue-300 bg-transparent border-blue-400/30 focus:border-blue-400/60 focus:outline-none px-3 py-2 rounded">
                  <option value="score" className="bg-slate-900">DXM INTELLIGENCE</option>
                  <option value="price" className="bg-slate-900">PRICE VECTOR</option>
                  <option value="capacity" className="bg-slate-900">MEMORY CAPACITY</option>
                  <option value="speed" className="bg-slate-900">SPEED INDEX</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="cyber-subtitle">VIEW MODE:</span>
                <div className="flex gap-2">
                  <button className="hologram-button p-2 rounded">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="glass-panel-cyber p-2 rounded border-blue-400/60">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7m0 0v12m0-12l-3-3m3 3l-3 3M21 6h-7m0 0v12m0-12l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full glow-blue" />
              <h2 className="cyber-title text-xl text-white">TACTICAL MEMORY MATRIX</h2>
              <div className="flex-1 energy-beam" />
              <span className="cyber-subtitle">{deals.length} UNITS ANALYZED</span>
            </div>

            {deals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deals.slice(0, 8).map((deal) => (
                  <CyberDealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : (
              <div className="glass-panel-cyber rounded-xl p-8 text-center">
                <p className="text-slate-400 font-mono">No memory modules currently available. Check back soon.</p>
              </div>
            )}
          </div>

          {/* Buying Guide Section */}
          <div className="mb-8">
            <BuyingGuideSection guide={BUYING_GUIDE_TEMPLATES.ram} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="glass-panel-cyber rounded-xl p-8 text-center">
          <p className="text-red-400 font-mono">Error loading memory data. Please try again.</p>
        </div>
      </div>
    );
  }
}
