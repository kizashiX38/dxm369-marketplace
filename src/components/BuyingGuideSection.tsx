// src/components/BuyingGuideSection.tsx
// Reusable buying guide component for category pages

import { BuyingGuideConfig } from '@/lib/buyingGuideGenerator';

interface BuyingGuideSectionProps {
  guide: BuyingGuideConfig;
}

export function BuyingGuideSection({ guide }: BuyingGuideSectionProps) {
  return (
    <div className="buying-guide-section">
      {/* Introduction */}
      <div className="glass-panel-cyber rounded-xl p-8 mb-8 border border-cyan-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
          <h2 className="cyber-title text-2xl text-white">
            {guide.categoryDisplayName} Buying Guide
          </h2>
        </div>
        <p className="text-slate-300 font-mono text-base leading-relaxed">
          {guide.introduction}
        </p>
      </div>

      {/* Key Considerations */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
          <h3 className="cyber-title text-xl text-white">Key Considerations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guide.keyConsiderations.map((consideration, idx) => (
            <div key={idx} className="glass-panel rounded-lg p-6 border border-slate-700/50">
              <h4 className="text-cyan-300 font-bold mb-2 text-lg">{consideration.title}</h4>
              <p className="text-slate-300 text-sm mb-3">{consideration.description}</p>
              <div className="bg-slate-900/50 border-l-2 border-cyan-400/50 pl-4 py-2">
                <span className="text-slate-400 text-xs font-mono uppercase tracking-wide">PRO TIP: </span>
                <span className="text-slate-200 text-sm">{consideration.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Tiers */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
          <h3 className="cyber-title text-xl text-white">Budget Tiers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {guide.budgetTiers.map((tier, idx) => (
            <div key={idx} className="glass-panel rounded-lg p-4 border border-slate-700/50 hover:border-cyan-400/30 transition">
              <h4 className="text-white font-bold mb-1">{tier.name}</h4>
              <p className="text-cyan-300 text-sm font-mono mb-2">{tier.priceRange}</p>
              <p className="text-slate-400 text-xs mb-3">{tier.useCase}</p>
              <ul className="space-y-1">
                {tier.expectations.map((exp, i) => (
                  <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">→</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-orange-400 rounded-full" />
          <h3 className="cyber-title text-xl text-white">Avoid These Mistakes</h3>
        </div>
        <div className="glass-panel rounded-lg p-6 border border-orange-400/20">
          <ul className="space-y-3">
            {guide.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300">
                <span className="text-orange-400 font-bold text-lg mt-0.5">×</span>
                <span className="text-sm">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <h3 className="cyber-title text-xl text-white">Best Practices</h3>
        </div>
        <div className="glass-panel rounded-lg p-6 border border-green-400/20">
          <ul className="space-y-3">
            {guide.bestPractices.map((practice, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300">
                <span className="text-green-400 font-bold text-lg mt-0.5">✓</span>
                <span className="text-sm">{practice}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Guides */}
      {guide.relatedGuides && guide.relatedGuides.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <h3 className="cyber-title text-xl text-white">Related Guides</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.relatedGuides.map((relatedGuide, idx) => (
              <a
                key={idx}
                href={relatedGuide.url}
                className="glass-panel rounded-lg p-4 border border-purple-400/30 hover:border-purple-400/60 hover:bg-purple-400/5 transition"
              >
                <h4 className="text-purple-300 font-bold text-sm mb-2">{relatedGuide.title}</h4>
                <p className="text-slate-400 text-xs">→ Read guide</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
