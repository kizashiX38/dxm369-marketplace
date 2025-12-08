import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel-secondary shadow-[0_1px_20px_-5px_rgba(6,182,212,0.2)] holographic-sheen">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-90" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-cyan-500/8 via-transparent to-cyan-500/4 opacity-60" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 relative">
        <nav className="flex items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-sm glass-panel text-cyan-300 font-bold animate-neon-pulse overflow-hidden glass-corner-accent">
              D
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-sm font-bold text-white tracking-[0.12em] uppercase">
                DXM369
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-500/80 group-hover:text-cyan-400 transition-colors">
                Gear Nexus
              </span>
            </div>
          </Link>

          {/* Header Actions - Search, Account, etc. */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <SearchBar />
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 glass-panel-secondary px-3 py-2">
              <div className="h-1.5 w-1.5 bg-cyan-400 animate-neon-pulse shadow-[0_0_8px_cyan]" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400">
                Live
              </span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

