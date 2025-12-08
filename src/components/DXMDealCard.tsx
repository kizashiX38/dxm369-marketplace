import Link from "next/link";
import { buildAmazonProductUrl } from "@/lib/affiliate";

export interface DXMProduct {
  id: string;
  asin: string;
  name: string;
  category: "GPU" | "CPU" | "Laptop" | "SSD" | "RAM" | "Motherboard" | "PSU" | "Monitor";
  price: number;
  originalPrice?: number;
  savingsPercent?: number;
  dxmScore: number; // DXM Value Score (0-100)
  vendor: string;
  isPrime?: boolean;
  specs: {
    [key: string]: string;
  };
  imageUrl?: string;
  availability: "in_stock" | "limited" | "out_of_stock";
  lastUpdated: string;
}

interface DXMDealCardProps {
  product: DXMProduct;
  variant?: "compact" | "standard" | "detailed";
  showSpecs?: boolean;
  className?: string;
  source?: string; // Tracking source identifier
  intent?: 'review' | 'top10' | 'browse' | 'comparison' | 'deal'; // User intent
}

export default function DXMDealCard({ 
  product, 
  variant = "standard", 
  showSpecs = true,
  className = "",
  source = "dxm-card",
  intent
}: DXMDealCardProps) {
  // Build context-aware affiliate URL
  const affiliateUrl = buildAmazonProductUrl(product.asin, {
    context: {
      category: product.category.toLowerCase() as any,
      source: source.includes('seo') ? 'seo' : source.includes('social') ? 'social' : undefined,
      intent,
      pageType: intent === 'review' ? 'review' : intent === 'comparison' ? 'comparison' : 'product',
    },
  });
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const savingsPercent = product.savingsPercent || 
    (product.originalPrice ? Math.round((savings / product.originalPrice) * 100) : 0);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400 border-green-400/30";
    if (score >= 80) return "text-cyan-400 border-cyan-400/30";
    if (score >= 70) return "text-yellow-400 border-yellow-400/30";
    return "text-orange-400 border-orange-400/30";
  };

  const getAvailabilityStatus = () => {
    switch (product.availability) {
      case "in_stock":
        return { text: "In Stock", color: "text-green-400", dot: "bg-green-400" };
      case "limited":
        return { text: "Limited", color: "text-yellow-400", dot: "bg-yellow-400" };
      case "out_of_stock":
        return { text: "Out of Stock", color: "text-red-400", dot: "bg-red-400" };
    }
  };

  const status = getAvailabilityStatus();

  if (variant === "compact") {
    return (
      <div className={`glass-panel p-4 hover:border-cyan-400/50 hover:shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all duration-300 holographic-sheen ${className}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate uppercase tracking-wide">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-mono">{product.vendor}</span>
              {product.isPrime && (
                <span className="text-[8px] font-mono uppercase tracking-wider glass-panel-secondary px-1 py-0.5 text-blue-400 border-blue-400/30">
                  Prime
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white font-mono">${product.price}</div>
            {savingsPercent > 0 && (
              <div className="text-xs text-green-400 font-mono">-{savingsPercent}%</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`glass-panel-secondary px-2 py-1 ${getScoreColor(product.dxmScore)}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider">
              DXM {product.dxmScore}
            </span>
          </div>
          <Link
            href={affiliateUrl}
            className="text-xs font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-panel p-6 hover:border-cyan-400/50 hover:shadow-[0_0_20px_-8px_rgba(6,182,212,0.3)] hover:scale-[1.015] transition-all duration-300 holographic-sheen glass-corner-accent clip-corner-br ${className}`}>
      {/* Header with Category Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-xs font-semibold glass-panel-secondary text-cyan-400 border-cyan-400/30 font-mono uppercase tracking-wider">
            {product.category}
          </span>
          {product.isPrime && (
            <span className="px-2 py-1 text-xs font-semibold glass-panel-secondary text-blue-400 border-blue-400/30 font-mono uppercase tracking-wider">
              Prime
            </span>
          )}
        </div>
        
        {/* Availability Status */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 ${status.dot} animate-neon-pulse`} />
          <span className={`text-xs font-mono ${status.color}`}>{status.text}</span>
        </div>
      </div>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-white mb-3 uppercase tracking-wide leading-tight">
        {product.name}
      </h3>

      {/* Pricing Section */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-white font-mono">${product.price}</div>
          {product.originalPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 line-through font-mono">
                ${product.originalPrice}
              </span>
              <span className="text-sm text-green-400 font-mono font-bold">
                Save {savingsPercent}%
              </span>
            </div>
          )}
        </div>
        
        {/* DXM Score */}
        <div className={`glass-panel-secondary px-3 py-2 ${getScoreColor(product.dxmScore)} animate-hologram-flicker`}>
          <div className="text-center">
            <div className="text-xs font-mono uppercase tracking-wider opacity-80">DXM Score</div>
            <div className="text-xl font-bold font-mono">{product.dxmScore}</div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {showSpecs && Object.keys(product.specs).length > 0 && (
        <div className="space-y-2 mb-4">
          {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center glass-panel-secondary px-3 py-1.5 text-sm">
              <span className="text-slate-500 uppercase tracking-wider font-mono">{key}:</span>
              <span className="text-cyan-300 font-mono">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Vendor:</span>
          <span className="text-sm text-white font-mono">{product.vendor}</span>
        </div>
        <div className="text-xs text-slate-600 font-mono">
          Updated: {new Date(product.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-3 glass-panel hover:border-cyan-400/60 hover:bg-white/10 text-cyan-300 hover:text-white transition-all text-sm font-medium font-mono uppercase tracking-wider holographic-sheen"
      >
        View Deal on {product.vendor} →
      </Link>
    </div>
  );
}

// Grid Layout Component for Deal Cards
export function DXMDealGrid({ 
  products, 
  variant = "standard",
  columns = 3,
  className = "" 
}: {
  products: DXMProduct[];
  variant?: "compact" | "standard" | "detailed";
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {products.map((product) => (
        <DXMDealCard 
          key={product.id} 
          product={product} 
          variant={variant}
        />
      ))}
    </div>
  );
}
