// DXM369 Memory Command Console - Hardware Intelligence Terminal
// Tactical RAM/Memory evaluation matrix

import { DXMProductResponse } from "@/types/api";
import { CyberDealCard } from "@/components/CyberDealCard";
import { appConfig } from "@/lib/env";

export default async function MemoryCommandConsole() {
  try {
    // Fetch from normalized API route (using CPUs as placeholder until RAM endpoint exists)
    const baseUrl = appConfig.baseUrl;
    const response = await fetch(`${baseUrl}/api/dxm/products/cpus`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const deals: DXMProductResponse = await response.json();

    return (
      <div className="min-h-screen bg-slate-950 tactical-grid">
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
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
