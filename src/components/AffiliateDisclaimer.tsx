// src/components/AffiliateDisclaimer.tsx
// Reusable affiliate disclosure component for product pages

import Link from 'next/link';

interface AffiliateDisclaimerProps {
  /**
   * Display variant
   * - 'full': Complete disclosure for product detail pages
   * - 'compact': Short notice for product cards/grids
   * - 'inline': Single line for tight spaces
   */
  variant?: 'full' | 'compact' | 'inline';
  
  /**
   * Optional additional className
   */
  className?: string;
}

export default function AffiliateDisclaimer({ 
  variant = 'compact',
  className = ''
}: AffiliateDisclaimerProps) {
  
  // Inline variant - single line
  if (variant === 'inline') {
    return (
      <span className={`text-slate-500 text-[10px] ${className}`}>
        Affiliate link • Price may vary
      </span>
    );
  }
  
  // Compact variant - for product cards
  if (variant === 'compact') {
    return (
      <div className={`text-center py-2 ${className}`}>
        <p className="text-slate-500 text-[10px] leading-relaxed">
          As an Amazon Associate, we earn from qualifying purchases.{' '}
          <Link 
            href="/legal/affiliate-disclosure" 
            className="text-cyan-500/70 hover:text-cyan-400 underline"
          >
            Learn more
          </Link>
        </p>
      </div>
    );
  }
  
  // Full variant - for product detail pages
  return (
    <div className={`glass-panel-secondary border border-slate-700/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Info Icon */}
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <span className="text-cyan-400 text-xs font-bold">i</span>
        </div>
        
        <div className="flex-1">
          <h4 className="text-slate-300 text-xs font-semibold mb-1">Affiliate Disclosure</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            DXM369 is a participant in the Amazon Services LLC Associates Program. 
            As an Amazon Associate, we earn from qualifying purchases. Product prices 
            and availability are accurate as of the date/time indicated and are subject 
            to change. Any price and availability information displayed at the time of 
            purchase will apply.
          </p>
          <Link 
            href="/legal/affiliate-disclosure" 
            className="text-cyan-400 text-[10px] hover:text-cyan-300 mt-2 inline-block"
          >
            Read full disclosure →
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone price disclaimer for product cards
 */
export function PriceDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-slate-600 text-[9px] leading-tight ${className}`}>
      Price and availability subject to change. Verify on Amazon before purchase.
    </p>
  );
}

/**
 * Small affiliate badge for product cards
 */
export function AffiliateBadge({ className = '' }: { className?: string }) {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] 
                  bg-amber-500/10 text-amber-400/70 border border-amber-500/20 ${className}`}
      title="This is an affiliate link"
    >
      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      Affiliate
    </span>
  );
}

