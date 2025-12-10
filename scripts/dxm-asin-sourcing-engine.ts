#!/usr/bin/env ts-node

/**
 * DXM ASIN Sourcing Engine v1.0
 *
 * Multi-source ETL pipeline:
 * Kaggle 10K Electronics → DXMProduct
 * Kaggle 1.4M Amazon 2023 → DXMProduct
 * GitHub ASIN datasets → DXMProduct
 *
 * Output: Single clean dxm_clean_products.json ready for bulk import
 *
 * Execution: npx ts-node scripts/dxm-asin-sourcing-engine.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';

// ===== TYPE DEFINITIONS =====
interface DXMProduct {
  asin: string;
  category: string;
  title: string;
  brand?: string;
  price?: number | null;
  list_price?: number | null;
  image?: string | null;
  url?: string | null;
  source: 'kaggle-10k' | 'kaggle-1.4m' | 'github' | 'manual';
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
  }>;
}

// ===== CONFIGURATION =====
const ASIN_REGEX = /^B[0-9A-Z]{9}$/;
const DATA_DIR = path.join(process.env.HOME || '/home/dxm', 'Documents/DXM_ASIN_Sourcing/data');
const OUTPUT_DIR = '/tmp/dxm-asin-engine';
const MAX_PER_CATEGORY = 250; // Cap per category initially

// Category keyword mappings
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gpu: [
    'gpu', 'graphics card', 'video card', 'rtx', 'geforce', 'radeon', 'rx',
    'amd ryzen', 'nvidia', 'asus', 'msi', 'gigabyte', 'evga', 'palit',
    '4090', '4080', '4070', '4060', '7900', '7800', 'graphics',
  ],
  cpu: [
    'cpu', 'processor', 'ryzen', 'core i', 'xeon', 'threadripper', 'epyc',
    'intel', 'amd', 'i9', 'i7', 'i5', '9950x', '7950x', '7900x',
  ],
  storage: [
    'ssd', 'nvme', 'storage', 'solid state', 'hdd', 'm.2', 'sata', 'nand',
    'samsung 990', 'wd black', 'crucial', 'corsair mp600', 'seagate',
    'kingston', 'intel 670p', 'sk hynix',
  ],
  memory: [
    'ram', 'memory', 'ddr5', 'ddr4', 'ddr3', 'corsair dominator', 'g.skill',
    'kingston fury', 'patriot viper', 'crucial ballistix', 'team xtreem',
    'adata xpg', 'rgb memory', 'memory kit',
  ],
  monitor: [
    'monitor', 'display', 'screen', '27\"', '32\"', '34\"', '1440p', '4k',
    'ultrawide', '144hz', '240hz', 'gaming monitor', 'curved', 'oled',
    'asus proart', 'lg ultraear', 'dell alienware', 'ips', 'va', 'tn',
  ],
  laptop: [
    'laptop', 'notebook', 'macbook', 'ultrabook', 'gaming laptop',
    'dell xps', 'asus rog', 'msi stealth', 'lenovo legion', 'hp omen',
    'razer blade', 'alienware', 'surface book', 'thinkpad', 'inspiron',
  ],
  motherboard: [
    'motherboard', 'mobo', 'mainboard', 'b650', 'x670', 'z790', 'z690',
    'b550', 'x570', 'am5', 'lga1700', 'Intel', 'AMD', 'asus rog',
  ],
  psu: [
    'power supply', 'psu', 'watt', 'modular', 'fully modular', 'semi modular',
    'gold rated', 'platinum', 'titanium', '80+', 'corsair', 'seasonic',
    'evga supernova', 'thermaltake',
  ],
  cooling: [
    'cooler', 'cooling', 'cpu cooler', 'liquid cooling', 'aio', 'air cooler',
    'tower cooler', 'noctua', 'arctic', 'be quiet', 'corsair h150i',
    'kraken', 'thermalright',
  ],
  mice: [
    'mouse', 'mice', 'gaming mouse', 'wireless', 'mechanical', 'rgb',
    'g502', 'deathadder', 'mamba', 'finalmouse', 'logtech', 'corsair',
    'steelseries', 'razer basilisk',
  ],
};

// ===== UTILITIES =====
function log(msg: string, icon = '📍') {
  console.log(`${icon} ${msg}`);
}

function validateASIN(asin: string): boolean {
  return ASIN_REGEX.test(asin.trim().toUpperCase());
}

function classifyCategory(title: string, rawCategory?: string): string {
  const searchText = `${title} ${rawCategory || ''}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'storage'; // Safe default
}

function extractBrand(title: string): string {
  const brands = [
    'Samsung', 'ASUS', 'MSI', 'Gigabyte', 'EVGA', 'Corsair', 'G.Skill',
    'Kingston', 'WD', 'Seagate', 'Intel', 'AMD', 'Nvidia', 'Apple', 'Dell',
    'HP', 'Lenovo', 'NZXT', 'Crucial', 'Patriot', 'PNY', 'Palit', 'ZOTAC',
    'Gainward', 'GeForce', 'Radeon', 'Ryzen', 'Core', 'Asus', 'Noctua',
    'Arctic', 'Thermaltake', 'Seasonic', 'Logitech', 'Razer', 'SteelSeries',
  ];

  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return 'Generic';
}

function ensureDirectory() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// ===== PARSERS PER SOURCE =====

function parseKaggle10K(filePath: string): DXMProduct[] {
  log(`Parsing Kaggle 10K: ${filePath}`, '📂');

  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, '⚠️');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());

  const asinIdx = header.findIndex(h => h.includes('asin'));
  const titleIdx = header.findIndex(h => h.includes('title') || h.includes('product'));
  const categoryIdx = header.findIndex(h => h.includes('category'));
  const priceIdx = header.findIndex(h => h.includes('price'));
  const brandIdx = header.findIndex(h => h.includes('brand'));
  const imageIdx = header.findIndex(h => h.includes('image') || h.includes('url'));

  const products: DXMProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const cols = lines[i].split(',').map(c => c.trim());
    const asin = cols[asinIdx]?.toUpperCase();
    const title = cols[titleIdx];

    if (!asin || !validateASIN(asin) || !title) continue;

    const product: DXMProduct = {
      asin,
      title,
      category: classifyCategory(title, cols[categoryIdx]),
      brand: cols[brandIdx] || extractBrand(title),
      price: cols[priceIdx] ? parseFloat(cols[priceIdx]) : null,
      image: cols[imageIdx] || null,
      source: 'kaggle-10k',
    };

    products.push(product);
  }

  log(`Kaggle 10K: ${products.length} valid products extracted`, '✓');
  return products;
}

function parseKaggle14M(filePath: string): DXMProduct[] {
  log(`Parsing Kaggle 1.4M: ${filePath}`, '📂');

  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, '⚠️');
    return [];
  }

  // Sample-based parsing (1.4M is huge)
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());

  const asinIdx = header.findIndex(h => h.includes('asin'));
  const titleIdx = header.findIndex(h => h.includes('title'));
  const categoryIdx = header.findIndex(h => h.includes('category'));
  const priceIdx = header.findIndex(h => h.includes('price'));

  const products: DXMProduct[] = [];
  const samplingRate = Math.max(1, Math.floor(lines.length / 5000)); // Cap at ~5000 samples

  for (let i = 1; i < lines.length; i += samplingRate) {
    if (!lines[i].trim()) continue;

    const cols = lines[i].split(',').map(c => c.trim());
    const asin = cols[asinIdx]?.toUpperCase();
    const title = cols[titleIdx];
    const rawCategory = cols[categoryIdx];

    if (!asin || !validateASIN(asin) || !title) continue;

    // Only keep if it matches electronics/hardware vertical
    const dxmCat = classifyCategory(title, rawCategory);
    if (!dxmCat) continue;

    const product: DXMProduct = {
      asin,
      title,
      category: dxmCat,
      brand: extractBrand(title),
      price: cols[priceIdx] ? parseFloat(cols[priceIdx]) : null,
      source: 'kaggle-1.4m',
    };

    products.push(product);
  }

  log(`Kaggle 1.4M: ${products.length} valid products extracted (sampled)`, '✓');
  return products;
}

function parseGitHub(dirPath: string): DXMProduct[] {
  log(`Parsing GitHub datasets from: ${dirPath}`, '📂');

  if (!fs.existsSync(dirPath)) {
    log(`Directory not found: ${dirPath}`, '⚠️');
    return [];
  }

  const products: DXMProduct[] = [];
  const csvFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.csv'));

  for (const file of csvFiles) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());

    const asinIdx = header.findIndex(h => h.includes('asin'));
    const titleIdx = header.findIndex(h => h.includes('title') || h.includes('name'));
    const categoryIdx = header.findIndex(h => h.includes('category'));
    const priceIdx = header.findIndex(h => h.includes('price'));

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const cols = lines[i].split(',').map(c => c.trim());
      const asin = cols[asinIdx]?.toUpperCase();
      const title = cols[titleIdx];

      if (!asin || !validateASIN(asin) || !title) continue;

      const product: DXMProduct = {
        asin,
        title,
        category: classifyCategory(title, cols[categoryIdx]),
        brand: extractBrand(title),
        price: cols[priceIdx] ? parseFloat(cols[priceIdx]) : null,
        source: 'github',
      };

      products.push(product);
    }
  }

  log(`GitHub: ${products.length} valid products extracted`, '✓');
  return products;
}

// ===== DEDUPLICATION & CAPPING =====

function deduplicateAndCap(all: DXMProduct[]): DXMProduct[] {
  log('Deduplicating and enforcing per-category caps...', '🧹');

  const seen = new Set<string>();
  const byCat: Record<string, DXMProduct[]> = {};
  const result: DXMProduct[] = [];

  // First pass: dedup
  for (const product of all) {
    if (seen.has(product.asin)) continue;
    seen.add(product.asin);

    if (!byCat[product.category]) {
      byCat[product.category] = [];
    }
    byCat[product.category].push(product);
  }

  // Second pass: enforce caps
  for (const [category, products] of Object.entries(byCat)) {
    const capped = products.slice(0, MAX_PER_CATEGORY);
    result.push(...capped);
    log(`${category}: ${capped.length}/${products.length} (capped at ${MAX_PER_CATEGORY})`);
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
    })),
  };
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('\n🚀 DXM ASIN SOURCING ENGINE v1.0\n');

  try {
    ensureDirectory();

    // Parse all sources
    log('Fetching from all sources...', '🔍');
    const sources: DXMProduct[] = [];

    // Try Kaggle 10K
    const kaggle10kPath = path.join(DATA_DIR, 'electronics_data.csv');
    sources.push(...parseKaggle10K(kaggle10kPath));

    // Try Kaggle 1.4M
    const kaggle14mPath = path.join(DATA_DIR, 'amazon_products_2023.csv');
    sources.push(...parseKaggle14M(kaggle14mPath));

    // Try GitHub
    const gitHubPath = path.join(DATA_DIR, 'github-electronics');
    sources.push(...parseGitHub(gitHubPath));

    log(`\nTotal products from all sources: ${sources.length}`, '📊');

    if (sources.length === 0) {
      log('⚠️ No products found from any source. Check data directory and CSV paths.', '❌');
      log(`Expected data directory: ${DATA_DIR}`, '📂');
      return;
    }

    // Dedup and cap
    const cleaned = deduplicateAndCap(sources);

    // Format for ingestion
    const payload = formatForIngestion(cleaned);

    // Write output
    const outputPath = path.join(OUTPUT_DIR, 'dxm_clean_products.json');
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

    log(`\n✅ COMPLETE: ${payload.products.length} products ready`, '🎉');
    log(`Output: ${outputPath}`, '📁');
    log(`\nNext: Ingest with:`, '👉');
    log(`curl -X POST http://localhost:3002/api/admin/products/bulkImport \\`, '');
    log(`  -H "Content-Type: application/json" \\`, '');
    log(`  -H "x-admin-key: ak3693" \\`, '');
    log(`  --data @${outputPath}`, '');

  } catch (error) {
    log(`FAILED: ${error}`, '❌');
    process.exit(1);
  }
}

main();
