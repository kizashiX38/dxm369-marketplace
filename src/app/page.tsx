import React from "react";
import Link from "next/link";
import { DXMProductResponse } from "@/types/api";
import { DealCard } from "@/components/DealCard";
import { appConfig } from "@/lib/env";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

export default async function Home() {
  // Fetch real deal data for homepage sections from normalized API routes
  // Gracefully handle API failures during build/development
  let featuredDeals: DXMProductResponse = [];
  let trendingDeals: DXMProductResponse = [];
  let topGpuDeals: DXMProductResponse = [];

  try {
    const baseUrl = appConfig.baseUrl;
    
    // Fetch from normalized API routes with ISR caching
    const [gpusRes, buildsRes] = await Promise.all([
      fetch(`${baseUrl}/api/dxm/products/gpus`, { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } }).catch(() => null),
      fetch(`${baseUrl}/api/dxm/products/builds`, { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } }).catch(() => null),
    ]);

    if (gpusRes?.ok) {
      const gpus: DXMProductResponse = await gpusRes.json();
      topGpuDeals = gpus.slice(0, 3);
      featuredDeals = gpus.slice(0, 4); // Top 4 featured deals
      trendingDeals = gpus.slice(0, 6); // Top 6 trending deals (sorted by DXM score)
    }

    if (buildsRes?.ok) {
      const builds: DXMProductResponse = await buildsRes.json();
      // Use builds for featured if available
      if (builds.length > 0 && featuredDeals.length < 4) {
        featuredDeals = [...featuredDeals, ...builds.slice(0, 4 - featuredDeals.length)];
      }
    }
  } catch (error) {
    // In real-data mode, if API fails, show empty state
    // This allows build to succeed even without credentials
    console.warn('[Homepage] Failed to load deals:', error instanceof Error ? error.message : String(error));
  }
  return (
    <div className="space-y-6 py-4">
      {/* Hero Section - Glass Cyber Console */}
      <section className="relative overflow-hidden glass-hero px-6 py-8 group holographic-sheen clip-corner-tl glass-corner-accent">
        <div className="pointer-events-none absolute -right-10 top-0 text-[300px] font-black tracking-tighter text-cyan-500/[0.025] select-none leading-none z-0 transform rotate-12 animate-hologram-flicker">
          DXM
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-scan-fast" />
        
        {/* Diagonal light streak */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400/40 via-transparent to-transparent transform -skew-x-12" />
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-cyan-400/40 transform skew-x-12" />
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          {/* Top Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-none bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan] animate-hologram-flicker" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold holographic-sheen">
                System: Online
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-cyan-500/30" />
              <div className="flex items-center gap-2 glass-panel-secondary px-2 py-1 text-[9px] font-mono uppercase tracking-[0.15em] text-cyan-300 holographic-sheen">
                <RadarTick />
                <span>Signal Feed Active</span>
              </div>
            </div>
          </div>

          {/* Main Title & Sub */}
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase drop-shadow-lg">
                DXM369 <span className="text-cyan-400">Gear Nexus</span>
              </h1>
              <p className="text-sm text-slate-400 font-mono leading-relaxed border-l-2 border-cyan-500/40 pl-4">
                Hardware intelligence terminal.
                <br />
                <span className="text-slate-500">
                  No inventory. No noise. Pure signal.
                </span>
              </p>
            </div>
            
            {/* Version Tag */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono uppercase text-cyan-600/70">
                Terminal v3.0
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 glass-panel text-[10px] font-mono uppercase text-cyan-400 tracking-widest clip-corner-br holographic-sheen animate-neon-pulse">
                Console Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Mission Panel */}
        <CyberCard title="Mission / Intel" iconColor="bg-slate-500">
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-light">
            <p>
              <strong className="text-white font-medium">DXM369</strong> is a hardware intelligence radar. We aggregate signals to find the cleanest deals on GPUs, CPUs, and components.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
            <p className="text-xs text-slate-400 font-mono">
              &gt; No warehouses.
              <br />
              &gt; No markup.
              <br />
              &gt; Pure signal.
            </p>
          </div>
        </CyberCard>

        {/* Command Modules */}
        <CyberCard title="Command Modules" iconColor="bg-cyan-500">
          <div className="grid gap-3">
            <ModuleTile
              href="/deals"
              icon={<IconRadar />}
              title="Deals Radar"
              description="Signal-to-noise analysis."
            />
            <ModuleTile
              href="/trending"
              icon={<IconTrend />}
              title="Market Trends"
              description="Price drift tracking."
            />
            <ModuleTile
              href="/builds"
              icon={<IconWrench />}
              title="Build Advisor"
              description="Curated configs."
            />
          </div>
        </CyberCard>

        {/* Status Panel */}
        <CyberCard title="System Status" iconColor="bg-green-500">
          <div className="space-y-3">
            <StatusItem label="Domain" value="dxm369.com" status="active" icon={<IconGlobe />} />
            <StatusItem label="Mode" value="Pre-launch" status="pending" icon={<IconClock />} />
            <StatusItem label="Source" value="Amazon API" status="pending" icon={<IconFeed />} />
            <StatusItem label="Shield" value="Active" status="active" icon={<IconShield />} />
            <StatusItem label="Core" value="Next.js" status="active" icon={<IconStack />} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
            <span className="text-[9px] font-mono text-slate-600 uppercase">Uptime</span>
            <span className="text-[9px] font-mono text-cyan-400">99.9%</span>
          </div>
        </CyberCard>
      </section>

      {/* 🎯 DXM FEATURED: TOP 1440P DEALS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 bg-emerald-400 shadow-[0_0_8px_emerald] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              DXM Featured: Top 1440p Deals
            </h2>
          </div>
          <Link 
            href="/deals" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredDeals.map((product) => (
            <DealCard key={product.id} deal={product} source="homepage-featured" variant="compact" />
          ))}
        </div>
      </section>

      {/* 💰 BEST VALUE UNDER $400 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 bg-amber-400 shadow-[0_0_8px_amber] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              Best Value Under $400
            </h2>
          </div>
          <Link 
            href="/deals?maxPrice=400" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topGpuDeals.filter(product => product.price <= 400).slice(0, 3).map((product) => (
            <DealCard key={product.id} deal={product} source="homepage-budget" variant="standard" />
          ))}
        </div>
      </section>

      {/* 🚀 4K GAMING POWERHOUSE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 bg-rose-400 shadow-[0_0_8px_rose] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              4K Gaming Powerhouse
            </h2>
          </div>
          <Link 
            href="/gpus?segment=4k" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topGpuDeals.filter(product => product.price >= 800).slice(0, 3).map((product) => (
            <DealCard key={product.id} deal={product} source="homepage-4k" variant="standard" />
          ))}
        </div>
      </section>

      {/* 📈 TRENDING PRICE DROPS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 bg-cyan-400 shadow-[0_0_8px_cyan] animate-neon-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-300">
              Trending Price Drops
            </h2>
          </div>
          <Link 
            href="/trending" 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {trendingDeals.map((product) => (
            <DealCard key={product.id} deal={product} source="homepage-trending" variant="compact" />
          ))}
        </div>
      </section>

      {/* Category Navigation Bar */}
      <section className="pt-6 relative">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
            Direct Access Routes
          </p>
          <div className="h-px flex-grow mx-4 bg-slate-800/50" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CategoryButton href="/gpus" title="GPUs" />
          <CategoryButton href="/cpus" title="CPUs" />
          <CategoryButton href="/laptops" title="Laptops" />
          <CategoryButton href="/builds" title="PC Builds" />
        </div>
      </section>
    </div>
  );
}

/* Cyber UI Components */

function CyberCard({ 
  title, 
  children, 
  iconColor 
}: { 
  title: string; 
  children: React.ReactNode; 
  iconColor: string 
}) {
  return (
    <div className="relative glass-panel p-6 clip-corner-tl overflow-hidden group transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-8px_rgba(6,182,212,0.3)] hover:scale-[1.015] holographic-sheen glass-corner-accent">
      <div className="absolute top-0 right-0 p-2 opacity-15 group-hover:opacity-30 transition-opacity">
        <IconHexGrid />
      </div>
      
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors">
        <div className={`w-1.5 h-1.5 ${iconColor} shadow-[0_0_12px_currentColor] animate-neon-pulse`} />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-300 group-hover:text-white transition-colors">
          {title}
        </h2>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function ModuleTile({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3.5 glass-panel-secondary px-4 py-3 transition-all duration-200 hover:border-cyan-400/50 hover:bg-white/8 overflow-hidden holographic-sheen"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500/0 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_cyan] transition-all duration-200" />
      
      <span className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors group-hover:scale-110 duration-200 animate-hologram-flicker">
        {icon}
      </span>
      
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-[10px] text-slate-500 group-hover:text-cyan-400/70 font-mono transition-colors">
          {description}
        </p>
      </div>
      
      <IconArrowRight className="absolute right-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-cyan-400" />
    </Link>
  );
}

function StatusItem({
  label,
  value,
  status,
  icon,
}: {
  label: string;
  value: string;
  status: "active" | "pending" | "offline";
  icon?: React.ReactNode;
}) {
  const dotColor =
    status === "active"
      ? "bg-cyan-400 shadow-[0_0_8px_cyan] animate-neon-pulse"
      : status === "pending"
        ? "bg-amber-400/80 animate-pulse"
        : "bg-red-500/80";

  return (
    <div className="flex items-center justify-between px-3 py-2 glass-panel-secondary hover:border-cyan-400/30 hover:bg-white/5 transition-all group holographic-sheen">
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-slate-600 group-hover:text-cyan-500/60 transition-colors animate-hologram-flicker">{icon}</span>}
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 group-hover:text-slate-400">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-slate-300 group-hover:text-cyan-200 transition-colors">{value}</span>
        <span className={`h-1 w-1 rounded-full ${dotColor}`} />
      </div>
    </div>
  );
}

function CategoryButton({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between glass-panel px-4 py-3 transition-all duration-200 hover:border-cyan-400/60 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] hover:scale-[1.02] clip-corner-br holographic-sheen"
    >
      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
        {title}
      </span>
      <IconArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
    </Link>
  );
}

/* Icons & Micro-interactions */

function RadarTick() {
  return (
    <span className="relative flex h-2 w-2 items-center justify-center">
      <span className="absolute h-full w-full bg-cyan-400/50 animate-ping opacity-75" />
      <span className="relative h-1 w-1 bg-cyan-300 shadow-[0_0_8px_cyan] animate-neon-pulse animate-hologram-flicker" />
    </span>
  );
}

function IconHexGrid() {
  return (
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-cyan-500/10">
      <path d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z" strokeWidth="1" />
      <path d="M50 20 L76 35 V65 L50 80 L24 65 V35 Z" strokeWidth="1" />
    </svg>
  );
}

function IconArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconRadar() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 L16 8" />
      <path d="M12 3v3" />
      <path d="M12 21v-3" />
      <path d="M3 12h3" />
      <path d="M21 12h-3" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconFeed() {
  return (
    <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconStack() {
  return (
    <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
