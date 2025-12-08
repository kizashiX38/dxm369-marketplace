import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="glass-panel-secondary p-3 mb-4 holographic-sheen">
      <div className="flex items-center gap-2 text-sm font-mono">
        <Link 
          href="/" 
          className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
        >
          Home
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            
            {item.href ? (
              <Link 
                href={item.href}
                className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white uppercase tracking-wider font-bold">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
