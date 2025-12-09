import Breadcrumb from "@/components/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price Drops | DXM369 Gear Nexus",
  description: "Track the latest price drops on GPUs, CPUs, laptops and PC hardware. Real-time price monitoring with DXM Value Scoring.",
};

export default function PriceDropsPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        <Breadcrumb items={[
          { label: "Price Drops", href: "#" }
        ]} />

        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-green-400 animate-neon-pulse shadow-[0_0_12px_green]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-green-400 font-bold">
              Price Monitor: Active
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
            Price <span className="text-green-400">Drops</span>
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-green-500/40 pl-4 max-w-3xl">
            Products with recent price decreases. Updated every hour.
          </p>
        </div>

        <div className="glass-panel p-8 text-center">
          <div className="text-6xl mb-4">📉</div>
          <h2 className="text-xl font-bold text-white mb-2">Price Drop Detection Coming Soon</h2>
          <p className="text-slate-400 font-mono text-sm">
            We&apos;re building real-time price tracking. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
