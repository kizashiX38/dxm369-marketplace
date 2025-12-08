// src/app/api/amazon/items/route.ts
// Amazon PA-API Get Items Endpoint
// Fetch specific products by ASIN with real-time data

import { NextRequest, NextResponse } from "next/server";
import { getAmazonProductsByASIN, amazonPAAPI } from "@/lib/amazonPAAPI";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const asins = searchParams.get("asins");
    const condition = searchParams.get("condition") as "New" | "Used" | "Collectible" | "Refurbished";
    const merchant = searchParams.get("merchant") as "Amazon" | "All";

    if (!asins) {
      return NextResponse.json({
        success: false,
        error: "ASINs parameter is required (comma-separated list)"
      }, { status: 400 });
    }

    const asinList = asins.split(",").map(asin => asin.trim()).filter(Boolean);
    
    if (asinList.length === 0) {
      return NextResponse.json({
        success: false,
        error: "At least one valid ASIN is required"
      }, { status: 400 });
    }

    if (asinList.length > 10) {
      return NextResponse.json({
        success: false,
        error: "Maximum 10 ASINs allowed per request"
      }, { status: 400 });
    }

    console.log(`[AMAZON_ITEMS] Fetching ${asinList.length} items: ${asinList.join(", ")}`);

    const products = await amazonPAAPI.getItems({
      itemIds: asinList,
      condition: condition || "New",
      merchant: merchant || "Amazon"
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        count: products.length,
        requested: asinList.length,
        found: products.length,
        missing: asinList.filter(asin => !products.find(p => p.asin === asin)),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("[AMAZON_ITEMS_API_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { asins, condition, merchant, resources } = body;

    if (!Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json({
        success: false,
        error: "ASINs array is required"
      }, { status: 400 });
    }

    if (asins.length > 10) {
      return NextResponse.json({
        success: false,
        error: "Maximum 10 ASINs allowed per request"
      }, { status: 400 });
    }

    const products = await amazonPAAPI.getItems({
      itemIds: asins,
      condition: condition || "New",
      merchant: merchant || "Amazon",
      resources
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        count: products.length,
        requested: asins.length,
        found: products.length
      }
    });

  } catch (error) {
    console.error("[AMAZON_ITEMS_POST_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
