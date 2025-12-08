// src/components/ProductEnhancements.tsx
// Product Page UX Enhancements
// Auto-disclaimers, offer badges, price delta visuals, DXM Score integration

"use client";

interface ProductEnhancementsProps {
  product: {
    name: string;
    price: number;
    originalPrice?: number;
    dxmScore?: number;
    category: string;
    asin?: string;
  };
  showDisclaimer?: boolean;
  showBadges?: boolean;
  showPriceDelta?: boolean;
}

export default function ProductEnhancements({
  product,
  showDisclaimer = true,
  showBadges = true,
  showPriceDelta = true,
}: ProductEnhancementsProps) {
  const discountPercent = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const priceDelta = product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  return (
    <div className="space-y-4">
      {/* Offer Badges */}
      {showBadges && (
        <div className="flex flex-wrap gap-2">
          {discountPercent > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm font-semibold">
              🔥 {discountPercent}% OFF
            </span>
          )}
          {product.dxmScore && product.dxmScore >= 8.5 && (
            <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-semibold">
              ⭐ Top Value
            </span>
          )}
          {product.dxmScore && product.dxmScore >= 9.0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg text-purple-400 text-sm font-semibold">
              💎 Premium Pick
            </span>
          )}
        </div>
      )}

      {/* Price Delta Visual */}
      {showPriceDelta && product.originalPrice && priceDelta > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">You Save</div>
              <div className="text-2xl font-bold text-green-400">
                ${priceDelta.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </div>
              <div className="text-lg font-bold text-white">
                ${product.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DXM Score Integration */}
      {product.dxmScore !== undefined && (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-cyan-400 mb-1 font-semibold">DXM Value Score</div>
              <div className="text-xs text-slate-400">
                Performance • Deal Quality • Trust • Efficiency
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400">
                {product.dxmScore.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">/ 10.0</div>
            </div>
          </div>
          {/* Score Bar */}
          <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(product.dxmScore / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Auto-Disclaimer */}
      {showDisclaimer && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">ℹ️</span>
            <div>
              <strong className="text-slate-300">Affiliate Disclosure:</strong> This page contains
              affiliate links. We may earn a commission if you make a purchase through these links,
              at no additional cost to you. Prices and availability are subject to change.
              <a
                href="/legal/affiliate-disclosure"
                className="text-cyan-400 hover:text-cyan-300 ml-1 underline"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

