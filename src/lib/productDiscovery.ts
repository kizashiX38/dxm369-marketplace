// src/lib/productDiscovery.ts
// Automated Product Discovery & Validation Pipeline
// Scales DXM369 catalog from 10 to 100+ products

import { DealRadarItem, HardwareCategory } from "@/lib/dealRadar";
import { expandedProductCatalog, getTotalProductCount } from "@/lib/expandedCatalog";
import { calculateRealDXMScoreV2 } from "@/lib/dealRadar";

// Product validation rules
interface ValidationRule {
  field: keyof DealRadarItem;
  required: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

const productValidationRules: ValidationRule[] = [
  { field: "id", required: true },
  { field: "asin", required: true, validator: (v) => /^[A-Z0-9]{10}$/.test(v), errorMessage: "Invalid ASIN format" },
  { field: "title", required: true, validator: (v) => v.length > 10, errorMessage: "Title too short" },
  { field: "brand", required: true },
  { field: "category", required: true },
  { field: "price", required: true, validator: (v) => v > 0, errorMessage: "Price must be positive" },
  { field: "availability", required: false },
  { field: "vendor", required: false }
];

// Product discovery sources
interface ProductSource {
  name: string;
  category: HardwareCategory;
  enabled: boolean;
  lastSync?: Date;
  productCount?: number;
}

const productSources: ProductSource[] = [
  { name: "Amazon PA-API", category: "gpu", enabled: true, productCount: 50 },
  { name: "Amazon PA-API", category: "cpu", enabled: true, productCount: 30 },
  { name: "Amazon PA-API", category: "laptop", enabled: true, productCount: 25 },
  { name: "Newegg API", category: "gpu", enabled: false, productCount: 0 },
  { name: "B&H API", category: "gpu", enabled: false, productCount: 0 },
  { name: "Manual Curation", category: "monitor", enabled: true, productCount: 15 },
  { name: "Manual Curation", category: "ssd", enabled: true, productCount: 10 }
];

// Validation functions
export function validateProduct(product: Partial<DealRadarItem>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const rule of productValidationRules) {
    const value = product[rule.field];
    
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`${rule.field} is required`);
      continue;
    }
    
    if (value !== undefined && rule.validator && !rule.validator(value)) {
      errors.push(rule.errorMessage || `Invalid ${rule.field}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Price validation and normalization
export function validatePricing(product: Partial<DealRadarItem>): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!product.price) return { isValid: false, warnings: ["Price is required"] };
  
  // Price range validation by category
  const priceRanges: Record<HardwareCategory, { min: number; max: number }> = {
    gpu: { min: 100, max: 3000 },
    cpu: { min: 50, max: 1000 },
    laptop: { min: 300, max: 5000 },
    monitor: { min: 100, max: 2000 },
    ssd: { min: 30, max: 500 },
    psu: { min: 50, max: 500 },
    motherboard: { min: 80, max: 800 },
    ram: { min: 30, max: 300 },
    case: { min: 40, max: 300 },
    cooling: { min: 20, max: 200 },
    keyboard: { min: 20, max: 300 },
    mouse: { min: 10, max: 200 },
    headset: { min: 20, max: 400 }
  };
  
  const category = product.category as HardwareCategory;
  const range = priceRanges[category];
  
  if (range && (product.price < range.min || product.price > range.max)) {
    warnings.push(`Price $${product.price} outside expected range $${range.min}-$${range.max} for ${category}`);
  }
  
  // Previous price validation
  if (product.previousPrice && product.previousPrice <= product.price) {
    warnings.push("Previous price should be higher than current price for discount calculation");
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

// Duplicate detection
export function detectDuplicates(products: DealRadarItem[]): Array<{ product: DealRadarItem; duplicates: DealRadarItem[] }> {
  const duplicateGroups: Array<{ product: DealRadarItem; duplicates: DealRadarItem[] }> = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const duplicates = products.slice(i + 1).filter(p => 
      p.asin === product.asin || 
      (p.title.toLowerCase() === product.title.toLowerCase() && p.brand === product.brand)
    );
    
    if (duplicates.length > 0) {
      duplicateGroups.push({ product, duplicates });
    }
  }
  
  return duplicateGroups;
}

// Product enrichment
export function enrichProduct(product: Partial<DealRadarItem>): DealRadarItem {
  const enriched = { ...product } as DealRadarItem;
  
  // Calculate DXM score if missing
  if (!enriched.dxmScore) {
    enriched.dxmScore = Math.round(calculateRealDXMScoreV2(enriched) * 100) / 100;
  }
  
  // Set default availability
  if (!enriched.availability) {
    enriched.availability = "In Stock";
  }
  
  // Set default vendor
  if (!enriched.vendor) {
    enriched.vendor = "Amazon";
  }
  
  // Set default domain
  if (!enriched.domain) {
    enriched.domain = "com";
  }
  
  // Generate trend data if missing
  if (!enriched.trend && enriched.previousPrice) {
    const steps = 5;
    const priceStep = (enriched.previousPrice - enriched.price) / (steps - 1);
    enriched.trend = Array.from({ length: steps }, (_, i) => 
      Math.round((enriched.previousPrice! - (priceStep * i)) * 100) / 100
    );
  }
  
  // Auto-generate tags based on category and specs
  if (!enriched.tags || enriched.tags.length === 0) {
    enriched.tags = generateAutoTags(enriched);
  }
  
  return enriched;
}

// Auto-tag generation
function generateAutoTags(product: DealRadarItem): string[] {
  const tags: string[] = [];
  
  // Category-specific tags
  switch (product.category) {
    case "gpu":
      if (product.price < 300) tags.push("budget");
      else if (product.price > 800) tags.push("flagship");
      else tags.push("mainstream");
      
      if (product.vram?.includes("24GB")) tags.push("high-vram");
      if (product.title.toLowerCase().includes("rtx")) tags.push("ray-tracing");
      if (product.title.toLowerCase().includes("4090")) tags.push("4k");
      break;
      
    case "cpu":
      if (product.cores && parseInt(product.cores) >= 16) tags.push("high-core-count");
      if (product.title.toLowerCase().includes("x3d")) tags.push("3d-cache");
      if (product.title.toLowerCase().includes("k")) tags.push("overclocking");
      break;
      
    case "laptop":
      if (product.title.toLowerCase().includes("gaming")) tags.push("gaming");
      if (product.title.toLowerCase().includes("business")) tags.push("business");
      if (product.display?.includes("4K")) tags.push("4k-display");
      break;
  }
  
  // Price-based tags
  if (product.previousPrice && product.previousPrice > product.price) {
    const discount = ((product.previousPrice - product.price) / product.previousPrice) * 100;
    if (discount >= 20) tags.push("hot-deal");
    else if (discount >= 10) tags.push("good-deal");
  }
  
  return tags;
}

// Bulk product processing
export async function processProductBatch(products: Partial<DealRadarItem>[]): Promise<{
  valid: DealRadarItem[];
  invalid: Array<{ product: Partial<DealRadarItem>; errors: string[] }>;
  warnings: Array<{ product: Partial<DealRadarItem>; warnings: string[] }>;
}> {
  const valid: DealRadarItem[] = [];
  const invalid: Array<{ product: Partial<DealRadarItem>; errors: string[] }> = [];
  const warnings: Array<{ product: Partial<DealRadarItem>; warnings: string[] }> = [];
  
  for (const product of products) {
    // Validate product structure
    const validation = validateProduct(product);
    if (!validation.isValid) {
      invalid.push({ product, errors: validation.errors });
      continue;
    }
    
    // Validate pricing
    const priceValidation = validatePricing(product);
    if (priceValidation.warnings.length > 0) {
      warnings.push({ product, warnings: priceValidation.warnings });
    }
    
    // Enrich and add to valid products
    const enrichedProduct = enrichProduct(product);
    valid.push(enrichedProduct);
  }
  
  return { valid, invalid, warnings };
}

// Product discovery statistics
export function getDiscoveryStats(): {
  totalProducts: number;
  productsByCategory: Record<HardwareCategory, number>;
  sourceStats: ProductSource[];
  lastUpdated: Date;
} {
  const productsByCategory = Object.entries(expandedProductCatalog).reduce((acc, [category, products]) => {
    acc[category as HardwareCategory] = products.length;
    return acc;
  }, {} as Record<HardwareCategory, number>);
  
  return {
    totalProducts: getTotalProductCount(),
    productsByCategory,
    sourceStats: productSources,
    lastUpdated: new Date()
  };
}

// Product search and filtering
export function searchProducts(
  query: string, 
  category?: HardwareCategory,
  priceRange?: { min: number; max: number },
  sortBy: "price" | "dxmScore" | "title" = "dxmScore"
): DealRadarItem[] {
  let allProducts: DealRadarItem[] = [];
  
  // Get products from expanded catalog
  if (category && category in expandedProductCatalog) {
    const categoryProducts = expandedProductCatalog[category as keyof typeof expandedProductCatalog] || [];
    allProducts = categoryProducts.map(p => enrichProduct(p));
  } else {
    allProducts = Object.values(expandedProductCatalog)
      .flat()
      .map(p => enrichProduct(p));
  }
  
  // Apply search filter
  if (query) {
    const searchTerm = query.toLowerCase();
    allProducts = allProducts.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply price range filter
  if (priceRange) {
    allProducts = allProducts.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
  }
  
  // Sort results
  allProducts.sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "title":
        return a.title.localeCompare(b.title);
      case "dxmScore":
      default:
        return b.dxmScore - a.dxmScore;
    }
  });
  
  return allProducts;
}

// Export for API endpoints
export const productDiscoveryAPI = {
  validateProduct,
  validatePricing,
  detectDuplicates,
  enrichProduct,
  processProductBatch,
  getDiscoveryStats,
  searchProducts
};
