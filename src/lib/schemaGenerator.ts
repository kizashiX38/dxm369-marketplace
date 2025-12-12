// src/lib/schemaGenerator.ts
// DXM369 Structured Data Engine (Path A: High-Velocity Schema)
// Generates schema.org JSON-LD for categories, picks, and comparisons
// Focus: ProductCollection, AggregateOffer, ItemList (Path A)
// Future: Product, AggregateRating, Review, Comparison v2 (Path B - Q1)

import { DealRadarItem } from "@/lib/dealRadar";

// ============================================================================
// PRODUCT COLLECTION SCHEMA (Anchor Entity - Category Pages)
// ============================================================================

export interface ProductCollectionInput {
  category: string; // 'gpu', 'cpu', 'laptop', 'ssd', 'ram'
  categoryDisplayName: string; // 'Graphics Processing Units'
  description: string;
  itemCount: number;
  url: string; // e.g., 'https://dxm369.com/gpus'
  image?: string;
  relatedComparisons?: Array<{
    name: string;
    url: string;
  }>;
}

export function generateProductCollectionSchema(
  input: ProductCollectionInput
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProductCollection",
    name: `${input.categoryDisplayName} Deals & Comparisons`,
    description: input.description,
    url: input.url,
    image: input.image || "https://dxm369.com/og-image.png",
    numberOfItems: input.itemCount,
    mainEntity: {
      "@type": "Thing",
      name: input.categoryDisplayName,
      url: input.url
    },
    // Link to related comparisons as "hasPart" (child resources)
    ...(input.relatedComparisons && input.relatedComparisons.length > 0 && {
      hasPart: input.relatedComparisons.map((comp) => ({
        "@type": "WebPage",
        "@id": comp.url,
        name: comp.name,
        url: comp.url
      }))
    })
  };
}

// ============================================================================
// AGGREGATE OFFER SCHEMA (Best Picks - Commerce Signal)
// ============================================================================

export interface AggregateOfferInput {
  bestOverall?: any;
  bestValue?: any;
  bestBudget?: any;
  bestHighEnd?: any;
}

export function generateAggregateOfferSchema(
  input: AggregateOfferInput
): Record<string, unknown> {
  const picks = [
    input.bestOverall,
    input.bestValue,
    input.bestBudget,
    input.bestHighEnd
  ].filter((p): p is any => Boolean(p));

  if (picks.length === 0) {
    return {};
  }

  const prices = picks
    .map((p) => p.price)
    .filter((p) => p > 0);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "AggregateOffer",
    name: "DXM Best Picks",
    description: "Curated selection of top-rated products by DXM Value Score",
    priceCurrency: "USD",
    lowPrice: minPrice.toFixed(2),
    highPrice: maxPrice.toFixed(2),
    offerCount: picks.length,
    offers: picks.map((pick) => ({
      "@type": "Offer",
      name: pick.title,
      price: pick.price.toFixed(2),
      priceCurrency: "USD",
      url: `https://amazon.com/dp/${pick.asin}`,
      availability: "https://schema.org/InStock"
    }))
  };
}

// ============================================================================
// ITEM LIST SCHEMA (Comparison Pages)
// ============================================================================

export interface ComparisonItemListInput {
  name: string; // "RTX 4070 vs RTX 4070 Super"
  description: string;
  url: string;
  items: Array<{
    position: number;
    name: string;
    url: string;
    image?: string;
  }>;
}

export function generateComparisonItemListSchema(
  input: ComparisonItemListInput
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    description: input.description,
    url: input.url,
    itemListElement: input.items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
      ...(item.image && { image: item.image })
    }))
  };
}

// ============================================================================
// BREADCRUMB LIST SCHEMA (All Pages - Navigation Context)
// ============================================================================

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbListSchema(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// ============================================================================
// CATEGORY METADATA HELPER
// ============================================================================

export const CATEGORY_SCHEMA_CONFIG: Record<
  string,
  {
    displayName: string;
    description: string;
    image: string;
    comparisons: Array<{ name: string; url: string }>;
  }
> = {
  gpu: {
    displayName: "Graphics Processing Units",
    description:
      "Latest GPU deals with DXM Value Scoring. Find the best graphics cards for gaming, content creation, and professional workloads.",
    image: "https://dxm369.com/og-image.png",
    comparisons: [
      {
        name: "RTX 4070 Super vs RTX 4070",
        url: "https://dxm369.com/rtx-4070-super-vs-rtx-4070"
      },
      {
        name: "RTX 4070 vs RX 7800 XT",
        url: "https://dxm369.com/rtx-4070-vs-rx-7800-xt"
      }
    ]
  },
  cpu: {
    displayName: "Processors",
    description:
      "CPU deals and comparisons with DXM Value Scoring. Compare Intel, AMD, and high-performance processors for gaming and productivity.",
    image: "https://dxm369.com/og-image.png",
    comparisons: [
      {
        name: "Ryzen 7 7700X vs i7-14700K",
        url: "https://dxm369.com/ryzen-7-7700x-vs-i7-14700k"
      }
    ]
  },
  ssd: {
    displayName: "Storage Drives",
    description:
      "NVMe SSD and storage deals with performance metrics. Find fast storage for gaming, content creation, and system optimization.",
    image: "https://dxm369.com/og-image.png",
    comparisons: [
      {
        name: "Samsung 990 Pro vs WD Black SN850X",
        url: "https://dxm369.com/samsung-990-pro-vs-wd-black-sn850x"
      }
    ]
  },
  ram: {
    displayName: "Memory Modules",
    description:
      "DDR4 and DDR5 RAM deals with speed and latency specs. Compare memory modules for gaming, streaming, and professional workloads.",
    image: "https://dxm369.com/og-image.png",
    comparisons: [
      {
        name: "Corsair Vengeance vs G.Skill Trident Z5",
        url: "https://dxm369.com/corsair-vengeance-vs-gskill-trident-z5"
      }
    ]
  },
  laptop: {
    displayName: "Gaming Laptops",
    description:
      "Gaming laptop deals with GPU and performance metrics. Find portable gaming machines with competitive specs and pricing.",
    image: "https://dxm369.com/og-image.png",
    comparisons: []
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get schema config for a category
 * @param category - category key (gpu, cpu, ssd, ram, laptop)
 * @returns schema config or null if not found
 */
export function getSchemaConfigForCategory(
  category: string
): (typeof CATEGORY_SCHEMA_CONFIG)[keyof typeof CATEGORY_SCHEMA_CONFIG] | null {
  const normalized = category.toLowerCase().replace(/s$/, "");
  return CATEGORY_SCHEMA_CONFIG[normalized] || null;
}

/**
 * Generate complete schema for a category page
 * @param category - category key
 * @param itemCount - number of products in category
 * @returns array of schema objects
 */
export function generateCategoryPageSchemas(
  category: string,
  itemCount: number
): Record<string, unknown>[] {
  const config = getSchemaConfigForCategory(category);
  if (!config) return [];

  const categoryUrl = `https://dxm369.com/${
    category === "ssd" ? "storage" : category === "ram" ? "memory" : category
  }`;

  const schemas = [
    generateProductCollectionSchema({
      category,
      categoryDisplayName: config.displayName,
      description: config.description,
      itemCount,
      url: categoryUrl,
      image: config.image,
      relatedComparisons: config.comparisons
    }),
    generateBreadcrumbListSchema([
      { name: "Home", url: "https://dxm369.com" },
      { name: config.displayName, url: categoryUrl }
    ])
  ];

  return schemas;
}

/**
 * Render schema as JSON-LD script tag (use in JSX)
 * @param schema - schema object
 * @returns HTML string for dangerouslySetInnerHTML
 */
export function renderSchemaScript(schema: Record<string, unknown>): string {
  return JSON.stringify(schema);
}
