// src/app/sitemap.ts
// Dynamic XML Sitemap Generation for DXM369
// Optimized for search engine discovery and indexing

import { MetadataRoute } from 'next';
import { getGpuDeals, getCpuDeals, getLaptopDeals } from '@/lib/dealRadar';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dxm369.com';
  
  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gpus`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cpus`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/laptops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
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

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}