// src/lib/seoEngine.ts
// DXM Advanced SEO Engine - Google Optimization & Revenue Maximization
// Comprehensive SEO automation, content generation, and performance tracking

import { Metadata } from "next";
import { DealRadarItem } from "./dealRadar";
import { buildAmazonLink } from "./affiliateConfig";
import { appConfig } from "./env";

export interface SEOAnalysis {
  score: number; // 0-100 SEO score
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  keywords: KeywordAnalysis;
  performance: SEOPerformance;
  competitorAnalysis?: CompetitorAnalysis;
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'technical' | 'content' | 'performance' | 'mobile';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  fix: string;
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'content' | 'technical' | 'keywords' | 'links';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface KeywordAnalysis {
  primary: KeywordData[];
  secondary: KeywordData[];
  longtail: KeywordData[];
  trending: KeywordData[];
  competitors: string[];
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number; // 0-100
  cpc: number; // Cost per click
  trend: 'rising' | 'stable' | 'falling';
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  currentRank?: number;
  opportunities: string[];
}

export interface SEOPerformance {
  pageSpeed: {
    desktop: number;
    mobile: number;
    issues: string[];
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    status: 'good' | 'needs-improvement' | 'poor';
  };
  indexability: {
    indexed: boolean;
    crawlErrors: string[];
    sitemapStatus: 'submitted' | 'pending' | 'error';
  };
  socialSignals: {
    shares: number;
    mentions: number;
    backlinks: number;
  };
}

export interface CompetitorAnalysis {
  competitors: Array<{
    domain: string;
    ranking: number;
    keywords: string[];
    strengths: string[];
    weaknesses: string[];
  }>;
  opportunities: string[];
  threats: string[];
}

/**
 * Advanced SEO Engine for DXM369 Marketplace
 */
export class DXMSEOEngine {
  private baseUrl: string;
  private siteName: string;
  private brandKeywords: string[];

  constructor() {
    this.baseUrl = appConfig.siteUrl;
    this.siteName = "DXM369 Gear Nexus";
    this.brandKeywords = ["DXM369", "DXM score", "hardware intelligence", "gear nexus"];
  }

  /**
   * Generate comprehensive SEO metadata for any page
   */
  generateAdvancedSEO(options: {
    type: 'homepage' | 'category' | 'product' | 'deals' | 'comparison';
    data?: any;
    keywords?: string[];
    customTitle?: string;
    customDescription?: string;
  }): Metadata {
    const { type, data, keywords = [], customTitle, customDescription } = options;

    switch (type) {
      case 'homepage':
        return this.generateHomepageSEO();
      case 'category':
        return this.generateCategorySEO(data.category, data.productCount);
      case 'product':
        return this.generateProductSEO(data as DealRadarItem);
      case 'deals':
        return this.generateDealsSEO(data.deals, data.filters);
      case 'comparison':
        return this.generateComparisonSEO(data.products);
      default:
        return this.generateGenericSEO(customTitle, customDescription, keywords);
    }
  }

  /**
   * Generate homepage SEO with dynamic content
   */
  private generateHomepageSEO(): Metadata {
    const currentYear = new Date().getFullYear();
    const title = `Best GPU, CPU & Laptop Deals ${currentYear} | DXM369 Hardware Intelligence`;
    const description = `Find the best hardware deals with DXM Value Scoring. Real-time GPU, CPU, and laptop price tracking with professional analysis. Save money on RTX 4090, RTX 4080, Ryzen 7000, Intel 14th gen and more.`;

    return {
      title,
      description,
      keywords: [
        `best GPU deals ${currentYear}`,
        `RTX 4090 deals`,
        `RTX 4080 price`,
        `AMD Ryzen deals`,
        `Intel 14th gen deals`,
        `gaming laptop deals`,
        `hardware price tracker`,
        `DXM score`,
        `PC component deals`,
        `graphics card deals`
      ],
      openGraph: {
        title,
        description,
        url: this.baseUrl,
        type: 'website',
        images: [
          {
            url: `${this.baseUrl}/og-homepage-${currentYear}.png`,
            width: 1200,
            height: 630,
            alt: `DXM369 Hardware Deals ${currentYear}`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${this.baseUrl}/og-homepage-${currentYear}.png`]
      },
      alternates: {
        canonical: this.baseUrl
      }
    };
  }

  /**
   * Enhanced category SEO with trending keywords
   */
  private generateCategorySEO(category: string, productCount: number = 0): Metadata {
    const categoryData = this.getCategoryData(category);
    const currentYear = new Date().getFullYear();
    
    const title = `Best ${categoryData.name} Deals ${currentYear} | ${productCount}+ Products | DXM369`;
    const description = `Find the best ${categoryData.name.toLowerCase()} deals with DXM intelligence. ${productCount > 0 ? `${productCount}+ verified products` : 'Real-time pricing'}, performance analysis, and affiliate links. ${categoryData.topProducts.join(', ')} and more.`;

    return {
      title,
      description,
      keywords: [
        ...categoryData.primaryKeywords,
        ...categoryData.trendingKeywords,
        `${category} deals ${currentYear}`,
        `best ${category} ${currentYear}`,
        `${category} price comparison`,
        `DXM ${category} score`
      ],
      openGraph: {
        title,
        description,
        url: `${this.baseUrl}/${category}s`,
        images: [
          {
            url: `${this.baseUrl}/og-${category}-deals.png`,
            width: 1200,
            height: 630,
            alt: `Best ${categoryData.name} Deals ${currentYear}`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      },
      alternates: {
        canonical: `${this.baseUrl}/${category}s`
      }
    };
  }

  /**
   * Enhanced product SEO with rich snippets
   */
  private generateProductSEO(product: DealRadarItem): Metadata {
    const savings = product.previousPrice ? 
      Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100) : 0;
    
    const title = `${product.title} - $${product.price.toLocaleString()}${savings > 0 ? ` (${savings}% OFF)` : ''} | DXM Score ${product.dxmScore.toFixed(1)}`;
    
    const description = `${product.title} available for $${product.price.toLocaleString()}${product.previousPrice ? ` (was $${product.previousPrice.toLocaleString()})` : ''}. DXM Score: ${product.dxmScore.toFixed(1)}/10. ${this.buildSpecsDescription(product)} Professional analysis with real-time pricing.`;

    const keywords = [
      product.title,
      `${product.brand} ${product.category}`,
      `${product.title} price`,
      `${product.title} deals`,
      `${product.title} review`,
      `${product.brand} ${product.category} ${new Date().getFullYear()}`,
      ...(product.tags || [])
    ];

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: `${this.baseUrl}/deals/${product.asin}`,
        type: 'website',
        images: product.imageUrl ? [
          {
            url: product.imageUrl,
            width: 800,
            height: 600,
            alt: product.title
          }
        ] : undefined
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.imageUrl ? [product.imageUrl] : undefined
      },
      alternates: {
        canonical: `${this.baseUrl}/deals/${product.asin}`
      }
    };
  }

  /**
   * Generate deals page SEO
   */
  private generateDealsSEO(deals: DealRadarItem[], filters?: any): Metadata {
    const currentYear = new Date().getFullYear();
    const dealCount = deals.length;
    const avgSavings = deals
      .filter(d => d.previousPrice)
      .reduce((sum, d) => sum + ((d.previousPrice! - d.price) / d.previousPrice!) * 100, 0) / 
      deals.filter(d => d.previousPrice).length;

    const title = `${dealCount} Best Hardware Deals ${currentYear} | Avg ${avgSavings.toFixed(0)}% OFF | DXM369`;
    const description = `Discover ${dealCount} verified hardware deals with average savings of ${avgSavings.toFixed(0)}%. Real-time price tracking on GPUs, CPUs, laptops and more. DXM intelligence ensures you get the best value.`;

    return {
      title,
      description,
      keywords: [
        `hardware deals ${currentYear}`,
        `PC component sales`,
        `GPU deals`,
        `CPU discounts`,
        `laptop sales`,
        `gaming deals`,
        `tech deals`,
        `DXM deals`
      ],
      openGraph: {
        title,
        description,
        url: `${this.baseUrl}/deals`
      },
      alternates: {
        canonical: `${this.baseUrl}/deals`
      }
    };
  }

  /**
   * Generate comparison page SEO
   */
  private generateComparisonSEO(products: DealRadarItem[]): Metadata {
    const productNames = products.map(p => p.title).join(' vs ');
    const title = `${productNames} Comparison | DXM Analysis | Which is Better?`;
    const description = `Professional comparison: ${productNames}. DXM scoring, performance analysis, price comparison, and buying recommendations. Find the best value for your needs.`;

    return {
      title,
      description,
      keywords: [
        ...products.map(p => p.title),
        ...products.map(p => `${p.title} vs`),
        'hardware comparison',
        'GPU comparison',
        'CPU comparison',
        'DXM comparison'
      ],
      openGraph: {
        title,
        description,
        type: 'article'
      }
    };
  }

  /**
   * Generate generic SEO metadata
   */
  private generateGenericSEO(title?: string, description?: string, keywords: string[] = []): Metadata {
    return {
      title: title || `${this.siteName} - Hardware Intelligence Platform`,
      description: description || "Professional hardware intelligence with DXM Value Scoring",
      keywords: [...keywords, ...this.brandKeywords],
      alternates: {
        canonical: this.baseUrl
      }
    };
  }

  /**
   * Generate advanced structured data
   */
  generateStructuredData(type: string, data: any): any {
    switch (type) {
      case 'product':
        return this.generateProductStructuredData(data);
      case 'organization':
        return this.generateOrganizationStructuredData();
      case 'website':
        return this.generateWebsiteStructuredData();
      case 'breadcrumb':
        return this.generateBreadcrumbStructuredData(data);
      case 'faq':
        return this.generateFAQStructuredData(data);
      case 'review':
        return this.generateReviewStructuredData(data);
      default:
        return null;
    }
  }

  /**
   * Enhanced product structured data with DXM scoring
   */
  private generateProductStructuredData(product: DealRadarItem): any {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "category": product.category,
      "sku": product.asin,
      "gtin": product.asin,
      "mpn": product.asin,
      "image": product.imageUrl,
      "description": `${product.title} - Professional hardware analysis with DXM Score ${product.dxmScore.toFixed(1)}/10. ${this.buildSpecsDescription(product)}`,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "USD",
        "availability": this.mapAvailabilityToSchema(product.availability),
        "seller": {
          "@type": "Organization",
          "name": product.vendor || "Amazon"
        },
        "url": buildAmazonLink(product.asin),
        "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 30
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.dxmScore.toFixed(1),
        "bestRating": "10",
        "worstRating": "0",
        "ratingCount": "1",
        "reviewCount": "1"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": product.dxmScore.toFixed(1),
          "bestRating": "10"
        },
        "author": {
          "@type": "Organization",
          "name": "DXM369"
        },
        "reviewBody": `Professional DXM analysis: ${product.dxmScore.toFixed(1)}/10 value score. Evaluated on performance value, deal quality, trust signals, efficiency, and market trends. ${this.generateDXMReviewBody(product)}`
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "DXM Score",
          "value": product.dxmScore.toFixed(1)
        },
        ...(product.vram ? [{
          "@type": "PropertyValue",
          "name": "VRAM",
          "value": product.vram
        }] : []),
        ...(product.tdp ? [{
          "@type": "PropertyValue", 
          "name": "TDP",
          "value": product.tdp
        }] : [])
      ]
    };
  }

  /**
   * Generate FAQ structured data
   */
  private generateFAQStructuredData(faqs: Array<{question: string, answer: string}>): any {
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

  /**
   * Generate review structured data
   */
  private generateReviewStructuredData(review: any): any {
    return {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "Product",
        "name": review.productName
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "10"
      },
      "author": {
        "@type": "Organization",
        "name": "DXM369"
      },
      "reviewBody": review.body,
      "datePublished": review.date
    };
  }

  /**
   * Perform comprehensive SEO analysis
   */
  async performSEOAnalysis(url: string, content: string): Promise<SEOAnalysis> {
    const issues: SEOIssue[] = [];
    const recommendations: SEORecommendation[] = [];
    
    // Technical SEO Analysis
    const technicalIssues = this.analyzeTechnicalSEO(content);
    issues.push(...technicalIssues);

    // Content Analysis
    const contentIssues = this.analyzeContent(content);
    issues.push(...contentIssues);

    // Keyword Analysis
    const keywords = await this.analyzeKeywords(content);

    // Performance Analysis
    const performance = await this.analyzePerformance(url);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(issues, keywords));

    // Calculate overall SEO score
    const score = this.calculateSEOScore(issues, keywords, performance);

    return {
      score,
      issues,
      recommendations,
      keywords,
      performance
    };
  }

  /**
   * Analyze technical SEO factors
   */
  private analyzeTechnicalSEO(content: string): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // Check for title tag
    if (!content.includes('<title>')) {
      issues.push({
        type: 'critical',
        category: 'technical',
        title: 'Missing Title Tag',
        description: 'Page is missing a title tag',
        impact: 'high',
        fix: 'Add a descriptive title tag with target keywords'
      });
    }

    // Check for meta description
    if (!content.includes('name="description"')) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Missing Meta Description',
        description: 'Page is missing a meta description',
        impact: 'medium',
        fix: 'Add a compelling meta description (150-160 characters)'
      });
    }

    // Check for structured data
    if (!content.includes('application/ld+json')) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Missing Structured Data',
        description: 'Page lacks structured data markup',
        impact: 'medium',
        fix: 'Add relevant JSON-LD structured data'
      });
    }

    return issues;
  }

  /**
   * Analyze content quality
   */
  private analyzeContent(content: string): SEOIssue[] {
    const issues: SEOIssue[] = [];
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;

    if (wordCount < 300) {
      issues.push({
        type: 'warning',
        category: 'content',
        title: 'Low Word Count',
        description: `Content has only ${wordCount} words`,
        impact: 'medium',
        fix: 'Expand content to at least 300 words for better SEO'
      });
    }

    // Check for headings
    if (!content.includes('<h1>')) {
      issues.push({
        type: 'critical',
        category: 'content',
        title: 'Missing H1 Tag',
        description: 'Page is missing an H1 heading',
        impact: 'high',
        fix: 'Add a descriptive H1 tag with primary keyword'
      });
    }

    return issues;
  }

  /**
   * Analyze keywords and search intent
   */
  private async analyzeKeywords(content: string): Promise<KeywordAnalysis> {
    // This would integrate with real keyword research APIs
    // For now, return mock data based on hardware categories
    
    return {
      primary: [
        {
          keyword: "GPU deals",
          searchVolume: 12000,
          difficulty: 65,
          cpc: 1.25,
          trend: 'rising',
          intent: 'commercial',
          opportunities: ['Add price comparison', 'Include user reviews']
        },
        {
          keyword: "RTX 4090 price",
          searchVolume: 8500,
          difficulty: 70,
          cpc: 2.10,
          trend: 'stable',
          intent: 'transactional',
          opportunities: ['Real-time pricing', 'Stock alerts']
        }
      ],
      secondary: [
        {
          keyword: "best graphics card 2025",
          searchVolume: 5400,
          difficulty: 55,
          cpc: 0.95,
          trend: 'rising',
          intent: 'informational',
          opportunities: ['Comparison guides', 'Buying guides']
        }
      ],
      longtail: [
        {
          keyword: "RTX 4090 vs RTX 4080 gaming performance",
          searchVolume: 1200,
          difficulty: 35,
          cpc: 0.75,
          trend: 'stable',
          intent: 'informational',
          opportunities: ['Detailed comparisons', 'Benchmark data']
        }
      ],
      trending: [
        {
          keyword: "RTX 4070 SUPER deals",
          searchVolume: 3200,
          difficulty: 45,
          cpc: 1.50,
          trend: 'rising',
          intent: 'commercial',
          opportunities: ['Latest releases', 'Launch pricing']
        }
      ],
      competitors: ['newegg.com', 'microcenter.com', 'bestbuy.com']
    };
  }

  /**
   * Analyze page performance
   */
  private async analyzePerformance(url: string): Promise<SEOPerformance> {
    // This would integrate with real performance APIs (PageSpeed Insights, etc.)
    return {
      pageSpeed: {
        desktop: 92,
        mobile: 87,
        issues: ['Optimize images', 'Reduce JavaScript bundle size']
      },
      coreWebVitals: {
        lcp: 1.2,
        fid: 45,
        cls: 0.05,
        status: 'good'
      },
      indexability: {
        indexed: true,
        crawlErrors: [],
        sitemapStatus: 'submitted'
      },
      socialSignals: {
        shares: 156,
        mentions: 23,
        backlinks: 45
      }
    };
  }

  /**
   * Generate SEO recommendations
   */
  private generateRecommendations(issues: SEOIssue[], keywords: KeywordAnalysis): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // Content recommendations
    recommendations.push({
      priority: 'high',
      category: 'content',
      title: 'Create Comparison Content',
      description: 'Develop detailed product comparison pages',
      implementation: 'Build GPU vs GPU, CPU vs CPU comparison tools',
      expectedImpact: 'Increase organic traffic by 25-40%'
    });

    // Technical recommendations
    recommendations.push({
      priority: 'medium',
      category: 'technical',
      title: 'Implement Advanced Schema',
      description: 'Add product, review, and FAQ structured data',
      implementation: 'Use JSON-LD for all product pages',
      expectedImpact: 'Improve rich snippet appearance'
    });

    // Keyword recommendations
    recommendations.push({
      priority: 'high',
      category: 'keywords',
      title: 'Target Long-tail Keywords',
      description: 'Focus on specific product comparison keywords',
      implementation: 'Create pages for "RTX 4090 vs RTX 4080" type queries',
      expectedImpact: 'Capture high-intent traffic'
    });

    return recommendations;
  }

  /**
   * Calculate overall SEO score
   */
  private calculateSEOScore(issues: SEOIssue[], keywords: KeywordAnalysis, performance: SEOPerformance): number {
    let score = 100;

    // Deduct for issues
    issues.forEach(issue => {
      if (issue.type === 'critical') score -= 15;
      else if (issue.type === 'warning') score -= 8;
      else score -= 3;
    });

    // Performance bonus/penalty
    if (performance.pageSpeed.mobile < 70) score -= 10;
    if (performance.coreWebVitals.status === 'poor') score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Helper methods
   */
  private getCategoryData(category: string) {
    const categoryMap: Record<string, any> = {
      gpu: {
        name: 'Graphics Cards (GPUs)',
        primaryKeywords: ['GPU deals', 'graphics card deals', 'RTX deals', 'Radeon deals'],
        trendingKeywords: ['RTX 4090', 'RTX 4080 SUPER', 'RX 7800 XT', 'RTX 4070'],
        topProducts: ['RTX 4090', 'RTX 4080', 'RTX 4070', 'RX 7800 XT']
      },
      cpu: {
        name: 'Processors (CPUs)',
        primaryKeywords: ['CPU deals', 'processor deals', 'Intel deals', 'AMD deals'],
        trendingKeywords: ['Intel 14th gen', 'Ryzen 7000', 'i9-14900K', 'Ryzen 9 7950X'],
        topProducts: ['i9-14900K', 'i7-14700K', 'Ryzen 9 7950X', 'Ryzen 7 7700X']
      },
      laptop: {
        name: 'Gaming Laptops',
        primaryKeywords: ['gaming laptop deals', 'laptop deals', 'RTX laptop', 'gaming notebook'],
        trendingKeywords: ['RTX 4070 laptop', 'RTX 4080 laptop', 'gaming laptop 2025'],
        topProducts: ['ASUS ROG', 'MSI Gaming', 'Alienware', 'Razer Blade']
      }
    };

    return categoryMap[category] || {
      name: category.toUpperCase(),
      primaryKeywords: [`${category} deals`],
      trendingKeywords: [],
      topProducts: []
    };
  }

  private buildSpecsDescription(product: DealRadarItem): string {
    const specs = [];
    if (product.vram) specs.push(`${product.vram} VRAM`);
    if (product.tdp) specs.push(`${product.tdp} TDP`);
    if (product.cores) specs.push(`${product.cores} cores`);
    if (product.memory) specs.push(`${product.memory} memory`);
    
    return specs.length > 0 ? `${specs.join(', ')}. ` : '';
  }

  private mapAvailabilityToSchema(availability?: string): string {
    switch (availability) {
      case 'In Stock':
        return 'https://schema.org/InStock';
      case 'Limited Stock':
        return 'https://schema.org/LimitedAvailability';
      default:
        return 'https://schema.org/OutOfStock';
    }
  }

  private generateDXMReviewBody(product: DealRadarItem): string {
    if (product.dxmScore >= 9.0) {
      return "Exceptional value with outstanding performance-to-price ratio. Highly recommended for enthusiasts and professionals.";
    } else if (product.dxmScore >= 8.0) {
      return "Excellent value proposition with strong performance metrics. Great choice for most users.";
    } else if (product.dxmScore >= 7.0) {
      return "Good value with competitive performance. Suitable for budget-conscious buyers.";
    } else {
      return "Fair value with some trade-offs. Consider alternatives in this price range.";
    }
  }

  private generateOrganizationStructuredData(): any {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": this.siteName,
      "url": this.baseUrl,
      "logo": `${this.baseUrl}/logo.png`,
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

  private generateWebsiteStructuredData(): any {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": this.siteName,
      "url": this.baseUrl,
      "description": "Professional hardware intelligence platform with DXM Value Scoring",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
  }

  private generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>): any {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `${this.baseUrl}${item.url}`
      }))
    };
  }
}

// Export singleton instance
export const seoEngine = new DXMSEOEngine();

// Convenience functions
export async function generatePageSEO(type: string, data?: any): Promise<Metadata> {
  return seoEngine.generateAdvancedSEO({ type: type as any, data });
}

export async function analyzePage(url: string, content: string): Promise<SEOAnalysis> {
  return seoEngine.performSEOAnalysis(url, content);
}

export function generateStructuredData(type: string, data: any): any {
  return seoEngine.generateStructuredData(type, data);
}
