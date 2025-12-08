// src/lib/products/normalizeDXMProduct.ts
// Canonical normalization layer for DXM369 product pipeline
// Converts DealRadarItem / DB rows into valid DXMProduct
// Framework-agnostic, never throws - returns null for invalid data

import type { DealRadarItem, HardwareCategory } from "@/lib/dealRadarTypes";
import type { DXMProduct, AvailabilityStatus, ProductCategory } from "@/lib/types/product";

/**
 * Normalize availability string to canonical enum
 * 
 * Maps various availability formats to normalized snake_case enum:
 * - "In Stock", "in stock", "IN STOCK" → "in_stock"
 * - "Limited Stock", "limited", "few left" → "limited"
 * - "Out of Stock", "out of stock", "unavailable" → "out_of_stock"
 * - Unknown/null/empty → "out_of_stock" (safe default)
 * 
 * @param raw - Raw availability string from any source
 * @returns Normalized availability status
 */
export function normalizeAvailability(raw: string | null | undefined): AvailabilityStatus {
  if (!raw || typeof raw !== "string") {
    return "out_of_stock"; // Safe default for missing data
  }

  const normalized = raw.toLowerCase().trim();

  // Check for "in stock" variations
  if (normalized.includes("in stock") || normalized === "available") {
    return "in_stock";
  }

  // Check for "limited" variations
  if (
    normalized.includes("limited") ||
    normalized.includes("few left") ||
    normalized.includes("only") ||
    normalized === "limited stock"
  ) {
    return "limited";
  }

  // Check for "out of stock" variations
  if (
    normalized.includes("out of stock") ||
    normalized.includes("unavailable") ||
    normalized.includes("not available") ||
    normalized.includes("sold out")
  ) {
    return "out_of_stock";
  }

  // Default to out of stock for unrecognized values
  return "out_of_stock";
}

/**
 * Normalize category string to canonical ProductCategory enum
 * 
 * Handles case variations and plural forms:
 * - "gpu", "GPU", "GPUs", "graphics card" → "GPU"
 * - "cpu", "CPU", "CPUs", "processor" → "CPU"
 * - "laptop", "Laptop", "Laptops", "notebook" → "Laptop"
 * - "monitor", "Monitor", "Monitors", "display" → "Monitor"
 * - Unknown → "GPU" (safe default, but should be validated upstream)
 * 
 * @param rawCategory - Raw category string from any source
 * @returns Normalized product category
 */
export function normalizeCategory(rawCategory: string | null | undefined): ProductCategory {
  if (!rawCategory || typeof rawCategory !== "string") {
    return "GPU"; // Safe default, but should be validated upstream
  }

  const normalized = rawCategory.toLowerCase().trim();

  // GPU variations
  if (
    normalized === "gpu" ||
    normalized === "gpus" ||
    normalized.includes("graphics") ||
    normalized.includes("video card") ||
    normalized.includes("rtx") ||
    normalized.includes("gtx") ||
    normalized.includes("radeon")
  ) {
    return "GPU";
  }

  // CPU variations
  if (
    normalized === "cpu" ||
    normalized === "cpus" ||
    normalized.includes("processor") ||
    normalized.includes("ryzen") ||
    normalized.includes("core i") ||
    normalized.includes("intel") ||
    normalized.includes("amd")
  ) {
    return "CPU";
  }

  // Laptop variations
  if (
    normalized === "laptop" ||
    normalized === "laptops" ||
    normalized.includes("notebook") ||
    normalized.includes("portable")
  ) {
    return "Laptop";
  }

  // Monitor variations
  if (
    normalized === "monitor" ||
    normalized === "monitors" ||
    normalized.includes("display") ||
    normalized.includes("screen")
  ) {
    return "Monitor";
  }

  // SSD variations
  if (
    normalized === "ssd" ||
    normalized === "ssds" ||
    normalized.includes("solid state") ||
    normalized.includes("nvme")
  ) {
    return "SSD";
  }

  // RAM variations
  if (
    normalized === "ram" ||
    normalized === "memory" ||
    normalized.includes("ddr")
  ) {
    return "RAM";
  }

  // Motherboard variations
  if (
    normalized === "motherboard" ||
    normalized === "motherboards" ||
    normalized === "mobo" ||
    normalized === "mainboard"
  ) {
    return "Motherboard";
  }

  // PSU variations
  if (
    normalized === "psu" ||
    normalized === "power supply" ||
    normalized.includes("psu")
  ) {
    return "PSU";
  }

  // Default fallback (should be validated upstream)
  return "GPU";
}

/**
 * Normalize price values with validation
 * 
 * Rules:
 * - price must be > 0 and finite (not NaN, not Infinity)
 * - previousPrice must be either null/undefined OR > price
 * - Negative prices are invalid
 * - Returns null if price is invalid
 * 
 * @param rawPrice - Raw price value (may be in cents or dollars)
 * @param rawPreviousPrice - Raw previous price (optional)
 * @returns Normalized price object or null if invalid
 */
export function normalizePrice(
  rawPrice: number | null | undefined,
  rawPreviousPrice?: number | null | undefined
): { price: number; previousPrice?: number } | null {
  // Validate raw price
  if (
    rawPrice === null ||
    rawPrice === undefined ||
    typeof rawPrice !== "number" ||
    !isFinite(rawPrice) ||
    rawPrice <= 0 ||
    isNaN(rawPrice)
  ) {
    return null; // Invalid price
  }

  // Keep price as-is (assume already in dollars from DB)
  // If sources provide cents, they should be pre-normalized upstream
  let price = rawPrice;

  // Validate normalized price
  if (price <= 0 || !isFinite(price) || isNaN(price)) {
    return null;
  }

  // Handle previousPrice
  let previousPrice: number | undefined = undefined;

  if (rawPreviousPrice !== null && rawPreviousPrice !== undefined) {
    if (typeof rawPreviousPrice !== "number" || !isFinite(rawPreviousPrice) || isNaN(rawPreviousPrice)) {
      // Invalid previousPrice, ignore it
      previousPrice = undefined;
    } else {
      // previousPrice assumed already in dollars from DB
      let normalizedPrevious = rawPreviousPrice;

      // Validate: previousPrice must be > current price
      if (normalizedPrevious > price && normalizedPrevious > 0 && isFinite(normalizedPrevious)) {
        previousPrice = normalizedPrevious;
      } else {
        // Invalid previousPrice (not greater than current price), ignore it
        previousPrice = undefined;
      }
    }
  }

  return {
    price,
    ...(previousPrice !== undefined && { previousPrice }),
  };
}

/**
 * Aggregate DealRadarItem spec fields into DXMProduct specs object
 * 
 * Collects all individual spec fields (vram, tdp, cores, etc.) into
 * a single specs object with string values.
 * 
 * @param item - DealRadarItem with individual spec fields
 * @returns Specs object with key-value pairs
 */
function aggregateSpecs(item: DealRadarItem): { [key: string]: string } {
  const specs: { [key: string]: string } = {};

  // GPU-specific specs
  if (item.vram) {
    specs.vram = String(item.vram);
  }
  if (item.tdp) {
    specs.tdp = String(item.tdp);
  }
  if (item.boostClock) {
    specs.boostClock = String(item.boostClock);
  }
  if (item.baseClock) {
    specs.baseClock = String(item.baseClock);
  }

  // CPU-specific specs
  if (item.cores) {
    specs.cores = String(item.cores);
  }
  if (item.threads) {
    specs.threads = String(item.threads);
  }

  // General specs
  if (item.memory) {
    specs.memory = String(item.memory);
  }
  if (item.storage) {
    specs.storage = String(item.storage);
  }
  if (item.display) {
    specs.display = String(item.display);
  }

  return specs;
}

/**
 * Normalize brand name with fallback handling
 * 
 * Rules:
 * - "Unknown", "unknown", "Unknown Brand" → "Unknown" (acceptable fallback)
 * - Empty/null → "Unknown"
 * - Trims whitespace
 * 
 * @param rawBrand - Raw brand string
 * @returns Normalized brand name
 */
function normalizeBrand(rawBrand: string | null | undefined): string {
  if (!rawBrand || typeof rawBrand !== "string") {
    return "Unknown";
  }

  const trimmed = rawBrand.trim();

  if (trimmed === "" || trimmed.toLowerCase() === "unknown brand") {
    return "Unknown";
  }

  return trimmed;
}

/**
 * Calculate savings percentage from original and current price
 * 
 * @param originalPrice - Original/list price
 * @param currentPrice - Current price
 * @returns Savings percentage (0-100) or undefined if invalid
 */
function calculateSavingsPercent(
  originalPrice: number | undefined,
  currentPrice: number
): number | undefined {
  if (!originalPrice || originalPrice <= currentPrice || originalPrice <= 0) {
    return undefined;
  }

  const percent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  return percent > 0 ? percent : undefined;
}

/**
 * Normalize DealRadarItem to DXMProduct
 * 
 * This is the canonical conversion function that transforms any DealRadarItem
 * (from DB, API, or static data) into a valid DXMProduct.
 * 
 * Rules:
 * - Never throws - returns null for invalid data
 * - Validates all required fields
 * - Normalizes all enum values (category, availability)
 * - Aggregates specs into object format
 * - Calculates savingsPercent if applicable
 * - Sets lastUpdated to current ISO timestamp
 * 
 * @param item - DealRadarItem to normalize
 * @returns DXMProduct or null if item is invalid
 */
export function normalizeDealRadarItemToDXMProduct(item: DealRadarItem | null | undefined): DXMProduct | null {
  // Validate input
  if (!item || typeof item !== "object") {
    return null;
  }

  // Validate required fields
  if (!item.id || !item.asin || !item.title || !item.brand) {
    return null;
  }

  // Normalize price (this validates price > 0)
  const priceData = normalizePrice(item.price, item.previousPrice);
  if (!priceData) {
    return null; // Invalid price
  }

  // Normalize category
  const category = normalizeCategory(item.category);

  // Normalize availability
  const availability = normalizeAvailability(item.availability);

  // Normalize brand
  const brand = normalizeBrand(item.brand);

  // Aggregate specs
  const specs = aggregateSpecs(item);

  // Calculate savings percent
  const savingsPercent = calculateSavingsPercent(priceData.previousPrice, priceData.price);

  // Build DXMProduct
  const dxmProduct: DXMProduct = {
    id: item.id,
    asin: item.asin,
    name: item.title, // Map title → name
    category,
    price: priceData.price,
    ...(priceData.previousPrice !== undefined && { originalPrice: priceData.previousPrice }),
    ...(savingsPercent !== undefined && { savingsPercent }),
    dxmScore: item.dxmScore || 0, // Default to 0 if missing
    vendor: item.vendor || "Amazon", // Default vendor
    ...(item.primeEligible !== undefined && { isPrime: item.primeEligible }),
    specs,
    ...(item.imageUrl && { imageUrl: item.imageUrl }),
    availability,
    lastUpdated: new Date().toISOString(), // Always set to current timestamp
  };

  return dxmProduct;
}

