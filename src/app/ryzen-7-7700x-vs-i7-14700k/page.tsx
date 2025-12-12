import { Metadata } from "next";
import { generateComparisonPageData, COMPARISON_TEMPLATES } from "@/lib/comparisonPageGenerator";

export const revalidate = 3600;

const comparisonConfig = COMPARISON_TEMPLATES.ryzen7700x_vs_i714700k;
const pageData = generateComparisonPageData(comparisonConfig);

export const metadata: Metadata = pageData.metadata;

export default async function ComparisonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.schema.itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.schema.faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.schema.breadcrumb) }}
      />
      <div className="min-h-screen py-6 relative">
        <div className="max-w-6xl mx-auto px-4">
          <header className="glass-hero mb-8 p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-2 w-2 bg-amber-400 animate-neon-pulse" />
              <span className="text-[10px] font-mono uppercase text-amber-400">CPU COMPARISON 2025</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Ryzen 7 7700X <span className="text-amber-400">vs</span> i7-14700K</h1>
            <p className="text-lg text-slate-300 mb-6">Gaming vs productivity comparison with DXM analysis.</p>
            <div className="flex gap-4 mt-6">
              <a href="/cpus" className="px-6 py-3 bg-amber-400/20 border border-amber-400/50 rounded hover:bg-amber-400/30 text-white font-mono text-sm">
                All CPUs
              </a>
            </div>
          </header>
          <section className="glass-panel rounded-xl p-8 mb-8 border border-slate-700/50 overflow-x-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 text-xs">Spec</th>
                  <th className="text-left py-3 px-4 text-amber-300 font-bold">Ryzen 7 7700X</th>
                  <th className="text-left py-3 px-4 text-slate-300">i7-14700K</th>
                </tr>
              </thead>
              <tbody>
                {pageData.table.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-400 text-xs">{row.aspect}</td>
                    <td className="py-4 px-4 text-white font-semibold">{row.productA.value}</td>
                    <td className="py-4 px-4 text-slate-300">{row.productB.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
            <div className="space-y-4">
              {pageData.config.faqEntries.map((faq, i) => (
                <div key={i} className="glass-panel rounded-lg p-6 border border-slate-700/50">
                  <h3 className="text-white font-bold mb-3">{faq.question}</h3>
                  <p className="text-slate-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
