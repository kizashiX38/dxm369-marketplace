// TODO: Replace with real data from API
const mockDeals: any[] = [];
import Breadcrumb from "@/components/Breadcrumb";

export default function DealsPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: "Deals & Offers", href: "#" },
          { label: "Deal Radar" }
        ]} />
        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
              Deals Radar: Active
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            DXM369 <span className="text-cyan-400">Deals Radar</span>
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-cyan-500/40 pl-4 max-w-3xl">
            Live hardware deals from Amazon, sorted by custom{" "}
            <strong className="text-cyan-300">DXM Value Score</strong>. 
            <br />
            <span className="text-slate-500 text-sm">
              Score considers price, performance, reviews, and historical trends.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDeals.map((deal) => (
            <div
              key={deal.id}
              className="glass-panel p-6 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-8px_rgba(6,182,212,0.3)] hover:scale-[1.015] transition-all duration-300 holographic-sheen glass-corner-accent clip-corner-br"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 text-xs font-semibold glass-panel-secondary text-cyan-400 font-mono uppercase tracking-wider">
                  {deal.category}
                </span>
                <div className="text-right">
                  <div className="text-xs text-slate-500 line-through font-mono">${deal.mockOldPrice}</div>
                  <div className="text-lg font-bold text-white font-mono">${deal.mockPrice}</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide">{deal.productName}</h3>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400 font-semibold font-mono animate-neon-pulse">
                    Save {deal.mockSavingsPercent}%
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Score: <span className="text-cyan-400 font-semibold animate-hologram-flicker">{deal.mockValueScore}</span>
                </div>
              </div>

              <a
                href={deal.mockAffiliateUrl}
                className="block w-full text-center py-2 glass-panel hover:border-cyan-400/60 hover:bg-white/10 text-cyan-300 hover:text-white transition-all text-sm font-medium font-mono uppercase tracking-wider holographic-sheen"
              >
                View Deal
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

