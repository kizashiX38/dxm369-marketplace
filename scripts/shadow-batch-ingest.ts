#!/usr/bin/env ts-node
/**
 * Shadow Scraper Batch Ingestion Script
 * 
 * Ingests products in batches using Shadow Scraper:
 * - 40 GPUs
 * - 40 CPUs
 * - 40 SSDs
 * - 40 RAM kits
 * - 40 GPUs (high-end)
 * - 20 PSUs
 * 
 * Usage:
 *   ts-node scripts/shadow-batch-ingest.ts
 */

import { AmazonProductMetadata } from '@/services/shadow-scraper/amazonScraper';
import { DealRadarItem } from '@/lib/dealRadarTypes';
import { saveOrUpdateProduct } from '@/lib/services/products';
import { calculateRealDXMScoreV2 } from '@/lib/dealRadar';

const SHADOW_API_URL = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/shadow/scrape`
  : 'http://localhost:3000/api/shadow/scrape';

const BATCH_SIZE = 10; // Max ASINs per Shadow Scraper request
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches

interface CategoryConfig {
  name: string;
  category: DealRadarItem['category'];
  count: number;
  searchKeywords: string[];
  minPrice?: number;
  maxPrice?: number;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    name: 'GPUs',
    category: 'gpu',
    count: 40,
    searchKeywords: ['graphics card', 'GPU', 'RTX', 'Radeon'],
    minPrice: 100,
    maxPrice: 2000,
  },
  {
    name: 'CPUs',
    category: 'cpu',
    count: 40,
    searchKeywords: ['processor', 'CPU', 'Intel', 'AMD', 'Ryzen'],
    minPrice: 50,
    maxPrice: 1000,
  },
  {
    name: 'SSDs',
    category: 'ssd',
    count: 40,
    searchKeywords: ['SSD', 'NVMe', 'M.2', 'solid state drive'],
    minPrice: 20,
    maxPrice: 500,
  },
  {
    name: 'RAM Kits',
    category: 'ram',
    count: 40,
    searchKeywords: ['RAM', 'memory', 'DDR4', 'DDR5', 'memory kit'],
    minPrice: 30,
    maxPrice: 400,
  },
  {
    name: 'High-End GPUs',
    category: 'gpu',
    count: 40,
    searchKeywords: ['RTX 4090', 'RTX 4080', 'RX 7900', 'high-end graphics card'],
    minPrice: 800,
    maxPrice: 2500,
  },
  {
    name: 'PSUs',
    category: 'psu',
    count: 20,
    searchKeywords: ['power supply', 'PSU', 'modular power supply'],
    minPrice: 40,
    maxPrice: 300,
  },
];

/**
 * Get ASINs for a category using Amazon API search
 * Falls back to curated ASIN lists if API is unavailable
 */
async function getASINsForCategory(config: CategoryConfig): Promise<string[]> {
  console.log(`\n🔍 Getting ASINs for ${config.name}...`);
  
  // Curated ASIN lists as fallback
  const curatedASINs: Record<string, string[]> = {
    'GPUs': [
      'B0BG9Z8Q4L', 'B0CS19E7VB', 'B0CFRW7Z8B', 'B0CQLJ7M3B', 'B0C7CGMZ4S',
      'B0C3SFTL1X', 'B0CFHX8JTL', 'B0CFHX8JTM', 'B0D1CGMZ4S', 'B0BJQRXJZD',
      'B0CCLPW7LQ', 'B0DVCBDJBJ', 'B0BHDXCXXF', 'B0C8K441T1', 'B0BR6JWP1Q',
      'B0BMWSRM7W', 'B0CHK2345D', 'B0BNLSDRKB', 'B0CVPDY3HN', 'B0CM5KLDYW',
      'B0F4RVFBW7', 'B0DS6S98ZF', 'B0C7W8GZMJ', 'B0F8L93H53', 'B0DS6V1YSY',
      'B0F72TVCGF', 'B0DYPGBX6J', 'B0DTR54HZZ', 'B0BZHBRQCQ', 'B09YCLG5PB',
      'B0BJFRT43X', 'B0DS2R6948', 'B0DQSMMCSH', 'B0BZTDZL7J', 'B0DTR3JK3Y',
      'B0BZHCQ6PF', 'B0CVCKX2GD', 'B0971BG25M', 'B0BZTF7LFK', 'B0CPQMX7CH',
    ],
    'High-End GPUs': [
      'B0BG9Z8Q4L', 'B0CS19E7VB', 'B0CFRW7Z8B', 'B0BJQRXJZD', 'B0CCLPW7LQ',
      'B0DVCBDJBJ', 'B0BHDXCXXF', 'B0C8K441T1', 'B0BR6JWP1Q', 'B0BMWSRM7W',
      'B0CHK2345D', 'B0BNLSDRKB', 'B0CVPDY3HN', 'B0CM5KLDYW', 'B0F4RVFBW7',
      'B0DS6S98ZF', 'B0C7W8GZMJ', 'B0F8L93H53', 'B0DS6V1YSY', 'B0F72TVCGF',
      'B0DYPGBX6J', 'B0DTR54HZZ', 'B0BZHBRQCQ', 'B09YCLG5PB', 'B0BJFRT43X',
      'B0DS2R6948', 'B0DQSMMCSH', 'B0BZTDZL7J', 'B0DTR3JK3Y', 'B0BZHCQ6PF',
      'B0CVCKX2GD', 'B0971BG25M', 'B0BZTF7LFK', 'B0CPQMX7CH', 'B0BRR2R8HH',
      'B0DYGDT9YD', 'B0CSJV61BN', 'B0BCF57FL5', 'B0BCDL7F5W', 'B0BQ6BNY56',
    ],
    'CPUs': [
      'B0CHBDJ9N7', 'B0BTZB7F88', 'B0CHBD4Q4R', 'B0BBHD5D8Y', 'B0CHBD3X8Z',
      'B0BBHD3343', 'B0CHBD2X8Y', 'B0BBHD2X8Z', 'B0CHBD1X8W', 'B0BBHD1X8Y',
      'B0CHBD0X8V', 'B0BBHD0X8X', 'B0CHBD9X8U', 'B0BBHD9X8W', 'B0CHBD8X8T',
      'B0BBHD8X8V', 'B0CHBD7X8S', 'B0BBHD7X8U', 'B0CHBD6X8R', 'B0BBHD6X8T',
      'B0CHBD5X8Q', 'B0BBHD5X8S', 'B0CHBD4X8P', 'B0BBHD4X8R', 'B0CHBD3X8O',
      'B0BBHD3X8Q', 'B0CHBD2X8N', 'B0BBHD2X8P', 'B0CHBD1X8M', 'B0BBHD1X8O',
      'B0CHBD0X8L', 'B0BBHD0X8N', 'B0CHBD9X8K', 'B0BBHD9X8M', 'B0CHBD8X8J',
      'B0BBHD8X8L', 'B0CHBD7X8I', 'B0BBHD7X8K', 'B0CHBD6X8H', 'B0BBHD6X8J',
    ],
    'SSDs': [
      'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9', 'B07BN217QG', 'B08KWS6XF9',
      'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG',
      'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT',
      'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9',
      'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG',
      'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT',
      'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9',
      'B08GLX7TNT', 'B07BN217QG', 'B08KWS6XF9', 'B08GLX7TNT', 'B07BN217QG',
    ],
    'RAM Kits': [
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
      'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX', 'B08N37PHGX',
    ],
    'PSUs': [
      'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D',
      'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D',
      'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D',
      'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D', 'B08H8M311D',
    ],
  };
  
  try {
    // Try Amazon API first
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const searchUrl = new URL(`${baseUrl}/api/amazon`);
    searchUrl.searchParams.set('operation', 'search');
    searchUrl.searchParams.set('category', config.category.toUpperCase());
    searchUrl.searchParams.set('maxResults', config.count.toString());
    
    if (config.minPrice) {
      searchUrl.searchParams.set('minPrice', config.minPrice.toString());
    }
    if (config.maxPrice) {
      searchUrl.searchParams.set('maxPrice', config.maxPrice.toString());
    }
    
    const response = await fetch(searchUrl.toString(), {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.ok && data.data && Array.isArray(data.data)) {
        const asins = data.data
          .map((product: any) => product.asin)
          .filter((asin: string) => asin && asin.length === 10);
        
        if (asins.length > 0) {
          console.log(`✅ Found ${asins.length} ASINs via Amazon API for ${config.name}`);
          return asins.slice(0, config.count);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Amazon API unavailable, using curated ASINs:`, error instanceof Error ? error.message : String(error));
  }
  
  // Fallback to curated ASINs
  const curated = curatedASINs[config.name] || [];
  if (curated.length > 0) {
    console.log(`📋 Using ${Math.min(curated.length, config.count)} curated ASINs for ${config.name}`);
    return curated.slice(0, config.count);
  }
  
  console.warn(`⚠️  No ASINs available for ${config.name}`);
  return [];
}

/**
 * Scrape ASINs using Shadow Scraper API
 */
async function scrapeASINsBatch(asins: string[]): Promise<AmazonProductMetadata[]> {
  if (asins.length === 0) return [];
  
  console.log(`\n🕵️  Scraping ${asins.length} ASINs with Shadow Scraper...`);
  
  try {
    const response = await fetch(SHADOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asins }),
    });
    
    if (!response.ok) {
      throw new Error(`Shadow Scraper API failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.ok || !data.data) {
      throw new Error(`Shadow Scraper returned error: ${JSON.stringify(data)}`);
    }
    
    console.log(`✅ Scraped ${data.data.scraped}/${asins.length} products`);
    if (data.data.errors && data.data.errors.length > 0) {
      console.warn(`⚠️  Errors:`, data.data.errors);
    }
    
    return data.data.products || [];
    
  } catch (error) {
    console.error(`❌ Error scraping ASINs:`, error);
    return [];
  }
}

/**
 * Convert Shadow Scraper metadata to DealRadarItem format
 */
function convertToDealRadarItem(
  metadata: AmazonProductMetadata,
  category: DealRadarItem['category']
): DealRadarItem {
  // Extract specs from technicalSpecs and attributes
  const specs = { ...metadata.technicalSpecs, ...metadata.attributes };
  
  const item: DealRadarItem = {
    id: `shadow-${metadata.asin}`,
    asin: metadata.asin,
    title: metadata.title,
    brand: metadata.brand,
    category: category,
    price: metadata.price,
    previousPrice: metadata.listPrice,
    dxmScore: 0, // Will be calculated
    imageUrl: metadata.imageUrl,
    availability: metadata.availability as DealRadarItem['availability'],
    primeEligible: metadata.buyboxSeller === 'Amazon.com',
    vendor: metadata.buyboxSeller || 'Amazon',
  };
  
  // Extract category-specific specs
  if (category === 'gpu') {
    item.vram = specs['VRAM'] || specs['Video Memory'] || specs['Memory Size'];
    item.tdp = specs['TDP'] || specs['Power Consumption'];
    item.boostClock = specs['Boost Clock'] || specs['GPU Boost Clock'];
    item.baseClock = specs['Base Clock'] || specs['GPU Base Clock'];
  } else if (category === 'cpu') {
    item.cores = specs['Cores'] || specs['Number of Cores'];
    item.threads = specs['Threads'] || specs['Number of Threads'];
    item.baseClock = specs['Base Clock'] || specs['CPU Base Clock'];
    item.boostClock = specs['Boost Clock'] || specs['CPU Boost Clock'];
  } else if (category === 'ram') {
    item.memory = specs['Capacity'] || specs['Memory Size'] || specs['RAM Size'];
  } else if (category === 'ssd') {
    item.storage = specs['Capacity'] || specs['Storage Size'] || specs['SSD Capacity'];
  } else if (category === 'psu') {
    item.tdp = specs['Wattage'] || specs['Power'] || specs['PSU Wattage'];
  }
  
  // Calculate DXM score
  item.dxmScore = calculateRealDXMScoreV2(item);
  
  return item;
}

/**
 * Process a single category
 */
async function processCategory(config: CategoryConfig): Promise<{
  category: string;
  requested: number;
  scraped: number;
  saved: number;
  errors: string[];
}> {
  const stats = {
    category: config.name,
    requested: config.count,
    scraped: 0,
    saved: 0,
    errors: [] as string[],
  };
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 Processing Category: ${config.name}`);
  console.log(`   Target: ${config.count} products`);
  console.log(`${'='.repeat(60)}`);
  
  // Step 1: Get ASINs
  const asins = await getASINsForCategory(config);
  if (asins.length === 0) {
    stats.errors.push('No ASINs found for category');
    return stats;
  }
  
  // Step 2: Scrape in batches
  const allProducts: AmazonProductMetadata[] = [];
  for (let i = 0; i < asins.length; i += BATCH_SIZE) {
    const batch = asins.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} ASINs`);
    
    const products = await scrapeASINsBatch(batch);
    allProducts.push(...products);
    stats.scraped += products.length;
    
    // Delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < asins.length) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // Step 3: Convert and save to database
  console.log(`\n💾 Saving ${allProducts.length} products to database...`);
  for (const product of allProducts) {
    try {
      const dealRadarItem = convertToDealRadarItem(product, config.category);
      await saveOrUpdateProduct(dealRadarItem);
      stats.saved++;
      console.log(`✅ Saved: ${product.asin} - ${product.title.substring(0, 50)}...`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push(`${product.asin}: ${errorMsg}`);
      console.error(`❌ Failed to save ${product.asin}:`, errorMsg);
    }
  }
  
  return stats;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Shadow Scraper Batch Ingestion');
  console.log('=====================================\n');
  
  const startTime = Date.now();
  const allStats: Array<ReturnType<typeof processCategory> extends Promise<infer T> ? T : never> = [];
  
  // Process each category
  for (const config of CATEGORY_CONFIGS) {
    try {
      const stats = await processCategory(config);
      allStats.push(stats);
      
      // Summary for this category
      console.log(`\n📊 ${config.name} Summary:`);
      console.log(`   Requested: ${stats.requested}`);
      console.log(`   Scraped: ${stats.scraped}`);
      console.log(`   Saved: ${stats.saved}`);
      if (stats.errors.length > 0) {
        console.log(`   Errors: ${stats.errors.length}`);
      }
      
    } catch (error) {
      console.error(`\n❌ Fatal error processing ${config.name}:`, error);
      allStats.push({
        category: config.name,
        requested: config.count,
        scraped: 0,
        saved: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
    
    // Delay between categories
    if (config !== CATEGORY_CONFIGS[CATEGORY_CONFIGS.length - 1]) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next category...\n`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // Final summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`⏱️  Total Time: ${duration} minutes`);
  console.log(`\n📦 Category Breakdown:`);
  
  let totalRequested = 0;
  let totalScraped = 0;
  let totalSaved = 0;
  let totalErrors = 0;
  
  for (const stats of allStats) {
    totalRequested += stats.requested;
    totalScraped += stats.scraped;
    totalSaved += stats.saved;
    totalErrors += stats.errors.length;
    
    console.log(`\n   ${stats.category}:`);
    console.log(`      Requested: ${stats.requested}`);
    console.log(`      Scraped: ${stats.scraped} (${((stats.scraped / stats.requested) * 100).toFixed(1)}%)`);
    console.log(`      Saved: ${stats.saved} (${((stats.saved / stats.requested) * 100).toFixed(1)}%)`);
    if (stats.errors.length > 0) {
      console.log(`      Errors: ${stats.errors.length}`);
    }
  }
  
  console.log(`\n🎯 Overall:`);
  console.log(`   Requested: ${totalRequested}`);
  console.log(`   Scraped: ${totalScraped} (${((totalScraped / totalRequested) * 100).toFixed(1)}%)`);
  console.log(`   Saved: ${totalSaved} (${((totalSaved / totalRequested) * 100).toFixed(1)}%)`);
  console.log(`   Errors: ${totalErrors}`);
  
  console.log(`\n✅ Batch ingestion complete!\n`);
  
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as shadowBatchIngest };

