import Breadcrumb from "@/components/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Sellers | DXM369 Gear Nexus",
  description: "Top-selling GPUs, CPUs, laptops and PC hardware. Most popular products ranked by sales and DXM Value Score.",
};

export default function BestsellersPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        <Breadcrumb items={[
          { label: "Best Sellers", href: "#" }
        ]} />

        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-orange-400 animate-neon-pulse shadow-[0_0_12px_orange]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 font-bold">
              Top Sellers: Tracking
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
            Best <span className="text-orange-400">Sellers</span>
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-orange-500/40 pl-4 max-w-3xl">
            Most popular hardware based on sales volume and customer reviews.
          </p>
        </div>

        <div className="glass-panel p-8 text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-xl font-bold text-white mb-2">Best Sellers Rankings Coming Soon</h2>
          <p className="text-slate-400 font-mono text-sm">
            We&apos;re aggregating sales data. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
