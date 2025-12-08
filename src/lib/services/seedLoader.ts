// src/lib/services/seedLoader.ts
// Server-side seed data loader with caching
// Provides fallback ASIN data when Amazon PA-API is unavailable

import { DealRadarItem, HardwareCategory } from '@/lib/dealRadarTypes';
import fs from 'fs';
import path from 'path';

interface SeedProduct {
  asin: string;
  title: string;
  brand: string;
  category: HardwareCategory;
  price: number;
  previousPrice?: number;
  dxmScore: number;
  vram?: string;
  tdp?: string;
  boostClock?: string;
  baseClock?: string;
  cores?: string;
  threads?: string;
  memory?: string;
  storage?: string;
  display?: string;
  imageUrl?: string;
  domain?: 'com' | 'sa' | 'ae';
  tags?: string[];
  availability?: string;
  primeEligible?: boolean;
  vendor?: string;
}

interface SeedData {
  version: string;
  mode: string;
  lastUpdated: string;
  products: {
    [key: string]: SeedProduct[];
  };
}

let cachedSeedData: SeedData | null = null;

/**
 * Load seed data from JSON file with in-memory caching
 */
export async function loadSeedData(): Promise<SeedData> {
  if (cachedSeedData) {
    return cachedSeedData;
  }

  try {
    const seedPath = path.join(process.cwd(), 'data', 'asin-seed.json');
    const seedContent = fs.readFileSync(seedPath, 'utf-8');
    const parsed = JSON.parse(seedContent) as SeedData;
    cachedSeedData = parsed;
    return parsed;
  } catch (error) {
    console.error('Failed to load seed data:', error);
    const fallback: SeedData = {
      version: '1.0',
      mode: 'error',
      lastUpdated: new Date().toISOString(),
      products: {},
    };
    return fallback;
  }
}

/**
 * Find a product by ASIN across all categories
 */
export async function findSeedProduct(
  asin: string,
  category?: HardwareCategory
): Promise<SeedProduct | null> {
  const seedData = await loadSeedData();

  if (category && seedData.products[category]) {
    const product = seedData.products[category].find((p) => p.asin === asin);
    if (product) return product;
  }

  // Search all categories if category not specified or product not found
  for (const categoryProducts of Object.values(seedData.products)) {
    const product = categoryProducts.find((p) => p.asin === asin);
    if (product) return product;
  }

  return null;
}

/**
 * Convert seed product to DealRadarItem
 */
export function transformSeedProductToDealRadar(
  product: SeedProduct
): DealRadarItem {
  // Normalize availability value
  let availability: 'In Stock' | 'Limited Stock' | 'Out of Stock' | undefined = undefined;
  if (product.availability === 'In Stock' || product.availability === 'Limited Stock' || product.availability === 'Out of Stock') {
    availability = product.availability;
  }

  // Convert prices from cents to dollars (seed data stores in cents)
  const price = product.price > 100 ? product.price / 100 : product.price;
  const previousPrice = product.previousPrice && product.previousPrice > 100 ? product.previousPrice / 100 : product.previousPrice;

  return {
    id: `seed-${product.asin}`,
    asin: product.asin,
    title: product.title,
    brand: product.brand,
    category: product.category,
    price,
    previousPrice,
    dxmScore: product.dxmScore,
    vram: product.vram,
    tdp: product.tdp,
    boostClock: product.boostClock,
    baseClock: product.baseClock,
    cores: product.cores,
    threads: product.threads,
    memory: product.memory,
    storage: product.storage,
    display: product.display,
    imageUrl: product.imageUrl,
    domain: product.domain || 'com',
    tags: product.tags,
    availability,
    primeEligible: product.primeEligible,
    vendor: product.vendor,
  };
}

/**
 * Get all products for a category from seed data
 */
export async function getSeedProductsByCategory(
  category: HardwareCategory
): Promise<SeedProduct[]> {
  const seedData = await loadSeedData();
  return seedData.products[category] || [];
}

/**
 * Clear seed cache (useful for testing)
 */
export function clearSeedCache(): void {
  cachedSeedData = null;
}
