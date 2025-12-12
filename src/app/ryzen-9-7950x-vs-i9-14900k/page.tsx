import { Metadata } from "next";
import { generateComparisonPageData, COMPARISON_TEMPLATES } from "@/lib/comparisonPageGenerator";

export const revalidate = 3600;

const comparisonConfig = COMPARISON_TEMPLATES.ryzen9_7950x_vs_i914900k;
const pageData = generateComparisonPageData(comparisonConfig);

export const metadata: Metadata = pageData.metadata;

export default async function ComparisonPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageData.schema.itemList),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageData.schema.faq),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageData.schema.breadcrumb),
        }}
      />

      <div className="min-h-screen py-6 relative">
        <div className="max-w-6xl mx-auto px-4">
          {/* SEO Header */}
          <header className="glass-hero mb-8 p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
                CPU Comparison 2025
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              {pageData.config.productA} <span className="text-cyan-400">vs</span> {pageData.config.productB}
            </h1>
            <p className="text-lg text-slate-300 mb-6">
              {pageData.config.winnerReason}
            </p>

            <div className="flex gap-4 mt-6">
              <a href="#comparison" className="px-6 py-3 bg-cyan-400/20 border border-cyan-400/50 rounded hover:bg-cyan-400/30 text-white font-mono text-sm">
                View Comparison
              </a>
              <a href="/cpus" className="px-6 py-3 bg-slate-700/50 border border-slate-600 rounded hover:bg-slate-700/70 text-white font-mono text-sm">
                All CPUs
              </a>
            </div>
          </header>

          {/* Comparison Table */}
          <section id="comparison" className="glass-panel rounded-xl p-8 mb-8 border border-slate-700/50 overflow-x-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-mono uppercase text-xs">Spec</th>
                  <th className="text-left py-3 px-4 text-cyan-300 font-bold">{pageData.config.productA}</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-bold">{pageData.config.productB}</th>
                </tr>
              </thead>
              <tbody>
                {pageData.table.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 text-slate-400 font-mono text-xs">{row.aspect}</td>
                    <td className="py-4 px-4 text-white font-semibold">{row.productA.value}</td>
                    <td className="py-4 px-4 text-slate-300">{row.productB.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* FAQ Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Comparison FAQ</h2>
            <div className="space-y-4">
              {pageData.config.faqEntries.map((faq, index) => (
                <div key={`faq-${index}`} className="glass-panel rounded-lg p-6 border border-slate-700/50">
                  <h3 className="text-white font-bold mb-3 text-lg">{faq.question}</h3>
                  <p className="text-slate-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="glass-panel rounded-xl p-8 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Explore More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/cpus" className="p-4 bg-slate-800/50 rounded hover:bg-slate-800/70 transition">
                <h4 className="font-bold text-white mb-2">→ All CPU Deals</h4>
                <p className="text-slate-400 text-sm">Browse complete CPU lineup</p>
              </a>
              <a href="/builds" className="p-4 bg-slate-800/50 rounded hover:bg-slate-800/70 transition">
                <h4 className="font-bold text-white mb-2">→ PC Builds</h4>
                <p className="text-slate-400 text-sm">See CPU + GPU combos</p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
