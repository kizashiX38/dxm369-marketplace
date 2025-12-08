// src/components/mobile/MobileDealCard.tsx
// Mobile-Optimized Deal Cards for DXM369
// Touch-friendly, swipeable, and performance-optimized

"use client";

import { useState } from "react";
import Link from "next/link";
import { buildAmazonProductUrl } from "@/lib/affiliate";
import { DXMProduct, getAvailabilityDisplay, getAvailabilityColor } from "@/lib/types/product";
import { trackAffiliateClick } from "@/lib/tracking";

interface MobileDealCardProps {
  product: DXMProduct;
  variant?: "compact" | "featured" | "list";
  showQuickActions?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  source?: string; // Tracking source identifier
  intent?: 'review' | 'top10' | 'browse' | 'comparison' | 'deal'; // User intent
}

export default function MobileDealCard({ 
  product, 
  variant = "compact",
  showQuickActions = true,
  onSwipeLeft,
  onSwipeRight,
  source = "mobile-card",
  intent
}: MobileDealCardProps) {
  // Build context-aware affiliate URL
  const affiliateUrl = buildAmazonProductUrl(product.asin, {
    context: {
      category: product.category.toLowerCase() as any,
      source: source.includes('seo') ? 'seo' : source.includes('social') ? 'social' : undefined,
      intent,
      pageType: intent === 'review' ? 'review' : intent === 'comparison' ? 'comparison' : 'product',
    },
  });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const savingsPercent = product.savingsPercent || 0;

  const handleViewDeal = () => {
    trackAffiliateClick({
      asin: product.asin,
      category: product.category.toLowerCase() as any,
      price: product.price,
      dxmScore: product.dxmScore,
      source: "mobile-card",
      brand: product.vendor,
      title: product.name
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.5) return "text-green-400 bg-green-400/10 border-green-400/30";
    if (score >= 9.0) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    if (score >= 8.5) return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
    if (score >= 8.0) return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    if (score >= 7.5) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  };

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  if (variant === "list") {
    return (
      <div 
        className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-cyan-400/50 transition-all active:scale-[0.98]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Product Image */}
        <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">
              {product.category === 'GPU' ? '🎮' : 
               product.category === 'CPU' ? '🔧' : 
               product.category === 'Laptop' ? '💻' : '📦'}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-white truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{product.vendor}</span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreColor(product.dxmScore)}`}>
              {product.dxmScore.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="text-right">
          <div className="font-bold text-white">${product.price.toLocaleString()}</div>
          {savingsPercent > 0 && (
            <div className="text-xs text-green-400">-{savingsPercent}%</div>
          )}
          <Link
            href={affiliateUrl}
            onClick={handleViewDeal}
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 block"
          >
            View →
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div 
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-400/50 transition-all active:scale-[0.98] relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Featured Badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Featured
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 text-xs font-semibold bg-slate-700/50 text-cyan-400 rounded-md uppercase tracking-wider">
            {product.category}
          </span>
          {savingsPercent > 0 && (
            <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-md">
              {savingsPercent}% OFF
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-white mb-2 leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Specs */}
        <div className="space-y-1 mb-4 text-sm">
          {product.specs.vram && (
            <div className="flex justify-between">
              <span className="text-slate-400">VRAM:</span>
              <span className="text-cyan-300">{product.specs.vram}</span>
            </div>
          )}
          {product.specs.cores && (
            <div className="flex justify-between">
              <span className="text-slate-400">Cores:</span>
              <span className="text-cyan-300">{product.specs.cores}</span>
            </div>
          )}
          {product.specs.memory && (
            <div className="flex justify-between">
              <span className="text-slate-400">Memory:</span>
              <span className="text-cyan-300">{product.specs.memory}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-white">${product.price.toLocaleString()}</div>
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
                {savingsPercent > 0 && (
                  <span className="text-sm text-green-400 font-medium">
                    Save {savingsPercent}%
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* DXM Score */}
          <div className={`px-3 py-2 rounded-lg border ${getScoreColor(product.dxmScore)}`}>
            <div className="text-center">
              <div className="text-xs font-medium opacity-80">DXM</div>
              <div className="text-lg font-bold">{product.dxmScore.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={affiliateUrl}
            onClick={handleViewDeal}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all active:scale-[0.98]"
          >
            View Deal
          </Link>
          {showQuickActions && (
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`px-4 py-3 rounded-lg border transition-all active:scale-[0.98] ${
                isWishlisted 
                  ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                  : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:text-white'
              }`}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default compact variant
  return (
    <div 
      className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 hover:border-cyan-400/50 transition-all active:scale-[0.98] relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-white truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{product.vendor}</span>
            <span className="px-1.5 py-0.5 text-xs bg-slate-700/50 text-cyan-400 rounded uppercase tracking-wider">
              {product.category}
            </span>
          </div>
        </div>
        
        {showQuickActions && (
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-1.5 rounded-md transition-colors ${
              isWishlisted ? 'text-red-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* Price & Score */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-white">${product.price.toLocaleString()}</div>
          {savingsPercent > 0 && (
            <div className="text-xs text-green-400">-{savingsPercent}%</div>
          )}
        </div>
        
        <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getScoreColor(product.dxmScore)}`}>
          DXM {product.dxmScore.toFixed(1)}
        </div>
      </div>

      {/* Quick Specs */}
      {(product.specs.vram || product.specs.cores || product.specs.memory) && (
        <div className="flex gap-2 mb-3 text-xs">
          {product.specs.vram && (
            <span className="px-2 py-1 bg-slate-700/30 rounded text-slate-300">
              {product.specs.vram}
            </span>
          )}
          {product.specs.cores && (
            <span className="px-2 py-1 bg-slate-700/30 rounded text-slate-300">
              {product.specs.cores}
            </span>
          )}
          {product.specs.memory && (
            <span className="px-2 py-1 bg-slate-700/30 rounded text-slate-300">
              {product.specs.memory}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={affiliateUrl}
          onClick={handleViewDeal}
          className="flex-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-center py-2 rounded-md text-sm font-medium hover:bg-cyan-500/30 transition-all active:scale-[0.98]"
        >
          View Deal
        </Link>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-400 rounded-md text-sm hover:text-white transition-colors active:scale-[0.98]"
        >
          ℹ️
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Availability:</span>
            <span className={getAvailabilityColor(product.availability)}>
              {getAvailabilityDisplay(product.availability)}
            </span>
          </div>
          {product.vendor && (
            <div className="flex justify-between">
              <span className="text-slate-400">Vendor:</span>
              <span className="text-slate-300">{product.vendor}</span>
            </div>
          )}
          {product.isPrime && (
            <div className="flex justify-between">
              <span className="text-slate-400">Prime:</span>
              <span className="text-blue-400">✓ Eligible</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile Deal Grid Component
export function MobileDealGrid({ 
  products, 
  variant = "compact",
  columns = 1,
  showQuickActions = true 
}: {
  products: DXMProduct[];
  variant?: "compact" | "featured" | "list";
  columns?: 1 | 2;
  showQuickActions?: boolean;
}) {
  const gridClass = columns === 2 ? "grid-cols-2" : "grid-cols-1";
  const gapClass = variant === "list" ? "gap-2" : "gap-4";

  return (
    <div className={`grid ${gridClass} ${gapClass}`}>
      {products.map((product) => (
        <MobileDealCard 
          key={product.id} 
          product={product} 
          variant={variant}
          showQuickActions={showQuickActions}
        />
      ))}
    </div>
  );
}
