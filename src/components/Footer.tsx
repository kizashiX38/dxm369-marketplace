// src/components/Footer.tsx
// DXM369 Footer with Amazon Associates compliance and legal links

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="glass-panel-secondary border-t border-cyan-500/20">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-60" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand & Description */}
          <div>
            <div className="font-mono font-bold text-cyan-400 text-lg mb-2">DXM369</div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Deal radar for GPUs, CPUs, and PC hardware. We analyze prices and calculate 
              value scores to help you find the best deals.
            </p>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="font-mono text-slate-400 text-xs uppercase tracking-wider mb-3">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/legal/privacy" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/affiliate-disclosure" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                Affiliate Disclosure
              </Link>
              <Link href="/legal/cookies" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                Cookie Policy
              </Link>
            </nav>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-slate-400 text-xs uppercase tracking-wider mb-3">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/gpus" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                GPU Deals
              </Link>
              <Link href="/cpus" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                CPU Deals
              </Link>
              <Link href="/laptops" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                Laptop Deals
              </Link>
              <Link href="/deals" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                All Deals
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Amazon Associates Disclosure */}
        <div className="border-t border-slate-800 pt-4 mb-4">
          <p className="text-slate-600 text-[10px] leading-relaxed text-center">
            <strong className="text-slate-500">Amazon Associates Disclosure:</strong>{' '}
            As an Amazon Associate, we earn from qualifying purchases. Product prices and availability 
            are accurate as of the date/time indicated and are subject to change. Any price and availability 
            information displayed on Amazon at the time of purchase will apply.
          </p>
        </div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 border-t border-slate-800/50 pt-4">
          <span className="font-mono">© {currentYear} DXM369. All rights reserved.</span>
          <span className="text-slate-600 font-mono">
            Prices may change. Verify on retailer&apos;s site before purchase.
          </span>
        </div>
      </div>
    </footer>
  );
}
