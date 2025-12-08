import Breadcrumb from "@/components/Breadcrumb";

// Mock motherboard data
const mockMotherboards = [
  {
    id: "1",
    name: "ASUS ROG STRIX Z790-E GAMING",
    chipset: "Intel Z790",
    socket: "LGA 1700",
    formFactor: "ATX",
    ramSlots: 4,
    maxRam: "128GB",
    mockPrice: 399,
    mockScore: 92
  },
  {
    id: "2", 
    name: "MSI MAG B650 TOMAHAWK WIFI",
    chipset: "AMD B650",
    socket: "AM5",
    formFactor: "ATX",
    ramSlots: 4,
    maxRam: "128GB",
    mockPrice: 229,
    mockScore: 88
  },
  {
    id: "3",
    name: "GIGABYTE B550 AORUS ELITE V2",
    chipset: "AMD B550",
    socket: "AM4",
    formFactor: "ATX",
    ramSlots: 4,
    maxRam: "128GB",
    mockPrice: 139,
    mockScore: 85
  }
];

export default function MotherboardsPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[
          { label: "Core Components", href: "#" },
          { label: "Motherboards" }
        ]} />

        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-purple-400 animate-neon-pulse shadow-[0_0_12px_purple] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-400 font-bold">
              Motherboard Matrix: Coming Soon
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            <span className="text-purple-400">Motherboards</span> & Mainboards
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-purple-500/40 pl-4 max-w-3xl">
            Foundation components for every PC build. Intel and AMD platforms.
            <br />
            <span className="text-slate-500 text-sm">
              Chipset compatibility, expansion slots, and feature analysis coming soon.
            </span>
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="glass-panel p-8 text-center holographic-sheen glass-corner-accent clip-corner-br">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔲</div>
              <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide font-mono">
                Motherboard Database
              </h2>
              <p className="text-slate-400 font-mono">
                Comprehensive motherboard listings with chipset compatibility, 
                expansion slots, and feature comparisons.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="glass-panel-secondary p-4">
                <div className="text-purple-400 font-mono text-sm mb-1">Intel Platforms</div>
                <div className="text-white font-bold">Z790, B760, H610</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-purple-400 font-mono text-sm mb-1">AMD Platforms</div>
                <div className="text-white font-bold">X670E, B650, A620</div>
              </div>
              <div className="glass-panel-secondary p-4">
                <div className="text-purple-400 font-mono text-sm mb-1">Form Factors</div>
                <div className="text-white font-bold">ATX, mATX, ITX</div>
              </div>
            </div>

            <div className="glass-panel-secondary p-4 inline-block">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Development In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
