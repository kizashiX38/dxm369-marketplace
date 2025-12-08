// src/lib/types/product.ts
// Canonical DXMProduct type definition
// Single source of truth for product data structure

/**
 * DXMProduct - Canonical product type for DXM369 Marketplace
 * 
 * This is the normalized product format that all API routes should return.
 * It differs from DealRadarItem in several ways:
 * - Uses 'name' instead of 'title'
 * - Uses 'originalPrice' instead of 'previousPrice'
 * - Uses normalized category enum (uppercase)
 * - Uses normalized availability enum (snake_case)
 * - Aggregates specs into object format
 * - Includes calculated savingsPercent
 * - Includes lastUpdated timestamp
 */
export interface DXMProduct {
  /** Internal DXM product ID */
  id: string;
  
  /** Amazon ASIN */
  asin: string;
  
  /** Product name/title */
  name: string;
  
  /** Product category - normalized uppercase enum */
  category: "GPU" | "CPU" | "Laptop" | "SSD" | "RAM" | "Motherboard" | "PSU" | "Monitor";
  
  /** Current price in USD */
  price: number;
  
  /** Original/list price before discount (optional) */
  originalPrice?: number;
  
  /** Calculated savings percentage (optional, calculated from originalPrice) */
  savingsPercent?: number;
  
  /** DXM Value Score (0-10 scale, matches DealRadarItem) */
  dxmScore: number;
  
  /** Vendor name (e.g., "Amazon") */
  vendor: string;
  
  /** Whether product is Prime eligible */
  isPrime?: boolean;
  
  /** Product specifications as key-value pairs */
  specs: {
    [key: string]: string;
  };
  
  /** Product image URL */
  imageUrl?: string;
  
  /** Product availability status - normalized snake_case enum */
  availability: "in_stock" | "limited" | "out_of_stock";
  
  /** ISO timestamp of last update */
  lastUpdated: string;
}

/**
 * Normalized availability status
 */
export type AvailabilityStatus = "in_stock" | "limited" | "out_of_stock";

/**
 * Normalized product category
 */
export type ProductCategory = "GPU" | "CPU" | "Laptop" | "SSD" | "RAM" | "Motherboard" | "PSU" | "Monitor";

/**
 * Convert availability enum to display string
 */
export function getAvailabilityDisplay(availability: AvailabilityStatus): string {
  switch (availability) {
    case "in_stock":
      return "In Stock";
    case "limited":
      return "Limited Stock";
    case "out_of_stock":
      return "Out of Stock";
    default:
      return "Out of Stock";
  }
}

/**
 * Get availability color class
 */
export function getAvailabilityColor(availability: AvailabilityStatus): string {
  switch (availability) {
    case "in_stock":
      return "text-emerald-400";
    case "limited":
      return "text-amber-400";
    case "out_of_stock":
      return "text-rose-400";
    default:
      return "text-rose-400";
  }
}

