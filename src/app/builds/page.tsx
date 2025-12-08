// TODO: Replace with real data from API
const mockBuilds: any[] = [];
import Breadcrumb from "@/components/Breadcrumb";

export default function BuildsPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: "Hardware Components", href: "#" },
          { label: "PC Builds" }
        ]} />
        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-blue-400 animate-neon-pulse shadow-[0_0_12px_blue] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-blue-400 font-bold">
              Build Matrix: Configured
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            PC Build <span className="text-blue-400">Configurations</span>
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-blue-500/40 pl-4 max-w-3xl">
            Curated PC builds from budget to high-end configurations.
            <br />
            <span className="text-slate-500 text-sm">
              Optimized for specific use cases and price points. Affiliate links coming soon.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockBuilds.map((build) => (
            <div
              key={build.id}
              className="glass-panel p-6 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-8px_rgba(6,182,212,0.3)] hover:scale-[1.015] transition-all duration-300 holographic-sheen glass-corner-accent clip-corner-br"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">{build.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold glass-panel-secondary font-mono uppercase tracking-wider ${
                    build.tier === "Budget"
                      ? "text-green-400 border-green-400/30"
                      : build.tier === "Midrange"
                      ? "text-blue-400 border-blue-400/30"
                      : "text-purple-400 border-purple-400/30"
                  }`}
                >
                  {build.tier}
                </span>
              </div>

              <div className="text-2xl font-bold text-cyan-300 mb-4 font-mono animate-hologram-flicker">${build.totalPrice}</div>

              <p className="text-slate-400 text-sm mb-4 font-mono leading-relaxed">{build.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                  <span className="text-slate-500 uppercase tracking-wider">GPU:</span> 
                  <span className="text-green-300">{build.parts.gpu}</span>
                </div>
                <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                  <span className="text-slate-500 uppercase tracking-wider">CPU:</span> 
                  <span className="text-amber-300">{build.parts.cpu}</span>
                </div>
                <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                  <span className="text-slate-500 uppercase tracking-wider">RAM:</span> 
                  <span className="text-purple-300">{build.parts.ram}</span>
                </div>
                <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                  <span className="text-slate-500 uppercase tracking-wider">SSD:</span> 
                  <span className="text-blue-300">{build.parts.ssd}</span>
                </div>
                <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                  <span className="text-slate-500 uppercase tracking-wider">PSU:</span> 
                  <span className="text-cyan-300">{build.parts.psu}</span>
                </div>
                {build.parts.motherboard && (
                  <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                    <span className="text-slate-500 uppercase tracking-wider">Motherboard:</span> 
                    <span className="text-red-300">{build.parts.motherboard}</span>
                  </div>
                )}
                {build.parts.case && (
                  <div className="flex justify-between items-center glass-panel-secondary px-2 py-1 text-sm font-mono">
                    <span className="text-slate-500 uppercase tracking-wider">Case:</span> 
                    <span className="text-pink-300">{build.parts.case}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-cyan-500/20">
                <p className="text-xs text-slate-500 font-mono italic animate-hologram-flicker">Affiliate links coming soon.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

