// src/app/best-ssd-deals/page.tsx
// SEO-Optimized Landing Page for "Best SSD Deals 2025"
// High-traffic keyword targeting: Storage/SSD category (highest EPC)
// This is your #1 passive revenue generator

import { getLaptopDeals } from "@/lib/dealRadar";
import { DealCard } from "@/components/DealCard";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best SSD Deals 2025 | NVMe & SATA SSD Discounts | DXM369",
  description: "Find the best SSD deals of 2025. NVMe, SATA, and external SSD discounts with real-time price tracking. Upgrade your storage with top-rated SSDs from Samsung, WD, Crucial, and more.",
  keywords: [
    "best SSD deals 2025", "NVMe SSD deals", "SATA SSD deals", "Samsung SSD deals",
    "WD SSD deals", "Crucial SSD deals", "1TB SSD deals", "2TB SSD deals",
    "gaming SSD deals", "budget SSD deals", "fastest SSD deals", "external SSD deals"
  ],
  openGraph: {
    title: "Best SSD Deals 2025 | NVMe & SATA SSD Discounts",
    description: "Find the best SSD deals with DXM Value Scoring. Real-time price tracking and affiliate links.",
    url: "/best-ssd-deals",
  },
  alternates: {
    canonical: "https://dxm369.com/best-ssd-deals",
  },
};

export default async function BestSSDDealsPage() {
  // For now, we'll use laptop deals as a placeholder structure
  // In production, you'll add getSSDDeals() or use product discovery
  const allDeals = await getLaptopDeals();
  
  // Filter for storage-related deals (when SSD data is available)
  // For now, we'll create a structured page that works with the tracking system
  
  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: "Storage", url: "/storage" },
    { name: "Best SSD Deals 2025", url: "/best-ssd-deals" }
  ]);

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      
      <div className="min-h-screen py-6 relative">
        <div className="max-w-6xl mx-auto px-4">
          {/* SEO-Optimized Header */}
          <header className="glass-hero mb-8 p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-2 w-2 bg-emerald-400 animate-neon-pulse shadow-[0_0_12px_emerald]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
                Best SSD Deals 2025
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              Best <span className="text-emerald-400">SSD Deals</span> 2025
            </h1>
            <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-emerald-500/40 pl-4 max-w-4xl mb-6">
              Discover the best SSD deals of 2025 with our proprietary DXM Value Scoring system. 
              We analyze performance-per-dollar, speed ratings, capacity, and reliability to surface 
              the cleanest storage deals from Samsung 990 PRO NVMe to budget SATA SSDs.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">⚡ NVMe Performance</h3>
                <p className="text-xs text-slate-400">PCIe 4.0 and 5.0 SSDs with 7000+ MB/s read speeds for gaming and content creation</p>
              </div>
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">💰 Value Scoring</h3>
                <p className="text-xs text-slate-400">DXM algorithm ranks SSDs by speed, capacity, price, and reliability scores</p>
              </div>
              <div className="glass-panel-secondary p-4">
                <h3 className="text-cyan-400 font-bold text-sm mb-2">🔗 Verified Links</h3>
                <p className="text-xs text-slate-400">Direct affiliate links to Amazon with Prime shipping and price protection</p>
              </div>
            </div>
          </header>

          {/* NVMe SSD Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">⚡ NVMe SSD Deals (PCIe 4.0/5.0)</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                Samsung • WD • Crucial
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              High-performance NVMe SSDs for gaming, content creation, and professional workloads. 
              PCIe 4.0 and 5.0 drives with 5000-12000 MB/s read speeds.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder: When SSD data is available, map through deals */}
              <div className="glass-panel p-6 text-center">
                <p className="text-slate-400 text-sm mb-4">SSD deals coming soon</p>
                <p className="text-xs text-slate-500">Use tracking ID: <code className="text-cyan-400">dxmatrix-storage-20</code></p>
              </div>
            </div>
          </section>

          {/* SATA SSD Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">💾 SATA SSD Deals (Budget-Friendly)</h2>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                Budget • Upgrade • Value
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Affordable SATA SSDs for system upgrades and secondary storage. 
              Perfect for budget builds and HDD replacements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-6 text-center">
                <p className="text-slate-400 text-sm mb-4">SATA SSD deals coming soon</p>
                <p className="text-xs text-slate-500">Use tracking ID: <code className="text-cyan-400">dxmatrix-storage-20</code></p>
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="glass-panel p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">How We Find the Best SSD Deals</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                Our DXM Value Scoring system analyzes SSD deals using a proprietary algorithm 
                that evaluates speed ratings, capacity-per-dollar, reliability scores, and market trends.
              </p>
              
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">What Makes a Great SSD Deal in 2025?</h3>
              <ul className="text-slate-300 space-y-2 mb-6">
                <li><strong>Speed Per Dollar:</strong> We calculate read/write speeds relative to current market price</li>
                <li><strong>Capacity Value:</strong> Price per GB/TB calculations for storage efficiency</li>
                <li><strong>Reliability:</strong> TBW (Terabytes Written) ratings and warranty coverage</li>
                <li><strong>Form Factor:</strong> M.2 NVMe vs SATA compatibility for your system</li>
                <li><strong>Use Case Match:</strong> Gaming, content creation, or general storage optimization</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-400 mb-3">SSD Categories We Track</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">NVMe PCIe 5.0</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Samsung 990 PRO - 7450 MB/s read</li>
                    <li>• WD Black SN850X - 7300 MB/s read</li>
                    <li>• Crucial T700 - 12000 MB/s read</li>
                    <li>• Best for: High-end gaming, 4K video editing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">NVMe PCIe 4.0</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Samsung 980 PRO - 7000 MB/s read</li>
                    <li>• WD Black SN770 - 5150 MB/s read</li>
                    <li>• Crucial P5 Plus - 6600 MB/s read</li>
                    <li>• Best for: Gaming, content creation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">SATA SSDs</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Samsung 870 EVO - 560 MB/s read</li>
                    <li>• Crucial MX500 - 560 MB/s read</li>
                    <li>• WD Blue 3D - 560 MB/s read</li>
                    <li>• Best for: Budget builds, HDD upgrades</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">External SSDs</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Samsung T7 - USB 3.2 Gen 2</li>
                    <li>• WD My Passport - Portable storage</li>
                    <li>• SanDisk Extreme Pro - High-speed portable</li>
                    <li>• Best for: Backup, portable storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="glass-hero p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Ready to Upgrade Your Storage?</h2>
            <p className="text-slate-400 mb-6">
              Browse our complete SSD catalog with real-time DXM Value Scoring and affiliate links to the best deals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/deals" 
                className="glass-panel px-6 py-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                View All Deals →
              </a>
              <a 
                href="/trending" 
                className="glass-panel-secondary px-6 py-3 text-slate-300 hover:text-white font-semibold transition-colors"
              >
                Trending Deals
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

