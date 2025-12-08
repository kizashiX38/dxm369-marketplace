interface TrendingItem {
  id: string;
  name: string;
  category: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

const mockTrending: TrendingItem[] = [
  {
    id: "1",
    name: "NVIDIA GeForce RTX 4070 Super",
    category: "GPU",
    trend: "up",
    changePercent: 15,
  },
  {
    id: "2",
    name: "AMD Ryzen 7 7800X3D",
    category: "CPU",
    trend: "up",
    changePercent: 22,
  },
  {
    id: "3",
    name: "Samsung 990 PRO 2TB",
    category: "SSD",
    trend: "down",
    changePercent: -8,
  },
  {
    id: "4",
    name: "Corsair Vengeance RGB DDR5",
    category: "RAM",
    trend: "up",
    changePercent: 12,
  },
  {
    id: "5",
    name: "LG UltraGear 27GP850-B",
    category: "Monitor",
    trend: "stable",
    changePercent: 0,
  },
];

export default function TrendingPage() {
  return (
    <div className="min-h-screen py-12 relative">
      <div className="container mx-auto px-4">
        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-orange-400 animate-neon-pulse shadow-[0_0_12px_orange] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 font-bold">
              Trend Analysis: Live
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            Trending <span className="text-orange-400">Hardware</span>
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-orange-500/40 pl-4 max-w-3xl">
            Live trending items based on clicks, price changes, and stock availability.
            <br />
            <span className="text-slate-500 text-sm">
              Items ranked by market momentum and user engagement metrics.
            </span>
          </p>
        </div>

        <div className="space-y-4 max-w-4xl">
          {mockTrending.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-6 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-8px_rgba(6,182,212,0.3)] hover:scale-[1.01] transition-all duration-300 holographic-sheen glass-corner-accent clip-corner-br"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white font-mono uppercase tracking-wide">{item.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold glass-panel-secondary text-cyan-300 font-mono uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {item.trend === "up" && (
                    <div className="flex items-center gap-1 text-green-400 glass-panel-secondary px-3 py-2 animate-neon-pulse">
                      <svg
                        className="w-5 h-5 animate-hologram-flicker"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      <span className="text-sm font-semibold font-mono">+{item.changePercent}%</span>
                    </div>
                  )}
                  {item.trend === "down" && (
                    <div className="flex items-center gap-1 text-red-400 glass-panel-secondary px-3 py-2 animate-neon-pulse">
                      <svg
                        className="w-5 h-5 animate-hologram-flicker"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        />
                      </svg>
                      <span className="text-sm font-semibold font-mono">{item.changePercent}%</span>
                    </div>
                  )}
                  {item.trend === "stable" && (
                    <div className="flex items-center gap-1 text-slate-400 glass-panel-secondary px-3 py-2">
                      <svg
                        className="w-5 h-5 animate-hologram-flicker"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h14"
                        />
                      </svg>
                      <span className="text-sm font-semibold font-mono">Stable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

