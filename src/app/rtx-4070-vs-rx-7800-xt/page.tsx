// src/app/rtx-4070-vs-rx-7800-xt/page.tsx
// SEO-Optimized GPU Comparison Page
// Target: "RTX 4070 vs RX 7800 XT" high-traffic keyword

import { DXMProduct } from "@/lib/types/product";
import { DealCard } from "@/components/DealCard";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { getDealsByCategory, calculateSavingsPercent } from "@/lib/dealRadar";
import type { Metadata } from "next";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "RTX 4070 vs RX 7800 XT Comparison 2025 | Which GPU is Better? | DXM369",
  description: "RTX 4070 vs RX 7800 XT detailed comparison with DXM Value Scoring. Performance benchmarks, pricing analysis, and current deals for both 1440p gaming GPUs.",
  keywords: [
    "RTX 4070 vs RX 7800 XT", "RTX 4070 RX 7800 XT comparison", "RTX 4070 vs RX 7800 XT 2025",
    "RTX 4070 vs RX 7800 XT gaming", "RTX 4070 vs RX 7800 XT benchmarks", "RTX 4070 vs RX 7800 XT price",
    "1440p gaming GPU comparison", "NVIDIA vs AMD 2025", "best 1440p GPU", "RTX 4070 deals", "RX 7800 XT deals"
  ],
  openGraph: {
    title: "RTX 4070 vs RX 7800 XT Comparison 2025 | Which GPU is Better?",
    description: "Detailed comparison with DXM Value Scoring, benchmarks, and current deals.",
    url: "/rtx-4070-vs-rx-7800-xt",
  },
  alternates: {
    canonical: "https://dxm369.com/rtx-4070-vs-rx-7800-xt",
  },
};

export default async function RTX4070vsRX7800XTPage() {
  // Fetch directly from library to support static generation
  const rawDeals = await getDealsByCategory("gpu");

  // Map DealRadarItem to DXMProduct
  const allDeals: DXMProduct[] = rawDeals.map(deal => ({
    id: deal.id,
    asin: deal.asin,
    name: deal.title,
    category: "GPU",
    price: deal.price,
    originalPrice: deal.previousPrice,
    savingsPercent: calculateSavingsPercent(deal) ?? undefined,
    dxmScore: deal.dxmScore,
    vendor: deal.vendor || "Amazon",
    isPrime: deal.primeEligible,
    specs: {
      vram: deal.vram || "",
      tdp: deal.tdp || "",
      boostClock: deal.boostClock || "",
      baseClock: deal.baseClock || "",
    },
    imageUrl: deal.imageUrl,
    availability: deal.availability === "In Stock" ? "in_stock" : "out_of_stock",
    lastUpdated: new Date().toISOString(),
  }));

  // Find specific GPU deals
  const rtx4070Deals = allDeals.filter(product =>
    product.name.toLowerCase().includes('rtx 4070') &&
    !product.name.toLowerCase().includes('super') &&
    !product.name.toLowerCase().includes('ti')
  );

  const rx7800xtDeals = allDeals.filter(product =>
    product.name.toLowerCase().includes('rx 7800 xt') ||
    product.name.toLowerCase().includes('7800 xt')
  );

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: "GPU Comparisons", url: "/gpu-comparisons" },
    { name: "RTX 4070 vs RX 7800 XT", url: "/rtx-4070-vs-rx-7800-xt" }
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
                GPU Comparison 2025
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              RTX 4070 <span className="text-cyan-400">vs</span> RX 7800 XT
            </h1>
            <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-cyan-500/40 pl-4 max-w-4xl">
              Comprehensive comparison of NVIDIA RTX 4070 vs AMD RX 7800 XT with DXM Value Scoring,
              real-world gaming benchmarks, and current market pricing analysis for 1440p gaming.
            </p>
          </header>

          {/* Quick Comparison Table */}
          <section className="glass-panel p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Quick Comparison Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-slate-400 font-mono uppercase tracking-wider">Specification</th>
                    <th className="text-center py-3 text-emerald-400 font-bold">RTX 4070</th>
                    <th className="text-center py-3 text-rose-400 font-bold">RX 7800 XT</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-mono text-slate-400">MSRP</td>
                    <td className="text-center py-3">$599</td>
                    <td className="text-center py-3">$499</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-mono text-slate-400">VRAM</td>
                    <td className="text-center py-3">12GB GDDR6X</td>
                    <td className="text-center py-3 text-emerald-400 font-semibold">16GB GDDR6</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-mono text-slate-400">TDP</td>
                    <td className="text-center py-3 text-emerald-400 font-semibold">200W</td>
                    <td className="text-center py-3">263W</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-mono text-slate-400">Ray Tracing</td>
                    <td className="text-center py-3 text-emerald-400 font-semibold">Excellent</td>
                    <td className="text-center py-3">Good</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-mono text-slate-400">DLSS/FSR</td>
                    <td className="text-center py-3 text-emerald-400 font-semibold">DLSS 3</td>
                    <td className="text-center py-3">FSR 3</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-slate-400">Best For</td>
                    <td className="text-center py-3">1440p RT Gaming</td>
                    <td className="text-center py-3">1440p High Refresh</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Performance Analysis */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Performance Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* RTX 4070 Analysis */}
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-emerald-500/20 rounded border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-sm">RTX</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">NVIDIA RTX 4070</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-cyan-400 font-semibold mb-2">Strengths</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Superior ray tracing performance</li>
                      <li>• DLSS 3 with frame generation</li>
                      <li>• Lower power consumption (200W)</li>
                      <li>• Better content creation features</li>
                      <li>• More mature drivers</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Higher MSRP ($599 vs $499)</li>
                      <li>• Less VRAM (12GB vs 16GB)</li>
                      <li>• Slightly lower rasterization</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* RX 7800 XT Analysis */}
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-rose-500/20 rounded border border-rose-500/30 flex items-center justify-center">
                    <span className="text-rose-400 font-bold text-sm">RX</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">AMD RX 7800 XT</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-cyan-400 font-semibold mb-2">Strengths</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Better value at $499 MSRP</li>
                      <li>• More VRAM (16GB vs 12GB)</li>
                      <li>• Stronger rasterization performance</li>
                      <li>• Better 1440p high refresh gaming</li>
                      <li>• Future-proof VRAM buffer</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• Weaker ray tracing performance</li>
                      <li>• Higher power consumption (263W)</li>
                      <li>• FSR 3 less mature than DLSS 3</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gaming Benchmarks */}
          <section className="glass-panel p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">1440p Gaming Benchmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-cyan-400 font-semibold mb-4">Rasterization (No RT)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Cyberpunk 2077</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-400 text-sm">85 FPS</span>
                      <span className="text-rose-400 text-sm">92 FPS</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Spider-Man Remastered</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-400 text-sm">95 FPS</span>
                      <span className="text-rose-400 text-sm">102 FPS</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Forza Horizon 5</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-400 text-sm">110 FPS</span>
                      <span className="text-rose-400 text-sm">118 FPS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-cyan-400 font-semibold mb-4">Ray Tracing Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Cyberpunk 2077 RT</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-400 text-sm font-semibold">65 FPS</span>
                      <span className="text-rose-400 text-sm">48 FPS</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Metro Exodus RT</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-400 text-sm font-semibold">78 FPS</span>
                      <span className="text-rose-400 text-sm">62 FPS</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Control RT</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-400 text-sm font-semibold">88 FPS</span>
                      <span className="text-rose-400 text-sm">71 FPS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-800/30 rounded border border-slate-700/50">
              <p className="text-xs text-slate-400">
                <strong>Note:</strong> Benchmarks represent average performance at 1440p Ultra settings.
                RTX 4070 with DLSS Quality, RX 7800 XT with FSR Quality when available.
              </p>
            </div>
          </section>

          {/* Current Deals */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Current Deals & Pricing</h2>

            {/* RTX 4070 Deals */}
            {rtx4070Deals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">RTX 4070 Deals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rtx4070Deals.slice(0, 3).map((product) => (
                    <DealCard key={product.id} deal={product} source="rtx4070-comparison" />
                  ))}
                </div>
              </div>
            )}

            {/* RX 7800 XT Deals */}
            {rx7800xtDeals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-rose-400 mb-4">RX 7800 XT Deals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rx7800xtDeals.slice(0, 3).map((product) => (
                    <DealCard key={product.id} deal={product} source="rx7800xt-comparison" />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Final Verdict */}
          <section className="glass-hero p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">The Verdict: Which GPU Should You Buy?</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-panel p-6">
                <h3 className="text-emerald-400 font-bold text-lg mb-4">Choose RTX 4070 If:</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• You prioritize ray tracing performance</li>
                  <li>• You want DLSS 3 frame generation</li>
                  <li>• You do content creation work</li>
                  <li>• You have a smaller PSU (200W TDP)</li>
                  <li>• You prefer NVIDIA&apos;s software ecosystem</li>
                </ul>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-rose-400 font-bold text-lg mb-4">Choose RX 7800 XT If:</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>• You want better value for money</li>
                  <li>• You prioritize rasterization performance</li>
                  <li>• You need more VRAM (16GB vs 12GB)</li>
                  <li>• You play at 1440p high refresh rates</li>
                  <li>• You want future-proof VRAM capacity</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-slate-300 mb-4">
                <strong>DXM Recommendation:</strong> Both are excellent 1440p gaming GPUs.
                RTX 4070 for ray tracing enthusiasts, RX 7800 XT for value-conscious gamers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/gpus"
                  className="glass-panel px-6 py-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Compare All GPUs →
                </a>
                <a
                  href="/best-gpu-deals"
                  className="glass-panel-secondary px-6 py-3 text-slate-300 hover:text-white font-semibold transition-colors"
                >
                  Best GPU Deals
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
