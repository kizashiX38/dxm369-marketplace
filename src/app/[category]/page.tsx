// DXM369 Dynamic Category Page - Hardware Intelligence Terminal
// Unified category routing with coming soon fallback

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DXMProductResponse } from "@/types/api";
import { CyberDealCard } from "@/components/CyberDealCard";
import { appConfig } from "@/lib/env";

// ISR: Revalidate every hour for fresh deals while maintaining CDN caching
export const revalidate = 3600;

// Category configuration - maps URL slugs to display info and API endpoints
const CATEGORY_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  apiEndpoint: string | null; // null = coming soon
  accentColor: string;
  dbCategory?: string;
}> = {
  // Existing categories with API endpoints
  gpus: {
    title: "GRAPHICS PROCESSING UNITS",
    subtitle: "HARDWARE INTELLIGENCE TERMINAL / TACTICAL EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/gpus",
    accentColor: "cyan",
  },
  cpus: {
    title: "CENTRAL PROCESSING UNITS",
    subtitle: "HARDWARE INTELLIGENCE TERMINAL / TACTICAL EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/cpus",
    accentColor: "amber",
  },
  laptops: {
    title: "PORTABLE COMPUTING UNITS",
    subtitle: "HARDWARE INTELLIGENCE TERMINAL / MOBILE EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/laptops",
    accentColor: "purple",
  },
  monitors: {
    title: "DISPLAY SYSTEMS",
    subtitle: "HARDWARE INTELLIGENCE TERMINAL / VISUAL EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/monitors",
    accentColor: "green",
  },
  // Coming soon categories (sidebar links)
  keyboards: {
    title: "GAMING KEYBOARDS",
    subtitle: "MECHANICAL WARFARE DIVISION / TACTILE RESPONSE MATRIX",
    apiEndpoint: null,
    accentColor: "pink",
  },
  mice: {
    title: "GAMING MICE",
    subtitle: "PRECISION TARGETING DIVISION / SENSOR EVALUATION MATRIX",
    apiEndpoint: null,
    accentColor: "orange",
  },
  headsets: {
    title: "GAMING HEADSETS",
    subtitle: "AUDIO INTELLIGENCE DIVISION / ACOUSTIC EVALUATION MATRIX",
    apiEndpoint: null,
    accentColor: "violet",
  },
  drops: {
    title: "PRICE DROPS",
    subtitle: "DEAL INTELLIGENCE DIVISION / SAVINGS DETECTION MATRIX",
    apiEndpoint: null,
    accentColor: "red",
  },
  new: {
    title: "NEW ARRIVALS",
    subtitle: "FRESH INTEL DIVISION / LATEST HARDWARE ACQUISITIONS",
    apiEndpoint: null,
    accentColor: "emerald",
  },
  bestsellers: {
    title: "BEST SELLERS",
    subtitle: "TOP PERFORMER DIVISION / COMMUNITY CHOICE MATRIX",
    apiEndpoint: null,
    accentColor: "yellow",
  },
  // Additional sidebar categories
  webcams: {
    title: "WEBCAMS",
    subtitle: "VISUAL COMMUNICATION DIVISION / STREAMING MATRIX",
    apiEndpoint: null,
    accentColor: "cyan",
  },
  speakers: {
    title: "SPEAKERS",
    subtitle: "AUDIO OUTPUT DIVISION / SOUND PROJECTION MATRIX",
    apiEndpoint: null,
    accentColor: "purple",
  },
  "gaming-laptops": {
    title: "GAMING LAPTOPS",
    subtitle: "PORTABLE WARFARE DIVISION / MOBILE GAMING MATRIX",
    apiEndpoint: "/api/dxm/products/laptops",
    accentColor: "purple",
  },
  storage: {
    title: "STORAGE SYSTEMS",
    subtitle: "DATA INFRASTRUCTURE DIVISION / SSD EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/marketplace/storage",
    accentColor: "blue",
  },
  memory: {
    title: "MEMORY MODULES",
    subtitle: "RAM INTELLIGENCE DIVISION / BANDWIDTH EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/marketplace/memory",
    accentColor: "indigo",
  },
  "gaming-mice": {
    title: "GAMING MICE",
    subtitle: "PRECISION TARGETING DIVISION / SENSOR EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/marketplace/gaming-mice",
    accentColor: "orange",
  },
  cooling: {
    title: "PC COOLING SYSTEMS",
    subtitle: "THERMAL MANAGEMENT DIVISION / TEMPERATURE MATRIX",
    apiEndpoint: "/api/dxm/products/marketplace/cooling",
    accentColor: "sky",
  },
  motherboards: {
    title: "MOTHERBOARDS",
    subtitle: "CORE ARCHITECTURE DIVISION / SYSTEM FOUNDATION MATRIX",
    apiEndpoint: "/api/dxm/products/marketplace/motherboards",
    accentColor: "lime",
  },
  psu: {
    title: "POWER SUPPLIES",
    subtitle: "POWER DISTRIBUTION DIVISION / EFFICIENCY EVALUATION MATRIX",
    apiEndpoint: "/api/dxm/products/marketplace/psu",
    accentColor: "yellow",
  },
  prebuilt: {
    title: "PRE-BUILT PCS",
    subtitle: "READY-TO-DEPLOY DIVISION / COMPLETE SYSTEMS MATRIX",
    apiEndpoint: null,
    accentColor: "cyan",
  },
  chairs: {
    title: "GAMING CHAIRS",
    subtitle: "ERGONOMIC WARFARE DIVISION / COMFORT MATRIX",
    apiEndpoint: null,
    accentColor: "orange",
  },
  streaming: {
    title: "STREAMING GEAR",
    subtitle: "BROADCAST DIVISION / CONTENT CREATION MATRIX",
    apiEndpoint: null,
    accentColor: "violet",
  },
};

// Valid category slugs for routing
const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG);

// Generate static params for ISR/SSG discovery
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category.toLowerCase();
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return {
      title: "Category Not Found | DXM369",
    };
  }

  const siteUrl = appConfig.siteUrl;
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${displayName} Deals | DXM369 Hardware Intelligence`;
  const description = `Browse curated ${category} hardware picks from DXM369 Marketplace. DXM Value Scoring for tactical procurement decisions.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${category}`,
      siteName: 'DXM369',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category.toLowerCase();
  const config = CATEGORY_CONFIG[category];

  // Unknown category = 404
  if (!config) {
    notFound();
  }

  // Coming soon categories (no API endpoint)
  if (!config.apiEndpoint) {
    return <ComingSoonPage category={category} config={config} />;
  }

  // Fetch products from API
  try {
    const baseUrl = appConfig.baseUrl;
    const response = await fetch(`${baseUrl}${config.apiEndpoint}`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} products: ${response.statusText}`);
    }

    const deals: DXMProductResponse = await response.json();

    if (!deals || deals.length === 0) {
      return <ComingSoonPage category={category} config={config} isEmpty />;
    }

    return <CategoryGrid category={category} config={config} deals={deals} />;
  } catch (error) {
    console.error(`[CATEGORY_PAGE] Error fetching ${category}:`, error);
    return <ErrorPage category={category} error={error} />;
  }
}

// Category grid component
function CategoryGrid({
  category,
  config,
  deals
}: {
  category: string;
  config: typeof CATEGORY_CONFIG[string];
  deals: DXMProductResponse;
}) {
  const accentClasses = getAccentClasses(config.accentColor);

  return (
    <div className="min-h-screen bg-slate-950 tactical-grid">
      {/* Command Header */}
      <div className={`command-panel border-b ${accentClasses.border} p-6 mb-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="status-online">
              <div className={`status-ping ${accentClasses.bg} ${accentClasses.shadow}`} />
              <span className={`cyber-subtitle ${accentClasses.text}`}>
                {category.toUpperCase()} MATRIX: ONLINE
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">SIGNAL ENGINE:</span>
              <span className="text-green-300">ACTIVE</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-400">UNITS TRACKED:</span>
              <span className={accentClasses.text}>{deals.length}</span>
            </div>
          </div>

          {/* Mission Brief */}
          <div className="hologram-sheen">
            <h1 className="cyber-title text-4xl text-white mb-2">
              {config.title.split(' ').slice(0, -1).join(' ')}{' '}
              <span className={`${accentClasses.text} ${accentClasses.glow}`}>
                {config.title.split(' ').slice(-1)[0]}
              </span>
            </h1>
            <p className={`cyber-subtitle text-lg mb-4 ${accentClasses.textMuted}`}>
              {config.subtitle}
            </p>
            <div className={`energy-beam ${accentClasses.gradient} mb-4`} />
            <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-4xl">
              Advanced hardware reconnaissance data aggregated from multiple intelligence sources.
              <br />
              <span className={accentClasses.text}>DXM Value Scoring</span> provides quantitative analysis for tactical hardware procurement decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Tactical Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-2 h-2 ${accentClasses.bg} rounded-full ${accentClasses.shadow}`} />
            <h2 className="cyber-title text-xl text-white">
              TACTICAL HARDWARE MATRIX
            </h2>
            <div className={`flex-1 h-px ${accentClasses.gradient}`} />
            <span className={`cyber-subtitle ${accentClasses.text}`}>
              {deals.length} UNITS ANALYZED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {deals.map((deal) => (
              <CyberDealCard
                key={deal.id}
                deal={deal}
                source={`${category}-command-console`}
              />
            ))}
          </div>
        </div>

        {/* Mission Status */}
        <div className={`mission-panel rounded-xl p-6 mb-8 ${accentClasses.borderLight} ${accentClasses.bgLight}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="cyber-title text-lg text-white mb-2">
                MISSION STATUS: {category.toUpperCase()} RECONNAISSANCE
              </h3>
              <p className={`cyber-subtitle ${accentClasses.textMuted}`}>
                Intelligence gathering complete. All units evaluated and classified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Coming soon component
function ComingSoonPage({
  category,
  config,
  isEmpty = false
}: {
  category: string;
  config: typeof CATEGORY_CONFIG[string];
  isEmpty?: boolean;
}) {
  const accentClasses = getAccentClasses(config.accentColor);

  return (
    <div className="min-h-screen bg-slate-950 tactical-grid flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className={`glass-panel-premium rounded-2xl p-12 ${accentClasses.borderLight}`}>
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-3 h-3 ${accentClasses.bg} rounded-full animate-pulse ${accentClasses.shadow}`} />
            <span className={`cyber-subtitle ${accentClasses.text}`}>
              {isEmpty ? 'AWAITING DATA' : 'COMING SOON'}
            </span>
          </div>

          {/* Title */}
          <h1 className="cyber-title text-3xl text-white mb-4">
            {config.title}
          </h1>

          <p className={`cyber-subtitle mb-6 ${accentClasses.textMuted}`}>
            {config.subtitle}
          </p>

          <div className={`energy-beam ${accentClasses.gradient} mb-8`} />

          <p className="text-slate-300 font-mono text-sm leading-relaxed mb-8">
            {isEmpty
              ? "Our intelligence network is currently gathering data for this category. Check back soon for curated hardware recommendations."
              : "This category is being calibrated. We're wiring up real Amazon data and DXM Value Scoring for tactical hardware procurement."}
          </p>

          {/* Return link */}
          <a
            href="/"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${accentClasses.bgLight} ${accentClasses.borderLight} ${accentClasses.text} hover:opacity-80 transition-opacity font-mono text-sm`}
          >
            <span>RETURN TO COMMAND CENTER</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Error component
function ErrorPage({ category, error }: { category: string; error: unknown }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="glass-panel-premium rounded-xl p-8 max-w-md border-red-500/30">
        <h1 className="cyber-title text-xl text-red-400 mb-4">SYSTEM ERROR</h1>
        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap mb-4">
          Failed to load {category} data
        </pre>
        <div className="energy-beam mt-4 bg-red-500/50" />
        <p className="cyber-subtitle mt-4 text-red-400">
          ATTEMPTING SYSTEM RECOVERY...
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-4 py-2 rounded bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors font-mono text-sm"
        >
          RETURN TO COMMAND CENTER
        </a>
      </div>
    </div>
  );
}

// Helper: accent color classes
function getAccentClasses(color: string) {
  const colorMap: Record<string, {
    text: string;
    textMuted: string;
    bg: string;
    bgLight: string;
    border: string;
    borderLight: string;
    shadow: string;
    glow: string;
    gradient: string;
  }> = {
    cyan: {
      text: "text-cyan-400",
      textMuted: "text-cyan-400/80",
      bg: "bg-cyan-400",
      bgLight: "bg-cyan-500/10",
      border: "border-cyan-400/20",
      borderLight: "border-cyan-500/20",
      shadow: "shadow-[0_0_12px_rgba(34,211,238,0.5)]",
      glow: "glow-cyan",
      gradient: "bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent",
    },
    amber: {
      text: "text-amber-400",
      textMuted: "text-amber-400/80",
      bg: "bg-amber-400",
      bgLight: "bg-amber-500/10",
      border: "border-amber-400/20",
      borderLight: "border-amber-500/20",
      shadow: "shadow-[0_0_12px_rgba(251,191,36,0.5)]",
      glow: "glow-amber",
      gradient: "bg-gradient-to-r from-transparent via-amber-500/50 to-transparent",
    },
    purple: {
      text: "text-purple-400",
      textMuted: "text-purple-400/80",
      bg: "bg-purple-400",
      bgLight: "bg-purple-500/10",
      border: "border-purple-400/20",
      borderLight: "border-purple-500/20",
      shadow: "shadow-[0_0_12px_rgba(192,132,252,0.5)]",
      glow: "glow-purple",
      gradient: "bg-gradient-to-r from-transparent via-purple-500/50 to-transparent",
    },
    green: {
      text: "text-green-400",
      textMuted: "text-green-400/80",
      bg: "bg-green-400",
      bgLight: "bg-green-500/10",
      border: "border-green-400/20",
      borderLight: "border-green-500/20",
      shadow: "shadow-[0_0_12px_rgba(74,222,128,0.5)]",
      glow: "glow-green",
      gradient: "bg-gradient-to-r from-transparent via-green-500/50 to-transparent",
    },
    pink: {
      text: "text-pink-400",
      textMuted: "text-pink-400/80",
      bg: "bg-pink-400",
      bgLight: "bg-pink-500/10",
      border: "border-pink-400/20",
      borderLight: "border-pink-500/20",
      shadow: "shadow-[0_0_12px_rgba(244,114,182,0.5)]",
      glow: "glow-pink",
      gradient: "bg-gradient-to-r from-transparent via-pink-500/50 to-transparent",
    },
    orange: {
      text: "text-orange-400",
      textMuted: "text-orange-400/80",
      bg: "bg-orange-400",
      bgLight: "bg-orange-500/10",
      border: "border-orange-400/20",
      borderLight: "border-orange-500/20",
      shadow: "shadow-[0_0_12px_rgba(251,146,60,0.5)]",
      glow: "glow-orange",
      gradient: "bg-gradient-to-r from-transparent via-orange-500/50 to-transparent",
    },
    violet: {
      text: "text-violet-400",
      textMuted: "text-violet-400/80",
      bg: "bg-violet-400",
      bgLight: "bg-violet-500/10",
      border: "border-violet-400/20",
      borderLight: "border-violet-500/20",
      shadow: "shadow-[0_0_12px_rgba(167,139,250,0.5)]",
      glow: "glow-violet",
      gradient: "bg-gradient-to-r from-transparent via-violet-500/50 to-transparent",
    },
    red: {
      text: "text-red-400",
      textMuted: "text-red-400/80",
      bg: "bg-red-400",
      bgLight: "bg-red-500/10",
      border: "border-red-400/20",
      borderLight: "border-red-500/20",
      shadow: "shadow-[0_0_12px_rgba(248,113,113,0.5)]",
      glow: "glow-red",
      gradient: "bg-gradient-to-r from-transparent via-red-500/50 to-transparent",
    },
    emerald: {
      text: "text-emerald-400",
      textMuted: "text-emerald-400/80",
      bg: "bg-emerald-400",
      bgLight: "bg-emerald-500/10",
      border: "border-emerald-400/20",
      borderLight: "border-emerald-500/20",
      shadow: "shadow-[0_0_12px_rgba(52,211,153,0.5)]",
      glow: "glow-emerald",
      gradient: "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent",
    },
    yellow: {
      text: "text-yellow-400",
      textMuted: "text-yellow-400/80",
      bg: "bg-yellow-400",
      bgLight: "bg-yellow-500/10",
      border: "border-yellow-400/20",
      borderLight: "border-yellow-500/20",
      shadow: "shadow-[0_0_12px_rgba(250,204,21,0.5)]",
      glow: "glow-yellow",
      gradient: "bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent",
    },
    blue: {
      text: "text-blue-400",
      textMuted: "text-blue-400/80",
      bg: "bg-blue-400",
      bgLight: "bg-blue-500/10",
      border: "border-blue-400/20",
      borderLight: "border-blue-500/20",
      shadow: "shadow-[0_0_12px_rgba(96,165,250,0.5)]",
      glow: "glow-blue",
      gradient: "bg-gradient-to-r from-transparent via-blue-500/50 to-transparent",
    },
    indigo: {
      text: "text-indigo-400",
      textMuted: "text-indigo-400/80",
      bg: "bg-indigo-400",
      bgLight: "bg-indigo-500/10",
      border: "border-indigo-400/20",
      borderLight: "border-indigo-500/20",
      shadow: "shadow-[0_0_12px_rgba(129,140,248,0.5)]",
      glow: "glow-indigo",
      gradient: "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent",
    },
    sky: {
      text: "text-sky-400",
      textMuted: "text-sky-400/80",
      bg: "bg-sky-400",
      bgLight: "bg-sky-500/10",
      border: "border-sky-400/20",
      borderLight: "border-sky-500/20",
      shadow: "shadow-[0_0_12px_rgba(56,189,248,0.5)]",
      glow: "glow-sky",
      gradient: "bg-gradient-to-r from-transparent via-sky-500/50 to-transparent",
    },
    lime: {
      text: "text-lime-400",
      textMuted: "text-lime-400/80",
      bg: "bg-lime-400",
      bgLight: "bg-lime-500/10",
      border: "border-lime-400/20",
      borderLight: "border-lime-500/20",
      shadow: "shadow-[0_0_12px_rgba(163,230,53,0.5)]",
      glow: "glow-lime",
      gradient: "bg-gradient-to-r from-transparent via-lime-500/50 to-transparent",
    },
  };

  return colorMap[color] || colorMap.cyan;
}
