// src/app/api/deals/detection/route.ts
// Live Deal Detection API
// Real-time price monitoring and trend analysis

import { NextRequest, NextResponse } from "next/server";
import { dealDetectionEngine, detectDealsForProducts, getTrendingDealsWithAnalysis, getFlashSaleAlerts } from "@/lib/dealDetection";
import { getGpuDeals, getCpuDeals, getLaptopDeals } from "@/lib/dealRadar";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");

    switch (action) {
      case "trending":
        const trendingProducts = await getTrendingProducts(category, limit);
        return NextResponse.json({
          success: true,
          data: {
            trending: trendingProducts,
            count: trendingProducts.length,
            category,
            timestamp: new Date().toISOString()
          }
        });

      case "flash-sales":
        const flashSales = await getFlashSales(category);
        return NextResponse.json({
          success: true,
          data: {
            flashSales: flashSales.slice(0, limit),
            count: flashSales.length,
            category,
            timestamp: new Date().toISOString()
          }
        });

      case "alerts":
        const productId = searchParams.get("productId");
        const alerts = dealDetectionEngine.getActiveAlerts(productId || undefined);
        return NextResponse.json({
          success: true,
          data: {
            alerts: alerts.slice(0, limit),
            count: alerts.length,
            productId,
            timestamp: new Date().toISOString()
          }
        });

      case "stats":
        const stats = dealDetectionEngine.getStats();
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            timestamp: new Date().toISOString()
          }
        });

      case "price-history":
        const historyProductId = searchParams.get("productId");
        if (!historyProductId) {
          return NextResponse.json({
            success: false,
            error: "productId parameter required for price history"
          }, { status: 400 });
        }

        const history = dealDetectionEngine.getPriceHistory(historyProductId);
        return NextResponse.json({
          success: true,
          data: {
            productId: historyProductId,
            history,
            count: history.length,
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use: trending, flash-sales, alerts, stats, price-history"
        }, { status: 400 });
    }
  } catch (error) {
    console.error("[DEAL_DETECTION_API_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, productId, price, availability, source } = body;

    switch (action) {
      case "add-price-data":
        if (!productId || !price) {
          return NextResponse.json({
            success: false,
            error: "productId and price are required"
          }, { status: 400 });
        }

        dealDetectionEngine.addPriceData(
          productId,
          price,
          availability || "In Stock",
          source || "manual"
        );

        return NextResponse.json({
          success: true,
          message: `Price data added for product ${productId}`,
          timestamp: new Date().toISOString()
        });

      case "clear-expired":
        const cleared = dealDetectionEngine.clearExpiredAlerts();
        return NextResponse.json({
          success: true,
          data: {
            clearedAlerts: cleared,
            timestamp: new Date().toISOString()
          }
        });

      case "analyze-products":
        const { products } = body;
        if (!Array.isArray(products)) {
          return NextResponse.json({
            success: false,
            error: "products array is required"
          }, { status: 400 });
        }

        const alerts = detectDealsForProducts(products);
        return NextResponse.json({
          success: true,
          data: {
            alerts,
            count: alerts.length,
            analyzed: products.length,
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use: add-price-data, clear-expired, analyze-products"
        }, { status: 400 });
    }
  } catch (error) {
    console.error("[DEAL_DETECTION_POST_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

// Helper functions
async function getTrendingProducts(category?: string | null, limit: number = 10) {
  let products;
  
  switch (category) {
    case "gpu":
      products = await getGpuDeals();
      break;
    case "cpu":
      products = await getCpuDeals();
      break;
    case "laptop":
      products = await getLaptopDeals();
      break;
    default:
      // Get all products
      const [gpus, cpus, laptops] = await Promise.all([
        getGpuDeals(),
        getCpuDeals(),
        getLaptopDeals()
      ]);
      products = [...gpus, ...cpus, ...laptops];
  }

  return getTrendingDealsWithAnalysis(products, limit);
}

async function getFlashSales(category?: string | null) {
  let products;
  
  switch (category) {
    case "gpu":
      products = await getGpuDeals();
      break;
    case "cpu":
      products = await getCpuDeals();
      break;
    case "laptop":
      products = await getLaptopDeals();
      break;
    default:
      const [gpus, cpus, laptops] = await Promise.all([
        getGpuDeals(),
        getCpuDeals(),
        getLaptopDeals()
      ]);
      products = [...gpus, ...cpus, ...laptops];
  }

  return getFlashSaleAlerts(products);
}
