import Breadcrumb from "@/components/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals | DXM369 Gear Nexus",
  description: "Discover the latest GPUs, CPUs, laptops and PC hardware. New products added daily with DXM Value Scoring.",
};

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen py-6 relative">
      <div className="max-w-none">
        <Breadcrumb items={[
          { label: "New Arrivals", href: "#" }
        ]} />

        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-blue-400 animate-neon-pulse shadow-[0_0_12px_blue]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-blue-400 font-bold">
              New Products: Scanning
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
            New <span className="text-blue-400">Arrivals</span>
          </h1>
          <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-blue-500/40 pl-4 max-w-3xl">
            Recently added products to our catalog. Fresh hardware drops.
          </p>
        </div>

        <div className="glass-panel p-8 text-center">
          <div className="text-6xl mb-4">🆕</div>
          <h2 className="text-xl font-bold text-white mb-2">New Arrivals Feed Coming Soon</h2>
          <p className="text-slate-400 font-mono text-sm">
            We&apos;re setting up automated product discovery. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
