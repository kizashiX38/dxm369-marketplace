// src/app/api/amazon/route.ts
// Enhanced Amazon Product Advertising API Management
// Comprehensive product search, batch operations, and real-time pricing

import { NextRequest, NextResponse } from "next/server";
import { amazonAdapter, searchGPUs, searchCPUs, getProductByASIN } from "@/lib/amazonAdapter";
import { apiSafe, safeQueryParse } from "@/lib/apiSafe";
import { log } from "@/lib/log";

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const operation = searchParams.get("operation") || "search";
  const category = searchParams.get("category") as "GPU" | "CPU" | "RAM" | "SSD" | "Monitor" | "Laptop";
  const asin = searchParams.get("asin");
  const maxResults = parseInt(searchParams.get("maxResults") || "20");
  const minPrice = parseInt(searchParams.get("minPrice") || "0");
  const maxPrice = parseInt(searchParams.get("maxPrice") || "999999");
  const sortBy = searchParams.get("sortBy") as "Price:LowToHigh" | "Price:HighToLow" | "Relevance" | "NewestArrivals";
  const onlyPrime = searchParams.get("onlyPrime") === "true";

  if (operation === "search" && category) {
    // Search products by category
    const options = {
      maxResults,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 999999 ? maxPrice : undefined,
      sortBy,
      onlyPrime
    };

    let products;
    switch (category) {
      case "GPU":
        products = await searchGPUs(options);
        break;
      case "CPU":
        products = await searchCPUs(options);
        break;
      default:
        products = await amazonAdapter.searchProducts(category, options);
    }

    return NextResponse.json({
      ok: true,
      operation: "search",
      category,
      data: products,
      count: products.length,
      options,
      timestamp: new Date().toISOString()
    });
  }

  if (operation === "product" && asin) {
    // Get specific product by ASIN
    const product = await getProductByASIN(asin);
    
    if (!product) {
      return NextResponse.json({
        ok: false,
        operation: "product",
        error: "Product not found",
        asin
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      operation: "product",
      data: product,
      asin,
      timestamp: new Date().toISOString()
    });
  }

  if (operation === "batch" && searchParams.get("asins")) {
    // Batch product lookup
    const asins = searchParams.get("asins")!.split(",");
    const products = await Promise.all(
      asins.map(asin => getProductByASIN(asin.trim()))
    );

    const validProducts = products.filter(p => p !== null);

    return NextResponse.json({
      ok: true,
      operation: "batch",
      data: validProducts,
      requested: asins.length,
      found: validProducts.length,
      timestamp: new Date().toISOString()
    });
  }

  if (operation === "categories") {
    // List available categories and their mappings
    return NextResponse.json({
      ok: true,
      operation: "categories",
      data: {
        GPU: {
          searchIndex: "Electronics",
          browseNode: "284822",
          keywords: ["graphics card", "GPU", "video card", "RTX", "Radeon"]
        },
        CPU: {
          searchIndex: "Electronics",
          browseNode: "229189", 
          keywords: ["processor", "CPU", "Intel", "AMD", "Ryzen"]
        },
        RAM: {
          searchIndex: "Electronics",
          browseNode: "172500",
          keywords: ["memory", "RAM", "DDR4", "DDR5"]
        },
        SSD: {
          searchIndex: "Electronics",
          browseNode: "1292110011",
          keywords: ["SSD", "solid state", "NVMe", "M.2"]
        },
        Monitor: {
          searchIndex: "Electronics",
          browseNode: "1292115011",
          keywords: ["monitor", "display", "gaming monitor"]
        },
        Laptop: {
          searchIndex: "Electronics",
          browseNode: "565108",
          keywords: ["laptop", "gaming laptop", "notebook"]
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  if (operation === "health") {
    // REAL DATA MODE: Health check must succeed or fail hard
    // Test with a known ASIN
    const testProduct = await getProductByASIN("B0BJQRXJZD");
    
    if (!testProduct) {
      log.error("[AMAZON_HEALTH_CHECK_FAILED]", {
        operation: "health",
        testAsin: "B0BJQRXJZD",
        status: "unhealthy"
      });
      
      return NextResponse.json({
        ok: false,
        operation: "health",
        status: "unhealthy",
        error: "Amazon API test product not found"
      }, { status: 503 });
    }
    
    return NextResponse.json({
      ok: true,
      operation: "health",
      status: "healthy",
      apiConnectivity: "connected",
      version: "v3.0-real-data-mode"
    });
  }

  // Default: return API documentation
  return NextResponse.json({
    ok: true,
    message: "DXM Amazon Product Advertising API",
    data: {
      endpoints: {
        search: "/api/amazon?operation=search&category=GPU&maxResults=20",
        product: "/api/amazon?operation=product&asin=B0BJQRXJZD",
        batch: "/api/amazon?operation=batch&asins=B0BJQRXJZD,B0BJQR8KJ4",
        categories: "/api/amazon?operation=categories",
        health: "/api/amazon?operation=health"
      },
      parameters: {
        category: ["GPU", "CPU", "RAM", "SSD", "Monitor", "Laptop"],
        sortBy: ["Price:LowToHigh", "Price:HighToLow", "Relevance", "NewestArrivals"],
        maxResults: "1-50",
        minPrice: "number",
        maxPrice: "number",
        onlyPrime: "boolean"
      },
      version: "v2.1-dxm"
    }
  });
});

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await request.json();
  const { operation, data } = body;

  if (operation === "bulk-search") {
    // Bulk search across multiple categories
    const { categories, options = {} } = data;
    
    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid request. Expected 'categories' array."
      }, { status: 400 });
    }

    const results = await Promise.all(
      categories.map(async (category: string) => {
        try {
          const products = await amazonAdapter.searchProducts(
            category as any, 
            options
          );
          return { category, products, count: products.length };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return { category, products: [], count: 0, error: errorMessage };
        }
      })
    );

    const totalProducts = results.reduce((sum, result) => sum + result.count, 0);

    return NextResponse.json({
      ok: true,
      operation: "bulk-search",
      data: {
        results,
        totalProducts,
        categoriesSearched: categories.length,
        options
      },
      timestamp: new Date().toISOString()
    });
  }

  if (operation === "price-tracking") {
    // Price tracking for specific ASINs
    const { asins, trackingOptions = {} } = data;
    
    if (!asins || !Array.isArray(asins)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid request. Expected 'asins' array."
      }, { status: 400 });
    }

    const priceData = await Promise.all(
      asins.map(async (asin: string) => {
        const product = await getProductByASIN(asin);
        return {
          asin,
          found: !!product,
          currentPrice: product?.price,
          availability: product?.availability,
          isPrime: product?.isPrime,
          lastUpdated: product?.lastUpdated,
          dxmScore: product?.dxmScore
        };
      })
    );

    return NextResponse.json({
      ok: true,
      operation: "price-tracking",
      data: {
        priceData,
        tracked: asins.length,
        found: priceData.filter(p => p.found).length,
        trackingOptions
      },
      timestamp: new Date().toISOString()
    });
  }

  if (operation === "inventory-sync") {
    // Sync inventory data for DXM marketplace
    const { products, syncOptions = {} } = data;
    
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid request. Expected 'products' array."
      }, { status: 400 });
    }

    const syncResults = await Promise.all(
      products.map(async (productData: any) => {
        try {
          const amazonProduct = await getProductByASIN(productData.asin);
          
          return {
            asin: productData.asin,
            synced: !!amazonProduct,
            priceChanged: amazonProduct && amazonProduct.price !== productData.expectedPrice,
            currentPrice: amazonProduct?.price,
            previousPrice: productData.expectedPrice,
            availability: amazonProduct?.availability,
            dxmScore: amazonProduct?.dxmScore
          };
        } catch (error) {
          return {
            asin: productData.asin,
            synced: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    const syncStats = {
      total: products.length,
      synced: syncResults.filter(r => r.synced).length,
      priceChanges: syncResults.filter(r => r.priceChanged).length,
      errors: syncResults.filter(r => r.error).length
    };

    return NextResponse.json({
      ok: true,
      operation: "inventory-sync",
      data: {
        syncResults,
        syncStats,
        syncOptions
      },
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    ok: false,
    error: "Invalid operation. Supported: bulk-search, price-tracking, inventory-sync"
  }, { status: 400 });
});
