// src/lib/seo.ts
// DXM369 SEO & Structured Data Engine
// Optimized for hardware search terms and affiliate revenue

import { Metadata } from "next";
import { DealRadarItem } from "@/lib/dealRadar";
import { buildAmazonLink } from "@/lib/affiliateConfig";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: any;
}

// Base SEO configuration
export const baseSEO: Metadata = {
  title: {
    default: "DXM369 Gear Nexus – Hardware Intelligence Platform",
    template: "%s | DXM369 Gear Nexus"
  },
  description: "Professional hardware intelligence platform with DXM Value Scoring. Find the best GPU, CPU, and laptop deals with real-time pricing analysis and affiliate links.",
  keywords: [
    "GPU deals", "CPU deals", "laptop deals", "hardware deals",
    "RTX 4090", "RTX 4080", "RTX 4070", "RX 7800 XT", "RX 7600",
    "Intel 14th gen", "AMD Ryzen 7000", "gaming laptop deals",
    "PC building", "hardware comparison", "price tracking",
    "DXM score", "hardware intelligence", "affiliate deals"
  ],
  authors: [{ name: "DXM369 Team" }],
  creator: "DXM369",
  publisher: "DXM369 Gear Nexus",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dxm369.com",
    siteName: "DXM369 Gear Nexus",
    title: "DXM369 Gear Nexus – Hardware Intelligence Platform",
    description: "Professional hardware intelligence platform with DXM Value Scoring. Find the best GPU, CPU, and laptop deals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DXM369 Gear Nexus - Hardware Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DXM369 Gear Nexus – Hardware Intelligence Platform",
    description: "Professional hardware intelligence platform with DXM Value Scoring.",
    images: ["/og-image.png"],
    creator: "@dxm369",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

// Generate SEO metadata for product pages
export function generateProductSEO(deal: DealRadarItem): Metadata {
  const title = `${deal.title} - $${deal.price} | DXM Score ${deal.dxmScore.toFixed(1)}`;
  const description = `${deal.title} available for $${deal.price}${deal.previousPrice ? ` (was $${deal.previousPrice})` : ''}. DXM Score: ${deal.dxmScore.toFixed(1)}/10. ${deal.vram ? `${deal.vram} VRAM, ` : ''}${deal.tdp ? `${deal.tdp} TDP. ` : ''}Find the best ${deal.category} deals with real-time pricing analysis.`;
  
  return {
    title,
    description,
    keywords: [
      deal.title,
      deal.brand,
      `${deal.brand} ${deal.category}`,
      `${deal.category} deals`,
      `${deal.title} price`,
      `${deal.title} review`,
      ...(deal.tags || [])
    ],
    openGraph: {
      title,
      description,
      url: `/deals/${deal.asin}`,
      images: deal.imageUrl ? [
        {
          url: deal.imageUrl,
          width: 800,
          height: 600,
          alt: deal.title,
        }
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: deal.imageUrl ? [deal.imageUrl] : undefined,
    },
  };
}

// Generate SEO metadata for category pages
export function generateCategorySEO(category: string, productCount: number = 0): Metadata {
  const categoryNames: Record<string, string> = {
    gpu: "Graphics Cards (GPUs)",
    cpu: "Processors (CPUs)",
    laptop: "Gaming Laptops",
    monitor: "Gaming Monitors",
    ssd: "SSD Storage",
    ram: "Memory (RAM)",
    storage: "SSD Storage",
    memory: "Memory (RAM)",
    motherboard: "Motherboards",
    psu: "Power Supplies",
    "gaming-monitors": "Gaming Monitors"
  };

  const categoryName = categoryNames[category] || category.toUpperCase();
  const urlPath = (() => {
    const explicitPaths: Record<string, string> = {
      gpu: "/gpus",
      cpu: "/cpus",
      laptop: "/laptops",
      monitor: "/monitors",
      "gaming-monitors": "/gaming-monitors",
      ssd: "/storage",
      storage: "/storage",
      ram: "/memory",
      memory: "/memory",
      motherboard: "/motherboards",
      psu: "/power-supplies",
    };

    return explicitPaths[category] || `/${category}`;
  })();

  const year = new Date().getFullYear();
  const title = `Best ${categoryName} Deals ${year} (Ranked by DXM Score) | DXM369`;
  const description = (() => {
    const count = productCount > 0 ? `${productCount}+` : "top";
    const common = `Live ${categoryName.toLowerCase()} deals with DXM Value Scoring. Compare price vs performance, spot value picks, and click through to Amazon.`;

    const byCategory: Record<string, string> = {
      gpu: `Best GPU deals ${year} ranked by DXM Score. Compare RTX vs Radeon value, 1080p/1440p/4K picks, and price drops across ${count} GPUs.`,
      cpu: `Best CPU deals ${year} ranked by DXM Score. Compare Intel vs Ryzen value for gaming and work, and shop ${count} CPUs with live pricing.`,
      laptop: `Best laptop deals ${year} ranked by DXM Score. Find gaming and productivity laptops by budget, specs, and price drops across ${count} laptops.`,
      ssd: `Best SSD deals ${year} ranked by DXM Score. Compare NVMe vs SATA value, capacity tiers, and shop ${count} SSDs with live pricing.`,
      ram: `Best RAM deals ${year} ranked by DXM Score. Compare DDR4 vs DDR5 value, capacity kits, and shop ${count} memory picks with live pricing.`,
      storage: `Best SSD deals ${year} ranked by DXM Score. Compare NVMe vs SATA value, capacity tiers, and shop ${count} SSDs with live pricing.`,
      memory: `Best RAM deals ${year} ranked by DXM Score. Compare DDR4 vs DDR5 value, capacity kits, and shop ${count} memory picks with live pricing.`,
    };

    return byCategory[category] || common;
  })();
  const canonicalUrl = `https://dxm369.com${urlPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      `${category} deals`,
      `best ${category}`,
      `${category} price comparison`,
      `${category} reviews`,
      `cheap ${category}`,
      `${category} sale`,
      `${category} discount`,
      categoryName
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Generate structured data for products
export function generateProductStructuredData(deal: DealRadarItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": deal.title,
    "brand": {
      "@type": "Brand",
      "name": deal.brand
    },
    "category": deal.category,
    "sku": deal.asin,
    "gtin": deal.asin,
    "image": deal.imageUrl,
    "description": `${deal.title} - Professional hardware with DXM Score ${deal.dxmScore.toFixed(1)}/10. ${deal.vram ? `${deal.vram} VRAM, ` : ''}${deal.tdp ? `${deal.tdp} TDP.` : ''}`,
    "offers": {
      "@type": "Offer",
      "price": deal.price,
      "priceCurrency": "USD",
      "availability": deal.availability === "In Stock" ? "https://schema.org/InStock" : 
                     deal.availability === "Limited Stock" ? "https://schema.org/LimitedAvailability" :
                     "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": deal.vendor || "Amazon"
      },
      "url": buildAmazonLink(deal.asin),
      "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": deal.dxmScore.toFixed(1),
      "bestRating": "10",
      "worstRating": "0",
      "ratingCount": "1",
      "reviewCount": "1"
    },
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": deal.dxmScore.toFixed(1),
        "bestRating": "10"
      },
      "author": {
        "@type": "Organization",
        "name": "DXM369"
      },
      "reviewBody": `Professional analysis with DXM Value Score ${deal.dxmScore.toFixed(1)}/10. Evaluated on performance value, deal quality, trust signals, efficiency, and market trends.`
    }
  };
}

// Generate structured data for organization
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DXM369 Gear Nexus",
    "url": "https://dxm369.com",
    "logo": "https://dxm369.com/logo.png",
    "description": "Professional hardware intelligence platform with proprietary DXM Value Scoring system for GPUs, CPUs, laptops, and PC components.",
    "sameAs": [
      "https://twitter.com/dxm369",
      "https://github.com/dxm369"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@dxm369.com"
    }
  };
}

// Generate structured data for website
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DXM369 Gear Nexus",
    "url": "https://dxm369.com",
    "description": "Professional hardware intelligence platform with DXM Value Scoring",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://dxm369.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://dxm369.com${item.url}`
    }))
  };
}

// High-traffic hardware keywords for content strategy
export const hardwareKeywords = {
  gpu: [
    "best GPU 2025", "RTX 4090 deals", "RTX 4080 SUPER price", "RTX 4070 vs RX 7800 XT",
    "budget GPU under $300", "4K gaming GPU", "1440p GPU recommendations",
    "GPU price tracker", "graphics card deals", "GPU comparison 2025"
  ],
  cpu: [
    "best CPU 2025", "Intel 14th gen vs AMD Ryzen", "gaming CPU under $300",
    "CPU deals", "processor comparison", "Intel vs AMD 2025",
    "best CPU for gaming", "productivity CPU", "CPU price tracker"
  ],
  laptop: [
    "best gaming laptop 2025", "laptop deals under $1000", "RTX 4070 laptop",
    "gaming laptop comparison", "laptop price tracker", "budget gaming laptop",
    "productivity laptop deals", "laptop vs desktop 2025"
  ]
};

// Generate comparison page metadata
export function generateComparisonSEO(productA: string, productB: string, category: string): Metadata {
  const title = `${productA} vs ${productB} ${new Date().getFullYear()} | Which is Better? | DXM369`;
  const description = `Detailed comparison of ${productA} vs ${productB} with DXM Value Scoring. Performance benchmarks, pricing analysis, and current deals for both ${category} products.`;

  return {
    title,
    description,
    keywords: [
      `${productA} vs ${productB}`,
      `${productA} vs ${productB} comparison`,
      `${productA} vs ${productB} ${new Date().getFullYear()}`,
      `${productA} vs ${productB} benchmark`,
      `${productA} vs ${productB} price`,
      `${productA} deals`,
      `${productB} deals`,
      `${category} comparison`,
      `best ${category}`
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Generate comparison FAQ schema
export function generateComparisonFAQSchema(productA: string, productB: string, faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate sitemap data
export function generateSitemapUrls() {
  const baseUrl = "https://dxm369.com";
  const staticPages = [
    { url: "/", priority: 1.0, changefreq: "daily" },
    { url: "/gpus", priority: 0.9, changefreq: "daily" },
    { url: "/cpus", priority: 0.9, changefreq: "daily" },
    { url: "/laptops", priority: 0.9, changefreq: "daily" },
    { url: "/deals", priority: 0.8, changefreq: "hourly" },
    { url: "/trending", priority: 0.7, changefreq: "hourly" },
    { url: "/about", priority: 0.5, changefreq: "monthly" },
    // Comparison pages
    { url: "/rtx-4070-vs-rx-7800-xt", priority: 0.8, changefreq: "weekly" },
  ];

  return staticPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq as any,
    priority: page.priority,
  }));
}
