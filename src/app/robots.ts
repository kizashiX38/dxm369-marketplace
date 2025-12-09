// src/app/robots.ts
// Robots.txt generation for DXM369
// Optimized for search engine crawling and affiliate revenue

import { MetadataRoute } from 'next';
import { appConfig } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/temp/',
          '*.json',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl,
  };
}