// src/components/mobile/MobileHomepage.tsx
// Mobile-Optimized Homepage for DXM369
// Swipeable sections, touch-friendly navigation, and native app feel

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DXMProduct } from "@/lib/types/product";
import { MobileDealGrid } from "./MobileDealCard";

interface MobileHomepageProps {
  featuredDeals: DXMProduct[];
  trendingDeals: DXMProduct[];
  gpuDeals: DXMProduct[];
  cpuDeals: DXMProduct[];
  laptopDeals: DXMProduct[];
}

export default function MobileHomepage({
  featuredDeals,
  trendingDeals,
  gpuDeals,
  cpuDeals,
  laptopDeals
}: MobileHomepageProps) {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('featured');
  const scrollRef = useRef<HTMLDivElement>(null);

  const heroSlides = [
    {
      id: 'rtx-deals',
      title: 'RTX 4070 Super Deals',
      subtitle: 'Up to 25% OFF Premium GPUs',
      background: 'from-green-500/20 to-emerald-500/20',
      icon: '🎮',
      cta: 'Shop GPUs'
    },
    {
      id: 'cpu-deals',
      title: 'Intel 14th Gen Launch',
      subtitle: 'Latest Processors Available',
      background: 'from-blue-500/20 to-cyan-500/20',
      icon: '🔧',
      cta: 'Shop CPUs'
    },
    {
      id: 'laptop-deals',
      title: 'Gaming Laptop Sale',
      subtitle: 'RTX 4080 Laptops from $1,599',
      background: 'from-purple-500/20 to-pink-500/20',
      icon: '💻',
      cta: 'Shop Laptops'
    }
  ];

  const categories = [
    { id: 'featured', label: 'Featured', icon: '⭐', deals: featuredDeals },
    { id: 'trending', label: 'Trending', icon: '📈', deals: trendingDeals },
    { id: 'gpus', label: 'GPUs', icon: '🎮', deals: gpuDeals.slice(0, 6) },
    { id: 'cpus', label: 'CPUs', icon: '🔧', deals: cpuDeals.slice(0, 6) },
    { id: 'laptops', label: 'Laptops', icon: '💻', deals: laptopDeals.slice(0, 6) }
  ];

  const quickStats = [
    { label: 'Active Deals', value: '150+', icon: '💰', color: 'text-green-400' },
    { label: 'Avg Savings', value: '23%', icon: '📉', color: 'text-cyan-400' },
    { label: 'DXM Score', value: '8.7', icon: '🎯', color: 'text-yellow-400' },
    { label: 'Categories', value: '12', icon: '📦', color: 'text-purple-400' }
  ];

  // Auto-advance hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (scrollRef.current) {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl mx-4">
        <div className="relative h-48 flex items-center justify-center">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-br ${slide.background} border border-slate-700/50 rounded-xl p-6 flex items-center transition-all duration-500 ${
                index === activeHeroSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{slide.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{slide.title}</h2>
                    <p className="text-sm text-slate-300">{slide.subtitle}</p>
                  </div>
                </div>
                <button className="mt-3 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all active:scale-95">
                  {slide.cta} →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveHeroSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeHeroSlide 
                  ? 'bg-white' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mx-4">
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">{stat.icon}</span>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Navigation */}
      <section className="mx-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-800/30 border border-slate-700/50 text-slate-400 hover:text-white'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">
                {category.deals.length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mx-4">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/deals"
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4 text-center hover:from-cyan-500/30 hover:to-blue-500/30 transition-all active:scale-95"
          >
            <div className="text-2xl mb-2">🔥</div>
            <div className="font-semibold text-cyan-400">Hot Deals</div>
            <div className="text-xs text-slate-400">Limited time offers</div>
          </Link>
          <Link
            href="/trending"
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center hover:from-green-500/30 hover:to-emerald-500/30 transition-all active:scale-95"
          >
            <div className="text-2xl mb-2">📈</div>
            <div className="font-semibold text-green-400">Trending</div>
            <div className="text-xs text-slate-400">Popular products</div>
          </Link>
        </div>
      </section>

      {/* Deal Categories */}
      <div ref={scrollRef} className="space-y-8">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} className="mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{category.label} Deals</h3>
                  <p className="text-sm text-slate-400">{category.deals.length} products available</p>
                </div>
              </div>
              <Link
                href={`/${category.id}`}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View All →
              </Link>
            </div>

            {/* Horizontal Scrolling Deal Cards */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {category.deals.map((deal) => (
                <div key={deal.id} className="flex-shrink-0 w-72">
                  <MobileDealGrid 
                    products={[deal]} 
                    variant="compact"
                    showQuickActions={true}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Featured Categories Grid */}
      <section className="mx-4">
        <h3 className="text-lg font-bold text-white mb-4">Browse Categories</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Graphics Cards', icon: '🎮', href: '/gpus', count: '45+' },
            { name: 'Processors', icon: '🔧', href: '/cpus', count: '32+' },
            { name: 'Gaming Laptops', icon: '💻', href: '/laptops', count: '28+' },
            { name: 'Monitors', icon: '🖥️', href: '/monitors', count: '19+' },
            { name: 'Storage', icon: '💾', href: '/storage', count: '24+' },
            { name: 'Memory', icon: '🧠', href: '/memory', count: '16+' }
          ].map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center hover:border-cyan-400/50 transition-all active:scale-95"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-semibold text-white text-sm">{category.name}</div>
              <div className="text-xs text-slate-400">{category.count} deals</div>
            </Link>
          ))}
        </div>
      </section>

      {/* DXM Intelligence Showcase */}
      <section className="mx-4">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">DX</span>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400">DXM Intelligence</h3>
              <p className="text-sm text-slate-300">Smart hardware scoring system</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400">✓</span>
              <span className="text-slate-300">Real-time price analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cyan-400">✓</span>
              <span className="text-slate-300">Performance per dollar scoring</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cyan-400">✓</span>
              <span className="text-slate-300">Market trend predictions</span>
            </div>
          </div>

          <Link
            href="/about"
            className="inline-block mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-all active:scale-95"
          >
            Learn More →
          </Link>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="mx-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="text-2xl mb-3">📧</div>
          <h3 className="font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-sm text-slate-400 mb-4">Get notified about the best hardware deals</p>
          
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors active:scale-95">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
