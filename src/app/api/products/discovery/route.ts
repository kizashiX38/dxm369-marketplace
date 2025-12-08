// src/app/api/products/discovery/route.ts
// Product Discovery API - Automated catalog management
// Handles validation, enrichment, and bulk processing

import { NextRequest, NextResponse } from "next/server";
import { productDiscoveryAPI } from "@/lib/productDiscovery";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    
    switch (action) {
      case "stats":
        const stats = productDiscoveryAPI.getDiscoveryStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
        
      case "search":
        const query = searchParams.get("q") || "";
        const category = searchParams.get("category") as any;
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const sortBy = searchParams.get("sortBy") as any || "dxmScore";
        
        const priceRange = minPrice && maxPrice ? {
          min: parseInt(minPrice),
          max: parseInt(maxPrice)
        } : undefined;
        
        const results = productDiscoveryAPI.searchProducts(query, category, priceRange, sortBy);
        
        return NextResponse.json({
          success: true,
          data: {
            products: results.slice(0, 50), // Limit to 50 results
            total: results.length,
            query: { query, category, priceRange, sortBy }
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use 'stats' or 'search'"
        }, { status: 400 });
    }
  } catch (error) {
    console.error("[DISCOVERY_API_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, products } = body;
    
    switch (action) {
      case "validate":
        if (!Array.isArray(products)) {
          return NextResponse.json({
            success: false,
            error: "Products must be an array"
          }, { status: 400 });
        }
        
        const results = await productDiscoveryAPI.processProductBatch(products);
        
        return NextResponse.json({
          success: true,
          data: {
            summary: {
              total: products.length,
              valid: results.valid.length,
              invalid: results.invalid.length,
              warnings: results.warnings.length
            },
            results
          }
        });
        
      case "enrich":
        if (!products || typeof products !== "object") {
          return NextResponse.json({
            success: false,
            error: "Product object required"
          }, { status: 400 });
        }
        
        const enriched = productDiscoveryAPI.enrichProduct(products);
        
        return NextResponse.json({
          success: true,
          data: enriched
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use 'validate' or 'enrich'"
        }, { status: 400 });
    }
  } catch (error) {
    console.error("[DISCOVERY_API_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
