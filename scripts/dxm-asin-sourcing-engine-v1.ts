#!/usr/bin/env ts-node

/**
 * DXM ASIN Sourcing Engine v1.0 - WEAPONIZED EDITION
 * 
 * Multi-source ETL pipeline that normalizes datasets from:
 * - Kaggle Electronics 10K
 * - Kaggle 1.4M Amazon 2023
 * - GitHub ASIN/electronics datasets
 * 
 * Output: Single clean dxm_clean_products.json ready for bulk import
 * 
 * Execution:
 *   npx ts-node scripts/dxm-asin-sourcing-engine-v1.ts
 * 
 * Prerequisites:
 *   1. Kaggle CLI installed: pip install kaggle
 *   2. Kaggle token configured: ~/.config/kaggle/kaggle.json
 *   3. Data directory exists: ~/Documents/DXM_ASIN_Sourcing/data
 */

import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);

// ===== TYPE DEFINITIONS =====

export interface DXMProduct {
  asin: string;             // BXXXXXXXXX, valid regex
  category: string;         // gpu | cpu | storage | memory | monitor | laptop | psu | motherboard | mice | cooling
  title: string;
  brand?: string;
  price?: number | null;
  list_price?: number | null;
  image?: string | null;
  url?: string | null;
  source: "kaggle-10k" | "kaggle-1.4m" | "github" | "manual";
  rating?: number;
  review_count?: number;
}

interface BulkImportPayload {
  products: Array<{
    asin: string;
    category: string;
    title: string;
    brand?: string;
    price?: number;
    list_price?: number;
    image?: string;
    url?: string;
  }>;
}

// ===== CONFIGURATION =====

const ASIN_REGEX = /^B[0-9A-Z]{9}$/;
const DATA_DIR = path.join(process.env.HOME || '/home/dxm', 'Documents/DXM_ASIN_Sourcing/data');
const OUTPUT_DIR = path.join(process.env.HOME || '/home/dxm', 'Documents/DXM_ASIN_Sourcing/output');
const MAX_PER_CATEGORY: Record<string, number> = {
  gpu: 200,
  cpu: 200,
  storage: 200,
  memory: 200,
  monitor: 200,
  laptop: 200,
  motherboard: 150,
  psu: 150,
  cooling: 100,
  mice: 100,
};

// Category keyword mappings with priority (first match wins)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gpu: [
    'rtx 4090', 'rtx 4080', 'rtx 4070', 'rtx 4060', 'rtx 3090', 'rtx 3080', 'rtx 3070',
    'rx 7900', 'rx 7800', 'rx 7700', 'rx 7600', 'radeon rx', 'radeon 6900',
    'geforce rtx', 'geforce gtx', 'graphics card', 'video card', 'gpu', 'discrete gpu',
    'nvidia geforce', 'amd radeon', 'asus rog strix', 'msi gaming', 'gigabyte aorus',
  ],
  cpu: [
    'ryzen 9', 'ryzen 7', 'ryzen 5', 'threadripper', 'epyc',
    'core i9', 'core i7', 'core i5', 'core i3', 'xeon',
    'intel core', 'amd ryzen', 'processor', 'cpu',
  ],
  storage: [
    'nvme', 'm.2', 'ssd', 'solid state', 'samsung 990', 'samsung 980', 'wd black',
    'crucial mx', 'corsair mp600', 'seagate', 'kingston nv2', 'intel 670p',
    'sk hynix', 'storage', 'hdd', 'sata ssd',
  ],
  memory: [
    'ddr5', 'ddr4', 'ddr3', 'ram', 'memory', 'memory kit',
    'corsair dominator', 'corsair vengeance', 'g.skill trident', 'g.skill ripjaws',
    'kingston fury', 'patriot viper', 'crucial ballistix', 'teamgroup',
    'adata xpg', 'rgb memory', '32gb', '64gb',
  ],
  monitor: [
    'monitor', 'display', 'screen', '27"', '32"', '34"', 'ultrawide',
    '1440p', '4k', '144hz', '240hz', 'gaming monitor', 'curved', 'oled',
    'asus proart', 'lg ultragear', 'dell alienware', 'ips', 'va panel',
  ],
  laptop: [
    'laptop', 'notebook', 'macbook', 'ultrabook', 'gaming laptop',
    'dell xps', 'asus rog', 'msi stealth', 'lenovo legion', 'hp omen',
    'razer blade', 'alienware', 'surface book', 'thinkpad', 'inspiron',
  ],
  motherboard: [
    'motherboard', 'mobo', 'mainboard', 'b650', 'x670', 'z790', 'z690',
    'b550', 'x570', 'am5', 'lga1700', 'lga1200', 'asus rog', 'msi mpg',
  ],
  psu: [
    'power supply', 'psu', 'watt', 'modular', 'fully modular', 'semi modular',
    'gold rated', 'platinum', 'titanium', '80+', 'corsair rm', 'seasonic',
    'evga supernova', 'thermaltake toughpower',
  ],
  cooling: [
    'cooler', 'cooling', 'cpu cooler', 'liquid cooling', 'aio', 'air cooler',
    'tower cooler', 'noctua', 'arctic', 'be quiet', 'corsair h150i', 'kraken',
    'thermalright', 'deepcool',
  ],
  mice: [
    'mouse', 'mice', 'gaming mouse', 'wireless mouse', 'mechanical mouse',
    'rgb mouse', 'g502', 'deathadder', 'mamba', 'finalmouse', 'logitech',
    'corsair', 'steelseries', 'razer basilisk',
  ],
};

// ===== UTILITIES =====

function log(msg: string, icon = '📍') {
  console.log(`${icon} ${msg}`);
}

function validateASIN(asin: string): boolean {
  if (!asin) return false;
  return ASIN_REGEX.test(asin.trim().toUpperCase());
}

function classifyCategory(title: string, rawCategory?: string): string | null {
  const searchText = `${title} ${rawCategory || ''}`.toLowerCase();

  // Priority-based matching (first match wins)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // If no match, return null (will be filtered out)
  return null;
}

function extractBrand(title: string): string {
  const brands = [
    'Samsung', 'ASUS', 'MSI', 'Gigabyte', 'EVGA', 'Corsair', 'G.Skill',
    'Kingston', 'WD', 'Western Digital', 'Seagate', 'Intel', 'AMD', 'Nvidia',
    'Apple', 'Dell', 'HP', 'Lenovo', 'NZXT', 'Crucial', 'Patriot', 'PNY',
    'Palit', 'ZOTAC', 'Gainward', 'GeForce', 'Radeon', 'Ryzen', 'Core',
    'Asus', 'Noctua', 'Arctic', 'Thermaltake', 'Seasonic', 'Logitech',
    'Razer', 'SteelSeries', 'be quiet', 'DeepCool', 'Thermalright',
  ];

  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return 'Generic';
}

function parsePrice(priceStr: string | undefined): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, '📁');
  }
}

// ===== KAGGLE CLI HELPERS =====

async function checkKaggleCLI(): Promise<boolean> {
  try {
    await exec('which kaggle');
    return true;
  } catch {
    return false;
  }
}

async function downloadKaggleDataset(dataset: string, filename: string, outputDir: string): Promise<string | null> {
  try {
    log(`Downloading ${dataset}...`, '⬇️');
    const cmd = `kaggle datasets download -d ${dataset} -f ${filename} -p "${outputDir}" --unzip`;
    await exec(cmd);
    
    // Find the downloaded file
    const files = fs.readdirSync(outputDir);
    const downloaded = files.find(f => f.includes(filename) || f.endsWith('.csv') || f.endsWith('.parquet'));
    
    if (downloaded) {
      const filePath = path.join(outputDir, downloaded);
      log(`Downloaded: ${filePath}`, '✓');
      return filePath;
    }
    
    return null;
  } catch (error: any) {
    log(`Failed to download ${dataset}: ${error.message}`, '❌');
    return null;
  }
}

// ===== PARSERS PER SOURCE =====

function parseCSV(filePath: string, source: DXMProduct['source']): DXMProduct[] {
  log(`Parsing ${source}: ${filePath}`, '📂');

  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, '⚠️');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length === 0) {
    log(`Empty file: ${filePath}`, '⚠️');
    return [];
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Flexible column detection
  const asinIdx = header.findIndex(h => h.includes('asin'));
  const titleIdx = header.findIndex(h => h.includes('title') || h.includes('product') || h.includes('name'));
  const categoryIdx = header.findIndex(h => h.includes('category') || h.includes('type'));
  const priceIdx = header.findIndex(h => h.includes('price') && !h.includes('list'));
  const listPriceIdx = header.findIndex(h => h.includes('list') && h.includes('price'));
  const brandIdx = header.findIndex(h => h.includes('brand') || h.includes('manufacturer'));
  const imageIdx = header.findIndex(h => h.includes('image') || h.includes('img'));
  const urlIdx = header.findIndex(h => h.includes('url') || h.includes('link'));
  const ratingIdx = header.findIndex(h => h.includes('rating') || h.includes('stars'));
  const reviewsIdx = header.findIndex(h => h.includes('review') || h.includes('reviews'));

  if (asinIdx === -1 || titleIdx === -1) {
    log(`Missing required columns (asin, title) in ${filePath}`, '❌');
    return [];
  }

  const products: DXMProduct[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle CSV with quoted fields
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    
    const asin = cols[asinIdx]?.toUpperCase().trim();
    const title = cols[titleIdx]?.trim();

    if (!asin || !title) continue;
    if (!validateASIN(asin)) continue;
    if (seen.has(asin)) continue; // Dedup within file
    seen.add(asin);

    const rawCategory = categoryIdx >= 0 ? cols[categoryIdx] : undefined;
    const category = classifyCategory(title, rawCategory);

    if (!category) continue; // Skip if doesn't match our categories

    const product: DXMProduct = {
      asin,
      title,
      category,
      brand: brandIdx >= 0 ? cols[brandIdx] : extractBrand(title),
      price: parsePrice(cols[priceIdx]),
      list_price: parsePrice(cols[listPriceIdx]),
      image: imageIdx >= 0 ? cols[imageIdx] : null,
      url: urlIdx >= 0 ? cols[urlIdx] : null,
      source,
      rating: ratingIdx >= 0 ? parseFloat(cols[ratingIdx]) : undefined,
      review_count: reviewsIdx >= 0 ? parseInt(cols[reviewsIdx]) : undefined,
    };

    products.push(product);
  }

  log(`${source}: ${products.length} valid products extracted`, '✓');
  return products;
}

// ===== DEDUPLICATION & CAPPING =====

function deduplicateAndCap(all: DXMProduct[]): DXMProduct[] {
  log('Deduplicating and enforcing per-category caps...', '🧹');

  const seen = new Map<string, DXMProduct>(); // ASIN -> best product
  const byCat: Record<string, DXMProduct[]> = {};

  // First pass: dedup, keeping best product (with price & image)
  for (const product of all) {
    const existing = seen.get(product.asin);
    
    if (!existing) {
      seen.set(product.asin, product);
    } else {
      // Keep the one with more data (price + image > just title)
      const existingScore = (existing.price ? 1 : 0) + (existing.image ? 1 : 0);
      const newScore = (product.price ? 1 : 0) + (product.image ? 1 : 0);
      
      if (newScore > existingScore) {
        seen.set(product.asin, product);
      }
    }
  }

  // Second pass: group by category
  for (const product of seen.values()) {
    if (!byCat[product.category]) {
      byCat[product.category] = [];
    }
    byCat[product.category].push(product);
  }

  // Third pass: enforce caps
  const result: DXMProduct[] = [];
  for (const [category, products] of Object.entries(byCat)) {
    const cap = MAX_PER_CATEGORY[category] || 200;
    const capped = products.slice(0, cap);
    result.push(...capped);
    log(`${category}: ${capped.length}/${products.length} (capped at ${cap})`);
  }

  log(`Total deduplicated: ${result.length}`, '✓');
  return result;
}

// ===== FORMAT FOR INGESTION =====

function formatForIngestion(products: DXMProduct[]): BulkImportPayload {
  return {
    products: products.map(p => ({
      asin: p.asin,
      category: p.category,
      title: p.title,
      brand: p.brand,
      price: p.price ?? undefined,
      list_price: p.list_price ?? undefined,
      image: p.image ?? undefined,
      url: p.url ?? undefined,
    })),
  };
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('\n🚀 DXM ASIN SOURCING ENGINE v1.0 - WEAPONIZED EDITION\n');

  try {
    // Setup directories
    ensureDirectory(DATA_DIR);
    ensureDirectory(OUTPUT_DIR);

    // Check Kaggle CLI
    const hasKaggle = await checkKaggleCLI();
    if (!hasKaggle) {
      log('⚠️  Kaggle CLI not found. Install with: pip install kaggle', '⚠️');
      log('   Proceeding with local files only...', '');
    }

    const allProducts: DXMProduct[] = [];

    // === SOURCE 1: Kaggle Electronics 10K ===
    log('\n📊 SOURCE 1: Kaggle Electronics 10K', '');
    
    if (hasKaggle) {
      const kaggle10kDir = path.join(DATA_DIR, 'kaggle-10k');
      ensureDirectory(kaggle10kDir);
      
      const filePath = await downloadKaggleDataset(
        'akeshkumarhp/electronics-products-amazon-10k-items',
        'electronics_data.csv',
        kaggle10kDir
      );
      
      if (filePath) {
        allProducts.push(...parseCSV(filePath, 'kaggle-10k'));
      }
    } else {
      // Try local file
      const localPath = path.join(DATA_DIR, 'electronics_data.csv');
      if (fs.existsSync(localPath)) {
        allProducts.push(...parseCSV(localPath, 'kaggle-10k'));
      }
    }

    // === SOURCE 2: Kaggle 1.4M Amazon 2023 ===
    log('\n📊 SOURCE 2: Kaggle 1.4M Amazon 2023', '');
    
    if (hasKaggle) {
      const kaggle14mDir = path.join(DATA_DIR, 'kaggle-1.4m');
      ensureDirectory(kaggle14mDir);
      
      const filePath = await downloadKaggleDataset(
        'asaniczka/amazon-products-dataset-2023-1-4m-products',
        'amazon_products_2023.csv',
        kaggle14mDir
      );
      
      if (filePath) {
        // Sample large dataset (take every Nth row)
        const products = parseCSV(filePath, 'kaggle-1.4m');
        const sampled = products.filter((_, i) => i % Math.max(1, Math.floor(products.length / 5000)) === 0);
        allProducts.push(...sampled);
        log(`Sampled ${sampled.length} from ${products.length} total`, '📊');
      }
    } else {
      // Try local file
      const localPath = path.join(DATA_DIR, 'amazon_products_2023.csv');
      if (fs.existsSync(localPath)) {
        const products = parseCSV(localPath, 'kaggle-1.4m');
        const sampled = products.filter((_, i) => i % Math.max(1, Math.floor(products.length / 5000)) === 0);
        allProducts.push(...sampled);
      }
    }

    // === SOURCE 3: GitHub Datasets ===
    log('\n📊 SOURCE 3: GitHub Datasets', '');
    
    const gitHubDir = path.join(DATA_DIR, 'github-electronics');
    if (fs.existsSync(gitHubDir)) {
      const csvFiles = fs.readdirSync(gitHubDir).filter(f => f.endsWith('.csv'));
      
      for (const file of csvFiles) {
        const filePath = path.join(gitHubDir, file);
        allProducts.push(...parseCSV(filePath, 'github'));
      }
    } else {
      log(`GitHub directory not found: ${gitHubDir}`, '⚠️');
    }

    // Summary
    log(`\n📊 Total products from all sources: ${allProducts.length}`, '');

    if (allProducts.length === 0) {
      log('⚠️  No products found from any source.', '❌');
      log(`   Expected data directory: ${DATA_DIR}`, '📂');
      log(`   Install Kaggle CLI: pip install kaggle`, '');
      log(`   Configure token: ~/.config/kaggle/kaggle.json`, '');
      return;
    }

    // Dedup and cap
    const cleaned = deduplicateAndCap(allProducts);

    // Format for ingestion
    const payload = formatForIngestion(cleaned);

    // Write output
    const outputPath = path.join(OUTPUT_DIR, 'dxm_clean_products.json');
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

    // Summary report
    const bySource: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    
    for (const p of cleaned) {
      bySource[p.source] = (bySource[p.source] || 0) + 1;
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    }

    console.log('\n✅ COMPLETE\n');
    console.log(`📦 Products ready: ${payload.products.length}`);
    console.log(`📁 Output: ${outputPath}\n`);
    
    console.log('📊 By Source:');
    for (const [source, count] of Object.entries(bySource)) {
      console.log(`   ${source}: ${count}`);
    }
    
    console.log('\n📊 By Category:');
    for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${cat}: ${count}`);
    }

    console.log('\n👉 Next: Ingest with:');
    console.log(`curl -X POST http://localhost:3002/api/admin/products/bulkImport \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "x-admin-key: ${process.env.ADMIN_SECRET || 'ak3693'}" \\`);
    console.log(`  --data @${outputPath}\n`);

  } catch (error: any) {
    log(`FAILED: ${error.message}`, '❌');
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();

