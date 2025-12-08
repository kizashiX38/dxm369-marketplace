// src/app/legal/layout.tsx
// Shared layout for legal pages

import Link from 'next/link';

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="glass-panel-secondary border-b border-cyan-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link 
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm flex items-center gap-2"
          >
            <span className="text-lg">&larr;</span>
            Back to DXM369
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <article className="glass-panel p-8 border border-cyan-500/20 rounded-lg">
          {children}
        </article>
        
        {/* Legal Navigation */}
        <nav className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-4">
            Legal Documents
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link 
              href="/legal/privacy" 
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/legal/terms" 
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/legal/affiliate-disclosure" 
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Affiliate Disclosure
            </Link>
            <Link 
              href="/legal/cookies" 
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}

