export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header - Glass Console Style */}
        <div className="glass-hero mb-8 p-6 clip-corner-tl glass-corner-accent holographic-sheen">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
              System Info: Available
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight holographic-sheen">
            About <span className="text-cyan-400">DXM369 Gear Nexus</span>
          </h1>
        </div>

        <div className="space-y-6 text-slate-300">
          <div className="glass-panel p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide font-mono">What We Are</h2>
            <p className="mb-4 font-mono leading-relaxed">
              <span className="text-cyan-400 font-bold">DXM369 Gear Nexus</span> is a curated affiliate-driven hardware discovery hub. We aggregate
              deals and product listings from leading marketplaces (initially Amazon) and present
              them in a clean, organized format to help you find the best hardware deals.
            </p>
            <p className="font-mono leading-relaxed">
              Unlike traditional retailers, we don&apos;t hold inventory. Instead, we focus on
              <span className="text-cyan-300"> discovery, curation, and value analysis</span>—helping you make informed decisions about
              GPUs, CPUs, laptops, and PC builds.
            </p>
          </div>

          <div className="glass-panel p-8 clip-corner-br glass-corner-accent holographic-sheen">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide font-mono">Our Mission</h2>
            <p className="mb-4 font-mono">
              <strong className="text-cyan-400 animate-hologram-flicker">Hardware. Signals. Smart Deals.</strong>
            </p>
            <p className="font-mono leading-relaxed">
              We cut through the noise of endless product listings to surface the deals that matter.
              Our <span className="text-cyan-300 font-bold">DXM Value Score</span> considers performance, price, reviews, and trends to help you find
              real value, not just low prices.
            </p>
          </div>

          <div className="glass-panel p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide font-mono">Current Status</h2>
            <p className="mb-4 font-mono leading-relaxed">
              This is an <strong className="text-amber-400 animate-neon-pulse">MVP / experimental version</strong> of
              DXM369 Gear Nexus. The current implementation uses mock data to demonstrate the
              structure and UI.
            </p>
            <p className="font-mono leading-relaxed">
              Future versions will integrate with the <span className="text-green-400">Amazon Product Advertising API</span> and additional
              marketplaces to provide live deal aggregation, real-time pricing, and comprehensive
              product information.
            </p>
          </div>

          <div className="glass-panel p-8 clip-corner-br glass-corner-accent holographic-sheen">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide font-mono">Technology</h2>
            <p className="font-mono leading-relaxed">
              Built with <span className="text-blue-400">Next.js (App Router)</span>, <span className="text-blue-300">TypeScript</span>, and <span className="text-cyan-400">Tailwind CSS</span>. Optimized for
              performance, SEO, and <span className="text-orange-400">Cloudflare deployment</span>. The codebase is structured for easy
              extension and integration with affiliate APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

