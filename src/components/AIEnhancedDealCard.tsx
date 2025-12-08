// src/components/AIEnhancedDealCard.tsx
// AI-Enhanced Deal Card with DXM Intelligence
// Displays products with AI-generated summaries and insights

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buildAmazonProductUrl } from "@/lib/affiliate";
import { DXMProduct, getAvailabilityDisplay } from "@/lib/types/product";
import { AIProductSummary } from "@/lib/types/ai";
import { trackAffiliateClick } from "@/lib/tracking";
import { DXMProductImage } from "@/components/DXMProductImage";

interface AIEnhancedDealCardProps {
  product: DXMProduct;
  variant?: "compact" | "standard" | "detailed" | "ai-enhanced";
  showAISummary?: boolean;
  className?: string;
  source?: string; // Tracking source identifier
  intent?: 'review' | 'top10' | 'browse' | 'comparison' | 'deal'; // User intent
}

export default function AIEnhancedDealCard({ 
  product, 
  variant = "ai-enhanced", 
  showAISummary = true,
  className = "",
  source = "ai-enhanced-card",
  intent
}: AIEnhancedDealCardProps) {
  // Build context-aware affiliate URL
  const affiliateUrl = buildAmazonProductUrl(product.asin, {
    context: {
      category: product.category.toLowerCase() as any,
      source: source.includes('seo') ? 'seo' : source.includes('social') ? 'social' : undefined,
      intent: intent || (variant === 'detailed' ? 'review' : undefined),
      pageType: intent === 'review' ? 'review' : intent === 'comparison' ? 'comparison' : 'product',
    },
  });
  const [aiSummary, setAiSummary] = useState<AIProductSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const savingsPercent = product.savingsPercent || 0;

  // Fetch AI summary
  useEffect(() => {
    if (showAISummary && variant === "ai-enhanced") {
      fetchAISummary();
    }
  }, [product.asin, showAISummary, variant]);

  const fetchAISummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`/api/ai-summary?asin=${product.asin}`);
      const data = await response.json();
      
      if (data.success) {
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch AI summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleViewDeal = () => {
    trackAffiliateClick({
      asin: product.asin,
      category: product.category.toLowerCase() as any,
      price: product.price,
      dxmScore: product.dxmScore,
      source: "ai-enhanced-card",
      brand: product.vendor,
      title: product.name
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.5) return "text-green-400 border-green-400/30 bg-green-400/5";
    if (score >= 9.0) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/5";
    if (score >= 8.5) return "text-cyan-400 border-cyan-400/30 bg-cyan-400/5";
    if (score >= 8.0) return "text-blue-400 border-blue-400/30 bg-blue-400/5";
    if (score >= 7.5) return "text-yellow-400 border-yellow-400/30 bg-yellow-400/5";
    return "text-orange-400 border-orange-400/30 bg-orange-400/5";
  };

  const getMarketPositionBadge = (position: string) => {
    const badges = {
      flagship: { color: "text-purple-400 border-purple-400/30 bg-purple-400/5", icon: "👑" },
      premium: { color: "text-blue-400 border-blue-400/30 bg-blue-400/5", icon: "💎" },
      "mid-range": { color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5", icon: "⚡" },
      budget: { color: "text-green-400 border-green-400/30 bg-green-400/5", icon: "💰" }
    };
    return badges[position as keyof typeof badges] || badges.budget;
  };

  const getFutureProofingColor = (rating: string) => {
    const colors = {
      excellent: "text-green-400",
      good: "text-cyan-400", 
      fair: "text-yellow-400",
      limited: "text-orange-400"
    };
    return colors[rating as keyof typeof colors] || colors.fair;
  };

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
              {aiSummary && (
                <span className={`text-[8px] font-mono uppercase tracking-wider glass-panel-secondary px-1 py-0.5 ${getMarketPositionBadge(aiSummary.marketPosition).color}`}>
                  {getMarketPositionBadge(aiSummary.marketPosition).icon} {aiSummary.marketPosition}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white font-mono">${product.price.toLocaleString()}</div>
            {savingsPercent > 0 && (
              <div className="text-xs text-green-400 font-mono">-{savingsPercent}%</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`glass-panel-secondary px-2 py-1 ${getScoreColor(product.dxmScore)}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider">
              DXM {product.dxmScore.toFixed(1)}
            </span>
          </div>
          <Link
            href={affiliateUrl}
            onClick={handleViewDeal}
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
      {/* Header with Category and Market Position */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-xs font-semibold glass-panel-secondary text-cyan-400 border-cyan-400/30 font-mono uppercase tracking-wider">
            {product.category}
          </span>
          {aiSummary && (
            <span className={`px-2 py-1 text-xs font-semibold glass-panel-secondary font-mono uppercase tracking-wider ${getMarketPositionBadge(aiSummary.marketPosition).color}`}>
              {getMarketPositionBadge(aiSummary.marketPosition).icon} {aiSummary.marketPosition}
            </span>
          )}
        </div>
        
        {/* AI Confidence Badge */}
        {aiSummary && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">AI Confidence:</span>
            <span className={`text-xs font-mono ${aiSummary.confidence >= 90 ? 'text-green-400' : aiSummary.confidence >= 80 ? 'text-cyan-400' : 'text-yellow-400'}`}>
              {aiSummary.confidence}%
            </span>
          </div>
        )}
      </div>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-white mb-3 uppercase tracking-wide leading-tight">
        {product.name}
      </h3>

      {/* Product Image - DXM Enhanced */}
      <div className="relative h-48 mb-4 bg-slate-900/30 rounded-lg overflow-hidden border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors">
        <DXMProductImage
          product={{
            brand: product.vendor,
            title: product.name,
            category: product.category.toLowerCase(),
            imageUrl: product.imageUrl
          }}
          className="w-full h-full"
          width={400}
          height={192}
        />
      </div>

      {/* AI Summary Section */}
      {showAISummary && variant === "ai-enhanced" && (
        <div className="mb-4 glass-panel-secondary p-4 rounded-lg border border-cyan-500/20">
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
              <span className="text-sm font-mono">Generating AI analysis...</span>
            </div>
          ) : aiSummary ? (
            <div className="space-y-3">
              {/* AI Summary Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wider">
                  🤖 DXM AI Analysis
                </h4>
                <button
                  onClick={() => setShowFullSummary(!showFullSummary)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono"
                >
                  {showFullSummary ? "Show Less" : "Show More"}
                </button>
              </div>

              {/* Intelligent Summary */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {aiSummary.intelligentSummary}
              </p>

              {/* Key Insights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-mono uppercase tracking-wider">Best For:</span>
                  <div className="mt-1 space-y-1">
                    {aiSummary.bestFor.slice(0, 2).map((item, index) => (
                      <div key={index} className="text-cyan-300 font-mono">• {item}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase tracking-wider">Future-Proofing:</span>
                  <div className={`mt-1 font-mono capitalize ${getFutureProofingColor(aiSummary.futureProofing)}`}>
                    {aiSummary.futureProofing}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {showFullSummary && (
                <div className="space-y-3 pt-3 border-t border-slate-600/30">
                  {/* DXM Analysis */}
                  <div>
                    <h5 className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider mb-1">
                      DXM Score Analysis
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {aiSummary.dxmAnalysis}
                    </p>
                  </div>

                  {/* Key Strengths */}
                  <div>
                    <h5 className="text-xs font-semibold text-green-400 font-mono uppercase tracking-wider mb-1">
                      Key Strengths
                    </h5>
                    <div className="space-y-1">
                      {aiSummary.keyStrengths.map((strength, index) => (
                        <div key={index} className="text-xs text-green-300 font-mono">✓ {strength}</div>
                      ))}
                    </div>
                  </div>

                  {/* Potential Weaknesses */}
                  {aiSummary.potentialWeaknesses.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-orange-400 font-mono uppercase tracking-wider mb-1">
                        Considerations
                      </h5>
                      <div className="space-y-1">
                        {aiSummary.potentialWeaknesses.map((weakness, index) => (
                          <div key={index} className="text-xs text-orange-300 font-mono">⚠ {weakness}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono">AI analysis unavailable</div>
          )}
        </div>
      )}

      {/* Pricing Section */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-white font-mono">${product.price.toLocaleString()}</div>
          {product.originalPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 line-through font-mono">
                ${product.originalPrice.toLocaleString()}
              </span>
              {savingsPercent > 0 && (
                <span className="text-sm text-green-400 font-mono font-bold">
                  Save {savingsPercent}%
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced DXM Score */}
        <div className={`glass-panel-secondary px-3 py-2 ${getScoreColor(product.dxmScore)} animate-hologram-flicker`}>
          <div className="text-center">
            <div className="text-xs font-mono uppercase tracking-wider opacity-80">DXM Score</div>
            <div className="text-xl font-bold font-mono">{product.dxmScore.toFixed(1)}</div>
            {aiSummary && (
              <div className="text-[8px] font-mono opacity-60 mt-1">
                AI Verified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-2 mb-4">
        {product.specs.vram && (
          <div className="flex justify-between items-center glass-panel-secondary px-3 py-1.5 text-sm">
            <span className="text-slate-500 uppercase tracking-wider font-mono">VRAM:</span>
            <span className="text-cyan-300 font-mono">{product.specs.vram}</span>
          </div>
        )}
        {product.specs.cores && (
          <div className="flex justify-between items-center glass-panel-secondary px-3 py-1.5 text-sm">
            <span className="text-slate-500 uppercase tracking-wider font-mono">Cores:</span>
            <span className="text-cyan-300 font-mono">{product.specs.cores}</span>
          </div>
        )}
        {product.specs.memory && (
          <div className="flex justify-between items-center glass-panel-secondary px-3 py-1.5 text-sm">
            <span className="text-slate-500 uppercase tracking-wider font-mono">Memory:</span>
            <span className="text-cyan-300 font-mono">{product.specs.memory}</span>
          </div>
        )}
      </div>

      {/* Vendor Info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Vendor:</span>
          <span className="text-sm text-white font-mono">{product.vendor}</span>
        </div>
        {aiSummary && (
          <div className="text-xs text-slate-600 font-mono">
            AI Analysis: v{aiSummary.analysisVersion}
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        href={affiliateUrl}
        onClick={handleViewDeal}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-3 glass-panel hover:border-cyan-400/60 hover:bg-white/10 text-cyan-300 hover:text-white transition-all text-sm font-medium font-mono uppercase tracking-wider holographic-sheen"
      >
        🤖 AI-Verified Deal • View on Amazon →
      </Link>
    </div>
  );
}
