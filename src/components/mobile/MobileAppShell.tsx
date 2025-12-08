// src/components/mobile/MobileAppShell.tsx
// DXM369 Mobile App Shell - Native-like Experience
// Optimized for mobile hardware shopping and deal discovery

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface MobileAppShellProps {
  children: React.ReactNode;
}

export default function MobileAppShell({ children }: MobileAppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active tab based on pathname
  useEffect(() => {
    if (pathname === '/') setActiveTab('home');
    else if (pathname.includes('/deals')) setActiveTab('deals');
    else if (pathname.includes('/gpu')) setActiveTab('gpus');
    else if (pathname.includes('/cpu')) setActiveTab('cpus');
    else if (pathname.includes('/laptop')) setActiveTab('laptops');
    else if (pathname.includes('/trending')) setActiveTab('trending');
  }, [pathname]);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: '🏠', href: '/' },
    { id: 'deals', label: 'Deals', icon: '💰', href: '/deals', badge: 'Hot' },
    { id: 'gpus', label: 'GPUs', icon: '🎮', href: '/gpus' },
    { id: 'cpus', label: 'CPUs', icon: '🔧', href: '/cpus' },
    { id: 'laptops', label: 'Laptops', icon: '💻', href: '/laptops' },
    { id: 'trending', label: 'Trending', icon: '📈', href: '/trending' }
  ];

  const quickActions = [
    { label: 'Price Alerts', icon: '🔔', action: () => console.log('Price alerts') },
    { label: 'Wishlist', icon: '❤️', action: () => console.log('Wishlist') },
    { label: 'Compare', icon: '⚖️', action: () => console.log('Compare') },
    { label: 'Search', icon: '🔍', action: () => console.log('Search') }
  ];

  return (
    <div className="min-h-screen bg-[#080c12] text-slate-200 relative overflow-x-hidden">
      {/* Mobile Background Effects */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-[#080c12] via-[#0a0f18] to-[#0c1220]" />
      
      {/* Mobile-optimized ambient lighting */}
      <div 
        className="pointer-events-none fixed inset-0 -z-19 opacity-[0.12]"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(6, 182, 212, 0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(34, 211, 238, 0.15) 0%, transparent 60%)"
        }}
      />

      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DX</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              DXM369
            </span>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
              <span className="text-lg">🔍</span>
            </button>

            {/* Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <div className={`h-0.5 bg-slate-300 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`h-0.5 bg-slate-300 transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`h-0.5 bg-slate-300 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 border border-slate-700/30 rounded-lg whitespace-nowrap text-sm hover:border-cyan-500/50 transition-colors"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 bg-slate-900/95 backdrop-blur-md border-l border-slate-700/50 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          {/* Menu Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-cyan-400">Menu</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 mb-8">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400' 
                    : 'hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Additional Menu Items */}
          <div className="space-y-2 border-t border-slate-700/50 pt-6">
            <Link
              href="/analytics"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-lg">ℹ️</span>
              <span>About</span>
            </Link>
            <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors w-full text-left">
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
                activeTab === item.id 
                  ? 'text-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {activeTab === item.id && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile-specific floating action button */}
      <button className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
        <span className="text-white text-xl">⚡</span>
      </button>

      {/* PWA Install Prompt (if applicable) */}
      <div className="fixed top-20 left-4 right-4 z-30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm hidden" id="pwa-prompt">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-cyan-400">Install DXM369</h3>
            <p className="text-sm text-slate-300">Get the full app experience</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-cyan-500 text-white rounded-lg">
              Install
            </button>
            <button className="px-3 py-1 text-sm border border-slate-600 rounded-lg">
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized styles
export const mobileStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Mobile-specific animations */
  @keyframes mobile-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .mobile-pulse {
    animation: mobile-pulse 2s infinite;
  }
  
  /* Touch-friendly sizing */
  @media (max-width: 768px) {
    .touch-target {
      min-height: 44px;
      min-width: 44px;
    }
  }
  
  /* Safe area handling for notched devices */
  @supports (padding: max(0px)) {
    .safe-top {
      padding-top: max(1rem, env(safe-area-inset-top));
    }
    .safe-bottom {
      padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }
  }
`;
