import Breadcrumb from "@/components/Breadcrumb";

export default function PowerSuppliesPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: "Core Components", href: "#" },
          { label: "Power Supplies" }
        ]} />

        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-yellow-400 animate-neon-pulse shadow-[0_0_12px_yellow] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-yellow-400 font-bold">
              Power Grid: Coming Soon
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            <span className="text-yellow-400">Power Supplies</span> & PSUs
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-yellow-500/40 pl-4 max-w-3xl">
            Reliable power delivery for stable system operation.
            <br />
            <span className="text-slate-500 text-sm">
              Efficiency ratings, modular cables, and wattage calculators coming soon.
            </span>
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="glass-panel p-8 text-center holographic-sheen glass-corner-accent clip-corner-br">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔋</div>
              <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide font-mono">
                PSU Database & Calculator
              </h2>
              <p className="text-slate-400 font-mono">
                Power supply recommendations with efficiency ratings, 
                modular options, and system wattage calculations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-panel-secondary p-4">
                <div className="text-yellow-400 font-mono text-sm mb-1">80+ Ratings</div>
                <div className="text-white font-bold text-xs">Bronze, Gold, Platinum, Titanium</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-yellow-400 font-mono text-sm mb-1">Wattages</div>
                <div className="text-white font-bold">450W - 1600W+</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-yellow-400 font-mono text-sm mb-1">Modularity</div>
                <div className="text-white font-bold">Full, Semi, Non</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-yellow-400 font-mono text-sm mb-1">Form Factor</div>
                <div className="text-white font-bold">ATX, SFX, SFX-L</div>
              </div>
            </div>

            <div className="glass-panel-secondary p-4 inline-block">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  PSU Calculator In Development
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
