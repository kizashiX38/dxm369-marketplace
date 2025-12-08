import Breadcrumb from "@/components/Breadcrumb";

export default function GamingMonitorsPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: "Displays & Audio", href: "#" },
          { label: "Gaming Monitors" }
        ]} />

        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-blue-400 animate-neon-pulse shadow-[0_0_12px_blue] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-blue-400 font-bold">
              Display Matrix: Coming Soon
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            <span className="text-blue-400">Gaming Monitors</span> & Displays
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-blue-500/40 pl-4 max-w-3xl">
            High refresh rate displays for competitive gaming and content creation.
            <br />
            <span className="text-slate-500 text-sm">
              Refresh rates, response times, panel types, and HDR analysis coming soon.
            </span>
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="glass-panel p-8 text-center holographic-sheen glass-corner-accent clip-corner-br">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="text-6xl mb-4">🖥️</div>
              <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide font-mono">
                Gaming Display Database
              </h2>
              <p className="text-slate-400 font-mono">
                Comprehensive monitor listings with refresh rates, response times, 
                panel technologies, and gaming performance metrics.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Refresh Rates</div>
                <div className="text-white font-bold">60Hz - 540Hz</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Response Time</div>
                <div className="text-white font-bold">0.03ms - 5ms</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Panel Types</div>
                <div className="text-white font-bold">OLED, IPS, VA, TN</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Resolutions</div>
                <div className="text-white font-bold">1080p - 8K</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Adaptive Sync</div>
                <div className="text-white font-bold">G-Sync, FreeSync</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">HDR Support</div>
                <div className="text-white font-bold">HDR10, Dolby Vision</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Sizes</div>
                <div className="text-white font-bold">21&quot; - 57&quot;</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-blue-400 font-mono text-sm mb-1">Curvature</div>
                <div className="text-white font-bold">Flat, 1000R, 1800R</div>
              </div>
            </div>

            <div className="glass-panel-secondary p-4 inline-block">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Monitor Comparison Tool In Development
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
