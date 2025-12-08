// src/app/blog/page.tsx
// Hardware Intelligence Blog - SEO Content Hub
// Buying guides, comparisons, and market analysis

import Link from "next/link";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hardware Intelligence Blog | GPU, CPU & Laptop Buying Guides | DXM369",
  description: "Expert hardware buying guides, GPU comparisons, CPU reviews, and market analysis. Stay informed with DXM369's hardware intelligence blog.",
  keywords: [
    "hardware buying guide", "GPU buying guide", "CPU buying guide", "laptop buying guide",
    "hardware reviews", "GPU comparison", "CPU comparison", "PC building guide",
    "hardware news", "tech analysis", "DXM369 blog"
  ],
  openGraph: {
    title: "Hardware Intelligence Blog | Expert Buying Guides",
    description: "Expert hardware buying guides, comparisons, and market analysis.",
    url: "/blog",
  },
  alternates: {
    canonical: "https://dxm369.com/blog",
  },
};

interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  publishDate: string;
  slug: string;
  featured: boolean;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: "gpu-buying-guide-2025",
    title: "Complete GPU Buying Guide 2025: RTX 40 vs RX 7000 Series",
    description: "Everything you need to know about choosing the right graphics card in 2025. RTX 4090, 4080, 4070 vs RX 7900 XTX, 7800 XT comparison with DXM scoring.",
    category: "Buying Guide",
    readTime: "12 min read",
    publishDate: "2025-12-05",
    slug: "/blog/gpu-buying-guide-2025",
    featured: true,
    tags: ["GPU", "RTX 40", "RX 7000", "Buying Guide"]
  },
  {
    id: "rtx-4070-vs-rx-7800-xt",
    title: "RTX 4070 vs RX 7800 XT: The Ultimate 1440p Gaming Showdown",
    description: "Detailed comparison of RTX 4070 vs RX 7800 XT with gaming benchmarks, ray tracing performance, and value analysis for 1440p gaming.",
    category: "Comparison",
    readTime: "8 min read",
    publishDate: "2025-12-05",
    slug: "/rtx-4070-vs-rx-7800-xt",
    featured: true,
    tags: ["RTX 4070", "RX 7800 XT", "1440p Gaming", "Comparison"]
  },
  {
    id: "budget-gpu-guide-2025",
    title: "Best Budget GPUs Under $400 in 2025",
    description: "Find the best budget graphics cards under $400. RTX 4060, RX 7600, and older generation options with performance analysis and deal recommendations.",
    category: "Buying Guide",
    readTime: "10 min read",
    publishDate: "2025-12-04",
    slug: "/blog/budget-gpu-guide-2025",
    featured: false,
    tags: ["Budget GPU", "RTX 4060", "RX 7600", "Value Gaming"]
  },
  {
    id: "cpu-buying-guide-2025",
    title: "CPU Buying Guide 2025: Intel 14th Gen vs AMD Ryzen 7000",
    description: "Complete processor buying guide covering Intel 14th generation and AMD Ryzen 7000 series. Gaming, productivity, and value recommendations.",
    category: "Buying Guide",
    readTime: "15 min read",
    publishDate: "2025-12-03",
    slug: "/blog/cpu-buying-guide-2025",
    featured: false,
    tags: ["CPU", "Intel 14th Gen", "AMD Ryzen", "Processor Guide"]
  },
  {
    id: "gaming-laptop-guide-2025",
    title: "Best Gaming Laptops 2025: RTX 4070 vs RTX 4060 Mobile",
    description: "Gaming laptop buying guide with RTX 4070 and RTX 4060 mobile GPU comparisons. Performance, battery life, and value analysis.",
    category: "Buying Guide",
    readTime: "12 min read",
    publishDate: "2025-12-02",
    slug: "/blog/gaming-laptop-guide-2025",
    featured: false,
    tags: ["Gaming Laptop", "RTX Mobile", "Laptop Guide"]
  },
  {
    id: "dxm-scoring-explained",
    title: "How DXM Value Scoring Works: The Science Behind Hardware Rankings",
    description: "Deep dive into DXM Value Scoring methodology. Learn how we evaluate performance value, deal quality, trust signals, and market trends.",
    category: "Analysis",
    readTime: "6 min read",
    publishDate: "2025-12-01",
    slug: "/blog/dxm-scoring-explained",
    featured: false,
    tags: ["DXM Score", "Methodology", "Analysis"]
  }
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.filter(post => !post.featured);
  
  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: "Hardware Intelligence Blog", url: "/blog" }
  ]);

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      
      <div className="min-h-screen py-6 relative">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <header className="glass-hero mb-8 p-8 clip-corner-tl glass-corner-accent holographic-sheen">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
                Hardware Intelligence Blog
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              Expert <span className="text-cyan-400">Hardware</span> Insights
            </h1>
            <p className="text-slate-400 font-mono leading-relaxed border-l-2 border-cyan-500/40 pl-4 max-w-4xl">
              In-depth buying guides, performance analysis, and market intelligence for GPUs, CPUs, 
              and laptops. Stay ahead with professional hardware insights and DXM Value Scoring.
            </p>
          </header>

          {/* Featured Posts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <article key={post.id} className="glass-panel p-6 hover:border-cyan-400/50 transition-all group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    <Link href={post.slug}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(post.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Recent Posts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <article key={post.id} className="glass-panel-secondary p-5 hover:border-cyan-400/30 transition-all group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-base font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    <Link href={post.slug}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-slate-500 bg-slate-800/30 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(post.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="glass-panel p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/blog/category/buying-guides" className="glass-panel-secondary p-4 text-center hover:border-cyan-400/50 transition-all group">
                <div className="text-2xl mb-2">📖</div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300">Buying Guides</div>
                <div className="text-xs text-slate-500">Expert recommendations</div>
              </Link>
              
              <Link href="/blog/category/comparisons" className="glass-panel-secondary p-4 text-center hover:border-cyan-400/50 transition-all group">
                <div className="text-2xl mb-2">⚖️</div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300">Comparisons</div>
                <div className="text-xs text-slate-500">Head-to-head analysis</div>
              </Link>
              
              <Link href="/blog/category/reviews" className="glass-panel-secondary p-4 text-center hover:border-cyan-400/50 transition-all group">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300">Reviews</div>
                <div className="text-xs text-slate-500">In-depth testing</div>
              </Link>
              
              <Link href="/blog/category/market-analysis" className="glass-panel-secondary p-4 text-center hover:border-cyan-400/50 transition-all group">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300">Market Analysis</div>
                <div className="text-xs text-slate-500">Trends & insights</div>
              </Link>
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="glass-hero p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Stay Updated with Hardware Intelligence</h2>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Get weekly hardware insights, deal alerts, and buying guides delivered to your inbox. 
              Join thousands of tech enthusiasts making smarter hardware decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 glass-panel-secondary px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
              />
              <button className="glass-panel px-6 py-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              No spam, unsubscribe anytime. Privacy policy compliant.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
