// DXM369 Navigation AI Deck - Command Console Sidebar
// Tactical hardware category navigation system

"use client";

import Link from "next/link";
import { useState } from "react";

export default function CyberSidebar() {
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
      {/* Mobile Command Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-20 left-4 z-50 hologram-button p-3 rounded-lg"
      >
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Tactical Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Navigation AI Deck */}
      <aside className={`
        w-72 command-panel border-r border-cyan-400/30 h-full overflow-y-auto scanlines
        md:relative md:translate-x-0 transition-transform duration-500
        ${isMobileOpen ? 'fixed z-50 translate-x-0' : 'fixed z-50 -translate-x-full md:translate-x-0'}
      `}>
        {/* Command Header */}
        <div className="p-6 border-b border-cyan-400/20">
          <div className="status-online mb-4">
            <div className="status-ping" />
            <span className="cyber-subtitle">NAVIGATION AI: ONLINE</span>
          </div>
          
          <h2 className="cyber-title text-lg text-white mb-2">
            ▣ DXM COMMAND DECK
          </h2>
          <p className="cyber-subtitle text-xs">
            HARDWARE INTELLIGENCE ACCESS MATRIX
          </p>
          
          <div className="energy-beam mt-4" />
        </div>

        {/* Navigation Matrix */}
        <nav className="p-4 space-y-2">
          {/* Core Hardware */}
          <div className="mb-6">
            <button
              onClick={() => toggleCategory('hardware')}
              className="w-full flex items-center justify-between p-3 hologram-button rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
                <span className="cyber-title text-sm text-white">CORE HARDWARE</span>
              </div>
              <svg 
                className={`w-4 h-4 text-cyan-400 transition-transform ${expandedCategories.includes('hardware') ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {expandedCategories.includes('hardware') && (
              <div className="mt-2 ml-6 space-y-1">
                {[
                  { name: 'Graphics Cards', path: '/gpus', status: 'HOT', count: 47 },
                  { name: 'Processors', path: '/cpus', status: 'NEW', count: 32 },
                  { name: 'Motherboards', path: '/motherboards', status: '', count: 28 },
                  { name: 'Memory (RAM)', path: '/memory', status: '', count: 156 },
                  { name: 'Storage (SSD)', path: '/storage', status: 'HOT', count: 89 },
                  { name: 'Power Supplies', path: '/power-supplies', status: '', count: 43 },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between p-2 rounded-lg glass-panel-cyber hover:border-cyan-400/40 transition-all group hover:translate-x-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-cyan-400 transition-colors" />
                      <span className="text-sm font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status && (
                        <span className={`px-2 py-1 text-[8px] font-mono uppercase tracking-wider rounded ${
                          item.status === 'HOT' ? 'bg-red-500/20 border border-red-500/40 text-red-300' :
                          item.status === 'NEW' ? 'bg-green-500/20 border border-green-500/40 text-green-300' :
                          'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                        }`}>
                          {item.status}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Peripherals */}
          <div className="mb-6">
            <button
              onClick={() => toggleCategory('peripherals')}
              className="w-full flex items-center justify-between p-3 hologram-button rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full glow-blue" />
                <span className="cyber-title text-sm text-white">PERIPHERALS</span>
              </div>
              <svg 
                className={`w-4 h-4 text-cyan-400 transition-transform ${expandedCategories.includes('peripherals') ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {expandedCategories.includes('peripherals') && (
              <div className="mt-2 ml-6 space-y-1">
                {[
                  { name: 'Gaming Keyboards', path: '/keyboards', status: 'HOT', count: 67 },
                  { name: 'Gaming Mice', path: '/mice', status: '', count: 89 },
                  { name: 'Headsets', path: '/headsets', status: 'NEW', count: 45 },
                  { name: 'Webcams', path: '/webcams', status: '', count: 23 },
                  { name: 'Speakers', path: '/speakers', status: '', count: 34 },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between p-2 rounded-lg glass-panel-cyber hover:border-cyan-400/40 transition-all group hover:translate-x-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-cyan-400 transition-colors" />
                      <span className="text-sm font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status && (
                        <span className={`px-2 py-1 text-[8px] font-mono uppercase tracking-wider rounded ${
                          item.status === 'HOT' ? 'bg-red-500/20 border border-red-500/40 text-red-300' :
                          item.status === 'NEW' ? 'bg-green-500/20 border border-green-500/40 text-green-300' :
                          'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                        }`}>
                          {item.status}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Gaming Systems */}
          <div className="mb-6">
            <button
              onClick={() => toggleCategory('gaming')}
              className="w-full flex items-center justify-between p-3 hologram-button rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="cyber-title text-sm text-white">GAMING SYSTEMS</span>
              </div>
              <svg 
                className={`w-4 h-4 text-cyan-400 transition-transform ${expandedCategories.includes('gaming') ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {expandedCategories.includes('gaming') && (
              <div className="mt-2 ml-6 space-y-1">
                {[
                  { name: 'Gaming Laptops', path: '/gaming-laptops', status: 'HOT', count: 24 },
                  { name: 'Pre-built PCs', path: '/prebuilt', status: '', count: 18 },
                  { name: 'Gaming Chairs', path: '/chairs', status: '', count: 31 },
                  { name: 'Streaming Gear', path: '/streaming', status: 'NEW', count: 42 },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between p-2 rounded-lg glass-panel-cyber hover:border-cyan-400/40 transition-all group hover:translate-x-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-cyan-400 transition-colors" />
                      <span className="text-sm font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status && (
                        <span className={`px-2 py-1 text-[8px] font-mono uppercase tracking-wider rounded ${
                          item.status === 'HOT' ? 'bg-red-500/20 border border-red-500/40 text-red-300' :
                          item.status === 'NEW' ? 'bg-green-500/20 border border-green-500/40 text-green-300' :
                          'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                        }`}>
                          {item.status}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Energy Beam Separator */}
          <div className="energy-beam my-6" />

          {/* Quick Access */}
          <div className="space-y-2">
            <h3 className="cyber-subtitle mb-3">QUICK ACCESS</h3>
            {[
              { name: 'Deal Radar', path: '/deals', icon: '📡' },
              { name: 'Price Drops', path: '/drops', icon: '📉' },
              { name: 'New Arrivals', path: '/new', icon: '🆕' },
              { name: 'Best Sellers', path: '/bestsellers', icon: '🔥' },
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 p-2 rounded-lg glass-panel-cyber hover:border-cyan-400/40 transition-all group hover:translate-x-1"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-sm font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Terminal Status */}
        <div className="p-4 border-t border-cyan-400/20 mt-auto">
          <div className="glass-panel-cyber rounded-lg p-3">
            <div className="cyber-subtitle mb-2">SYSTEM STATUS</div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">DEALS TRACKED:</span>
                <span className="text-cyan-300">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PRICE UPDATES:</span>
                <span className="text-green-300">LIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LAST SCAN:</span>
                <span className="text-cyan-300">2m ago</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
