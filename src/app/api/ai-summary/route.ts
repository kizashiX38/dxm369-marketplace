// src/app/api/ai-summary/route.ts
// AI Product Summary API - DXM Intelligence Engine
// Provides AI-generated product analysis and recommendations

import { NextRequest, NextResponse } from "next/server";
import { getAIProductSummary, batchGenerateAISummaries } from "@/lib/aiSummaries";
import { getGpuDeals, getCpuDeals, getLaptopDeals } from "@/lib/dealRadar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get("asin");
  const category = searchParams.get("category");
  const batch = searchParams.get("batch") === "true";

  try {
    if (batch) {
      // Batch generate summaries for category
      let products: any[] = [];
      
      if (category === "gpu" || !category) {
        const gpuDeals = await getGpuDeals();
        products.push(...gpuDeals);
      }
      
      if (category === "cpu" || !category) {
        const cpuDeals = await getCpuDeals();
        products.push(...cpuDeals);
      }
      
      if (category === "laptop" || !category) {
        const laptopDeals = await getLaptopDeals();
        products.push(...laptopDeals);
      }
      
      // Limit batch size for performance
      const limitedProducts = products.slice(0, 20);
      const summaries = await batchGenerateAISummaries(limitedProducts);
      
      return NextResponse.json({
        success: true,
        summaries,
        count: summaries.length,
        category: category || "all",
        timestamp: new Date().toISOString()
      });
    }
    
    if (asin) {
      // Single product summary
      let product = null;
      
      // Search across all categories for the ASIN
      const [gpuDeals, cpuDeals, laptopDeals] = await Promise.all([
        getGpuDeals(),
        getCpuDeals(),
        getLaptopDeals()
      ]);
      
      const allProducts = [...gpuDeals, ...cpuDeals, ...laptopDeals];
      product = allProducts.find(p => p.asin === asin);
      
      if (!product) {
        return NextResponse.json({
          success: false,
          error: "Product not found",
          asin
        }, { status: 404 });
      }
      
      const summary = await getAIProductSummary(product);
      
      return NextResponse.json({
        success: true,
        summary,
        product: {
          id: product.id,
          asin: product.asin,
          title: product.title,
          category: product.category,
          price: product.price,
          dxmScore: product.dxmScore
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Default: return available endpoints
    return NextResponse.json({
      success: true,
      message: "DXM AI Summary API",
      endpoints: {
        single: "/api/ai-summary?asin=B0XXXXXX",
        batch: "/api/ai-summary?batch=true&category=gpu",
        categories: ["gpu", "cpu", "laptop"]
      },
      version: "v2.1-dxm"
    });
    
  } catch (error: any) {
    console.error("[AI_SUMMARY_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "AI summary generation failed",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, options = {} } = body;
    
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({
        success: false,
        error: "Invalid request body. Expected 'products' array."
      }, { status: 400 });
    }
    
    // Generate summaries for provided products
    const summaries = await batchGenerateAISummaries(products);
    
    return NextResponse.json({
      success: true,
      summaries,
      count: summaries.length,
      options,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("[AI_SUMMARY_POST_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Batch AI summary generation failed",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
