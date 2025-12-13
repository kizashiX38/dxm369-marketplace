// src/app/sitemap.ts
// Dynamic XML Sitemap Generation for DXM369
// Optimized for search engine discovery and indexing

import { MetadataRoute } from 'next';
import { getGpuDeals, getCpuDeals, getLaptopDeals } from '@/lib/dealRadar';
import { appConfig } from '@/lib/env';
import { COMPARISON_TEMPLATES } from '@/lib/comparisonPageGenerator';

// All valid category slugs - sync with [category]/page.tsx CATEGORY_CONFIG
const CATEGORY_SLUGS = [
  'gpus', 'cpus', 'laptops', 'monitors',
  'keyboards', 'mice', 'headsets',
  'drops', 'new', 'bestsellers',
  'webcams', 'speakers', 'gaming-laptops',
  'prebuilt', 'chairs', 'streaming',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = appConfig.siteUrl;

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Category pages - all categories get indexed
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  // Comparison pages
  const comparisonPages: MetadataRoute.Sitemap = Object.values(COMPARISON_TEMPLATES).map((config) => ({
    url: `${baseUrl}/${config.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Dynamic product pages
  // Gracefully handle API failures - return static pages only if API unavailable
  try {
    const [gpuDeals, cpuDeals, laptopDeals] = await Promise.all([
      getGpuDeals().catch(() => []),
      getCpuDeals().catch(() => []),
      getLaptopDeals().catch(() => [])
    ]);

    const productPages: MetadataRoute.Sitemap = [
      ...gpuDeals.map(deal => ({
        url: `${baseUrl}/deals/${deal.asin}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
      ...cpuDeals.map(deal => ({
        url: `${baseUrl}/deals/${deal.asin}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
      ...laptopDeals.map(deal => ({
        url: `${baseUrl}/deals/${deal.asin}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
    ];

    return [...staticPages, ...categoryPages, ...comparisonPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...staticPages, ...categoryPages, ...comparisonPages];
  }
}