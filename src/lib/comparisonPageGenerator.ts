import { Metadata } from "next";
import { gpuComparisons } from "@/lib/comparisons/gpu-comparisons";
import { cpuComparisons } from "@/lib/comparisons/cpu-comparisons";
import { ssdComparisons } from "@/lib/comparisons/ssd-comparisons";
import { ramComparisons } from "@/lib/comparisons/ram-comparisons";
import { laptopComparisons } from "@/lib/comparisons/laptop-comparisons";

export interface ComparisonConfig {
  productA: string;
  productB: string;
  category: string;
  slug: string;
  winner?: string;
  winnerReason?: string;
  keyDifferences: Array<{ aspect: string; productAValue: string; productBValue: string }>;
  faqEntries: Array<{ question: string; answer: string }>;
  relatedComparisons?: string[];
  relatedCategories?: Array<{ label: string; url: string }>;
}

export function generateComparisonMetadata(config: ComparisonConfig): Metadata {
  const year = new Date().getFullYear();
  const title = `${config.productA} vs ${config.productB} ${year} | Which is Better? | DXM369`;
  const description = `Detailed comparison of ${config.productA} vs ${config.productB} with DXM Value Scoring. Performance benchmarks and deals.`;

  return {
    title,
    description,
    keywords: [
      `${config.productA} vs ${config.productB}`,
      `${config.productA} deals`,
      `${config.productB} deals`,
    ],
    openGraph: { title, description, type: "website", url: `https://dxm369.com/${config.slug}` },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `https://dxm369.com/${config.slug}` },
  };
}

export function generateComparisonFAQSchema(
  productA: string,
  productB: string,
  faqEntries: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqEntries.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  };
}

export function generateComparisonBreadcrumbSchema(
  productA: string,
  productB: string,
  category: string,
  slug: string
) {
  const categoryUrl = { gpu: "/gpus", cpu: "/cpus", laptop: "/laptops", ssd: "/storage", ram: "/memory" }[category] || `/${category}s`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dxm369.com" },
      { "@type": "ListItem", "position": 2, "name": category.toUpperCase(), "item": `https://dxm369.com${categoryUrl}` },
      { "@type": "ListItem", "position": 3, "name": `${productA} vs ${productB}`, "item": `https://dxm369.com/${slug}` }
    ]
  };
}

export function generateComparisonTableRows(config: ComparisonConfig) {
  return config.keyDifferences.map((diff, index) => ({
    id: `diff-${index}`,
    aspect: diff.aspect,
    productA: { label: config.productA, value: diff.productAValue },
    productB: { label: config.productB, value: diff.productBValue }
  }));
}

export function generateComparisonItemListSchema(config: ComparisonConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${config.productA} vs ${config.productB}`,
    description: `Detailed comparison of ${config.productA} vs ${config.productB} with specifications and analysis.`,
    url: `https://dxm369.com/${config.slug}`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: config.productA,
        url: `https://dxm369.com/${config.slug}#${config.productA.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: config.productB,
        url: `https://dxm369.com/${config.slug}#${config.productB.toLowerCase().replace(/\s+/g, '-')}`
      }
    ]
  };
}

export function generateComparisonPageData(config: ComparisonConfig) {
  return {
    metadata: generateComparisonMetadata(config),
    schema: {
      faq: generateComparisonFAQSchema(config.productA, config.productB, config.faqEntries),
      breadcrumb: generateComparisonBreadcrumbSchema(config.productA, config.productB, config.category, config.slug),
      itemList: generateComparisonItemListSchema(config)
    },
    table: generateComparisonTableRows(config),
    config
  };
}

export const COMPARISON_TEMPLATES = {
  ...gpuComparisons,
  ...cpuComparisons,
  ...ssdComparisons,
  ...ramComparisons,
  ...laptopComparisons,
};
