// src/app/api/amazon/search/route.ts
// Amazon PA-API Search Endpoint
// Real-time product search with DXM scoring

import { NextRequest, NextResponse } from "next/server";
import { searchAmazonProducts, amazonPAAPI } from "@/lib/amazonPAAPI";
import { HardwareCategory } from "@/lib/dealRadar";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keywords = searchParams.get("q") || searchParams.get("keywords");
    const category = searchParams.get("category") as HardwareCategory;
    const itemCount = parseInt(searchParams.get("itemCount") || "10");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand");
    const sortBy = searchParams.get("sortBy");

    if (!keywords) {
      return NextResponse.json({
        success: false,
        error: "Keywords parameter is required"
      }, { status: 400 });
    }

    // Build search options
    const options: any = {
      itemCount: Math.min(itemCount, 50), // Limit to 50 items max
    };

    if (minPrice) options.minPrice = parseInt(minPrice) * 100; // Convert to cents
    if (maxPrice) options.maxPrice = parseInt(maxPrice) * 100; // Convert to cents
    if (brand) options.brand = brand;
    if (sortBy) options.sortBy = sortBy;

    console.log(`[AMAZON_SEARCH] Searching for "${keywords}" in category "${category}"`);

    const products = await searchAmazonProducts(keywords, category, options);

    return NextResponse.json({
      success: true,
      data: {
        products,
        count: products.length,
        query: {
          keywords,
          category,
          options
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("[AMAZON_SEARCH_API_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keywords, category, filters } = body;

    if (!keywords) {
      return NextResponse.json({
        success: false,
        error: "Keywords are required"
      }, { status: 400 });
    }

    const products = await searchAmazonProducts(keywords, category, filters);

    return NextResponse.json({
      success: true,
      data: {
        products,
        count: products.length,
        query: { keywords, category, filters }
      }
    });

  } catch (error) {
    console.error("[AMAZON_SEARCH_POST_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
