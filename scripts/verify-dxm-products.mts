// scripts/verify-dxm-products.ts
// Lightweight verification tool for DXM product API responses
// Validates that all product endpoints return clean, coherent data

if (!process.env.DATABASE_URL) {
  throw new Error(
    "[DXM-DB] DATABASE_URL is not defined. Run via `npm run verify-dxm-products` with .env.local configured."
  );
}

import type { DXMProduct } from "../src/lib/types/product";

// API routes now return DXMProduct[] directly, not wrapped
type APIResponse = DXMProduct[];

interface VerificationResult {
  category: string;
  count: number;
  invalidCount: number;
  errors: string[];
  sampleProduct: string | null;
}

/**
 * Validate a single DXMProduct
 * Returns array of error messages (empty if valid)
 */
function validateProduct(product: DXMProduct | null | undefined, index: number): string[] {
  const errors: string[] = [];

  if (!product) {
    errors.push(`Product ${index}: is null or undefined`);
    return errors;
  }

  // Check required fields
  if (!product.id || typeof product.id !== "string" || product.id.trim() === "") {
    errors.push(`Product ${index}: missing or invalid id`);
  }

  if (!product.asin || typeof product.asin !== "string" || product.asin.trim() === "") {
    errors.push(`Product ${index}: missing or invalid asin`);
  }

  if (!product.name || typeof product.name !== "string" || product.name.trim() === "") {
    errors.push(`Product ${index}: missing or invalid name`);
  }

  // Check price
  if (typeof product.price !== "number" || product.price <= 0 || !isFinite(product.price)) {
    errors.push(`Product ${index}: invalid price (${product.price})`);
  }

  // Check category
  const validCategories = ["GPU", "CPU", "Laptop", "SSD", "RAM", "Motherboard", "PSU", "Monitor"];
  if (!product.category || !validCategories.includes(product.category)) {
    errors.push(`Product ${index}: invalid category (${product.category})`);
  }

  // Check dxmScore
  if (typeof product.dxmScore !== "number" || product.dxmScore < 0 || product.dxmScore > 10 || !isFinite(product.dxmScore)) {
    errors.push(`Product ${index}: invalid dxmScore (${product.dxmScore})`);
  }

  // Check vendor
  if (!product.vendor || typeof product.vendor !== "string" || product.vendor.trim() === "") {
    errors.push(`Product ${index}: missing or invalid vendor`);
  }

  // Check availability
  const validAvailability = ["in_stock", "limited", "out_of_stock"];
  if (!product.availability || !validAvailability.includes(product.availability)) {
    errors.push(`Product ${index}: invalid availability (${product.availability})`);
  }

  // Check specs (must be object)
  if (!product.specs || typeof product.specs !== "object" || Array.isArray(product.specs)) {
    errors.push(`Product ${index}: invalid specs (must be object)`);
  }

  // Check lastUpdated
  if (!product.lastUpdated || typeof product.lastUpdated !== "string") {
    errors.push(`Product ${index}: missing or invalid lastUpdated`);
  } else {
    // Validate ISO timestamp
    const date = new Date(product.lastUpdated);
    if (isNaN(date.getTime())) {
      errors.push(`Product ${index}: invalid lastUpdated timestamp`);
    }
  }

  return errors;
}

/**
 * Verify a single category endpoint
 */
async function verifyCategory(category: string): Promise<VerificationResult> {
  const url = `http://localhost:3000/api/dxm/products/${category}`;
  const errors: string[] = [];
  let products: DXMProduct[] = [];

  try {
    // Add timeout to prevent hanging if server isn't running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      errors.push(`HTTP ${res.status}: ${res.statusText}`);
      return {
        category,
        count: 0,
        invalidCount: 0,
        errors,
        sampleProduct: null,
      };
    }

    const response = await res.json();

    // API routes now return DXMProduct[] directly
    if (!Array.isArray(response)) {
      errors.push("Response is not an array (expected DXMProduct[])");
      return {
        category,
        count: 0,
        invalidCount: 0,
        errors,
        sampleProduct: null,
      };
    }

    products = response;

    // Validate each product
    products.forEach((product, index) => {
      const productErrors = validateProduct(product, index);
      errors.push(...productErrors);
    });

    // Get sample product for display
    const sampleProduct = products.length > 0
      ? `${products[0].name.substring(0, 40)}... ($${products[0].price}, ${products[0].category})`
      : null;

    return {
      category,
      count: products.length,
      invalidCount: errors.length,
      errors,
      sampleProduct,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      errors.push("Request timeout (server may not be running)");
    } else if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      errors.push("Connection refused (is the dev server running on port 3000?)");
    } else {
      errors.push(`Fetch error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return {
      category,
      count: 0,
      invalidCount: errors.length,
      errors,
      sampleProduct: null,
    };
  }
}

/**
 * Print verification results as a table
 */
function printResults(results: VerificationResult[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("DXM Product API Verification Results");
  console.log("=".repeat(80) + "\n");

  // Table header
  console.log(
    "Category".padEnd(12) +
    "Count".padEnd(8) +
    "Invalid".padEnd(10) +
    "Status".padEnd(12) +
    "Sample Product"
  );
  console.log("-".repeat(80));

  // Table rows
  results.forEach(result => {
    const status = result.invalidCount === 0 ? "✅ PASS" : "❌ FAIL";
    const countStr = result.count.toString().padEnd(8);
    const invalidStr = result.invalidCount.toString().padEnd(10);
    const sampleStr = result.sampleProduct || "No products";

    console.log(
      result.category.padEnd(12) +
      countStr +
      invalidStr +
      status.padEnd(12) +
      sampleStr.substring(0, 40)
    );
  });

  console.log("-".repeat(80));

  // Summary
  const totalCount = results.reduce((sum, r) => sum + r.count, 0);
  const totalInvalid = results.reduce((sum, r) => sum + r.invalidCount, 0);
  const allPass = totalInvalid === 0;

  console.log(`\nTotal Products: ${totalCount}`);
  console.log(`Total Invalid: ${totalInvalid}`);
  console.log(`Overall Status: ${allPass ? "✅ ALL PASS" : "❌ FAILURES DETECTED"}\n`);

  // Print detailed errors if any
  if (totalInvalid > 0) {
    console.log("=".repeat(80));
    console.log("Detailed Errors:");
    console.log("=".repeat(80) + "\n");

    results.forEach(result => {
      if (result.errors.length > 0) {
        console.log(`\n[${result.category.toUpperCase()}]`);
        result.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }
    });
    console.log("\n");
  }

  console.log("=".repeat(80) + "\n");
}

/**
 * Main verification function
 */
async function main(): Promise<void> {
  const categories = ["gpus", "cpus", "laptops", "monitors", "builds"];

  console.log("Starting DXM Product API verification...");
  console.log("Testing endpoints at http://localhost:3000/api/dxm/products/*\n");

  // Verify all categories
  const results = await Promise.all(
    categories.map(category => verifyCategory(category))
  );

  // Print results
  printResults(results);

  // Exit with error code if any failures
  const hasFailures = results.some(r => r.invalidCount > 0);
  process.exit(hasFailures ? 1 : 0);
}

// Run main function
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

