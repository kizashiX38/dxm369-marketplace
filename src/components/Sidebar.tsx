"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['hardware']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-20 left-4 z-50 glass-panel p-2 hover:border-cyan-400/50 transition-all"
      >
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 glass-panel-secondary border-r border-cyan-500/20 h-full overflow-y-auto holographic-sheen
        md:relative md:translate-x-0 transition-transform duration-300
        ${isMobileOpen ? 'fixed z-50 translate-x-0' : 'fixed z-50 -translate-x-full md:translate-x-0'}
      `}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan] animate-hologram-flicker" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
              Browse Categories
            </span>
          </div>
          <div className="glass-panel-secondary px-2 py-1">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">
              50+ Categories
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Categories */}
      <nav className="p-2">
        {/* Core Components */}
        <CategorySection
          title="Core Components"
          icon="🔧"
          isExpanded={expandedCategories.includes('hardware')}
          onToggle={() => toggleCategory('hardware')}
        >
          <NavItem href="/gpus" icon="🎮" label="Graphics Cards" badge="Hot" />
          <NavItem href="/cpus" icon="⚡" label="Processors" badge="New" />
          <NavItem href="/motherboards" icon="🔲" label="Motherboards" badge="New" />
          <NavItem href="/power-supplies" icon="🔋" label="Power Supplies" badge="New" />
          <NavItem href="#" icon="❄️" label="Cooling Systems" comingSoon />
          <NavItem href="#" icon="📦" label="PC Cases" comingSoon />
        </CategorySection>

        {/* Memory & Storage */}
        <CategorySection
          title="Memory & Storage"
          icon="💾"
          isExpanded={expandedCategories.includes('memory')}
          onToggle={() => toggleCategory('memory')}
        >
          <NavItem href="#" icon="🧠" label="RAM Memory" comingSoon />
          <NavItem href="#" icon="💿" label="SSD Drives" comingSoon />
          <NavItem href="#" icon="🗄️" label="Hard Drives" comingSoon />
          <NavItem href="#" icon="💽" label="NVMe M.2" comingSoon />
          <NavItem href="#" icon="💾" label="External Storage" comingSoon />
        </CategorySection>

        {/* Peripherals & Input */}
        <CategorySection
          title="Peripherals & Input"
          icon="🖱️"
          isExpanded={expandedCategories.includes('peripherals')}
          onToggle={() => toggleCategory('peripherals')}
        >
          <NavItem href="#" icon="⌨️" label="Keyboards" comingSoon />
          <NavItem href="#" icon="🖱️" label="Gaming Mice" comingSoon />
          <NavItem href="#" icon="🎮" label="Controllers" comingSoon />
          <NavItem href="#" icon="🖊️" label="Drawing Tablets" comingSoon />
          <NavItem href="#" icon="📷" label="Webcams" comingSoon />
        </CategorySection>

        {/* Displays & Audio */}
        <CategorySection
          title="Displays & Audio"
          icon="🖥️"
          isExpanded={expandedCategories.includes('displays')}
          onToggle={() => toggleCategory('displays')}
        >
          <NavItem href="/gaming-monitors" icon="🖥️" label="Gaming Monitors" badge="New" />
          <NavItem href="#" icon="📺" label="4K Displays" comingSoon />
          <NavItem href="#" icon="🎧" label="Headsets" comingSoon />
          <NavItem href="#" icon="🔊" label="Speakers" comingSoon />
          <NavItem href="#" icon="🎤" label="Microphones" comingSoon />
        </CategorySection>

        {/* Mobile & Laptops */}
        <CategorySection
          title="Mobile & Laptops"
          icon="💻"
          isExpanded={expandedCategories.includes('mobile')}
          onToggle={() => toggleCategory('mobile')}
        >
          <NavItem href="/laptops" icon="💻" label="Gaming Laptops" />
          <NavItem href="#" icon="🖥️" label="Workstations" comingSoon />
          <NavItem href="#" icon="📱" label="Tablets" comingSoon />
          <NavItem href="#" icon="⌚" label="Smart Watches" comingSoon />
          <NavItem href="#" icon="🎧" label="Mobile Audio" comingSoon />
        </CategorySection>

        {/* Networking & Connectivity */}
        <CategorySection
          title="Networking"
          icon="🌐"
          isExpanded={expandedCategories.includes('networking')}
          onToggle={() => toggleCategory('networking')}
        >
          <NavItem href="#" icon="📡" label="WiFi Routers" comingSoon />
          <NavItem href="#" icon="🔌" label="Network Cards" comingSoon />
          <NavItem href="#" icon="🔗" label="Cables & Adapters" comingSoon />
          <NavItem href="#" icon="📶" label="WiFi Extenders" comingSoon />
          <NavItem href="#" icon="🛡️" label="Network Security" comingSoon />
        </CategorySection>

        {/* Gaming Hardware */}
        <CategorySection
          title="Gaming Hardware"
          icon="🎮"
          isExpanded={expandedCategories.includes('gaming')}
          onToggle={() => toggleCategory('gaming')}
        >
          <NavItem href="#" icon="🎮" label="Gaming Chairs" comingSoon />
          <NavItem href="#" icon="🕹️" label="Racing Wheels" comingSoon />
          <NavItem href="#" icon="🎯" label="Gaming Desks" comingSoon />
          <NavItem href="#" icon="💡" label="RGB Lighting" comingSoon />
          <NavItem href="#" icon="🎪" label="Streaming Gear" comingSoon />
        </CategorySection>

        {/* Professional & Workstation */}
        <CategorySection
          title="Professional"
          icon="🏢"
          isExpanded={expandedCategories.includes('professional')}
          onToggle={() => toggleCategory('professional')}
        >
          <NavItem href="#" icon="🖨️" label="Printers & Scanners" comingSoon />
          <NavItem href="#" icon="📊" label="Business Displays" comingSoon />
          <NavItem href="#" icon="🔒" label="Security Hardware" comingSoon />
          <NavItem href="#" icon="☁️" label="Server Components" comingSoon />
          <NavItem href="#" icon="🔧" label="Tools & Testing" comingSoon />
        </CategorySection>

        {/* Software & Digital */}
        <CategorySection
          title="Software & Digital"
          icon="💿"
          isExpanded={expandedCategories.includes('software')}
          onToggle={() => toggleCategory('software')}
        >
          <NavItem href="#" icon="🖥️" label="Operating Systems" comingSoon />
          <NavItem href="#" icon="🎮" label="PC Games" comingSoon />
          <NavItem href="#" icon="🛡️" label="Security Software" comingSoon />
          <NavItem href="#" icon="🎨" label="Creative Software" comingSoon />
          <NavItem href="#" icon="⚙️" label="Utilities" comingSoon />
        </CategorySection>

        {/* Deals & Specials */}
        <CategorySection
          title="Deals & Specials"
          icon="💰"
          isExpanded={expandedCategories.includes('deals')}
          onToggle={() => toggleCategory('deals')}
        >
          <NavItem href="/deals" icon="🎯" label="Deal Radar" badge="Live" />
          <NavItem href="/trending" icon="📈" label="Trending" badge="Hot" />
          <NavItem href="#" icon="⚡" label="Flash Sales" badge="New" comingSoon />
          <NavItem href="#" icon="📦" label="Bundles" comingSoon />
          <NavItem href="#" icon="🔄" label="Refurbished" comingSoon />
        </CategorySection>

        {/* Complete Systems */}
        <CategorySection
          title="Complete Systems"
          icon="🖥️"
          isExpanded={expandedCategories.includes('systems')}
          onToggle={() => toggleCategory('systems')}
        >
          <NavItem href="/builds" icon="🖥️" label="PC Builds" />
          <NavItem href="#" icon="🎮" label="Gaming PCs" comingSoon />
          <NavItem href="#" icon="🏢" label="Workstations" comingSoon />
          <NavItem href="#" icon="🖥️" label="Mini PCs" comingSoon />
          <NavItem href="#" icon="🔧" label="Barebones" comingSoon />
        </CategorySection>

        {/* System Info */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20">
          <NavItem href="/about" icon="ℹ️" label="About DXM369" />
          
          {/* System Status Panel */}
          <div className="mt-4 p-3 glass-panel holographic-sheen">
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-2 text-center">
              System Status
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-600 uppercase">API</span>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 bg-cyan-400 animate-neon-pulse" />
                  <span className="text-[8px] font-mono text-cyan-400">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-600 uppercase">Deals</span>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 bg-green-400 animate-pulse" />
                  <span className="text-[8px] font-mono text-green-400">Live</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-600 uppercase">DB</span>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 bg-cyan-400 animate-neon-pulse" />
                  <span className="text-[8px] font-mono text-cyan-400">Ready</span>
                </div>
              </div>
            </div>
            
            {/* Version Info */}
            <div className="mt-3 pt-2 border-t border-cyan-500/20 text-center">
              <span className="text-[7px] font-mono text-slate-600 uppercase tracking-wider">
                DXM369 v3.8 Terminal
              </span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
    </>
  );
}

function CategorySection({
  title,
  icon,
  isExpanded,
  onToggle,
  children
}: {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 glass-panel-secondary hover:border-cyan-400/40 hover:bg-white/5 transition-all duration-200 holographic-sheen group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 group-hover:text-white">
            {title}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-cyan-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-cyan-500/20 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge,
  comingSoon = false
}: {
  href: string;
  icon: string;
  label: string;
  badge?: string;
  comingSoon?: boolean;
}) {
  const content = (
    <div className="flex items-center justify-between p-2 glass-panel-secondary hover:border-cyan-400/30 hover:bg-white/5 transition-all duration-200 holographic-sheen group">
      <div className="flex items-center gap-2">
        <span className="text-xs animate-hologram-flicker">{icon}</span>
        <span className={`text-xs font-mono ${comingSoon ? 'text-slate-500' : 'text-slate-400 group-hover:text-cyan-300'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {badge && (
          <span className={`px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider glass-panel ${
            badge === 'Hot' ? 'text-red-400 border-red-400/30' :
            badge === 'New' ? 'text-green-400 border-green-400/30' :
            badge === 'Live' ? 'text-cyan-400 border-cyan-400/30 animate-neon-pulse' :
            'text-blue-400 border-blue-400/30'
          }`}>
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider glass-panel-secondary text-slate-600 border-slate-600/30">
            Soon
          </span>
        )}
      </div>
    </div>
  );

  if (comingSoon) {
    return <div className="cursor-not-allowed opacity-60">{content}</div>;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
