// src/app/api/seed-products/route.ts
// Product Seeding API - Scalable 100+ Product Database Management
// Automated product discovery, validation, and database population

import { NextRequest, NextResponse } from "next/server";
import { 
  ProductSeedingEngine, 
  seedHighPriorityProducts, 
  seedByCategory, 
  seedAllProducts,
  PRODUCT_SEED_DATABASE 
} from "@/lib/productSeeding";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operation = searchParams.get("operation") || "info";
  const category = searchParams.get("category");
  const priority = searchParams.get("priority") as "high" | "medium" | "low";
  const maxProducts = parseInt(searchParams.get("maxProducts") || "50");

  try {
    if (operation === "info") {
      // Return seeding database information
      const categoryStats = PRODUCT_SEED_DATABASE.reduce((stats, seed) => {
        stats[seed.category] = (stats[seed.category] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      const priorityStats = PRODUCT_SEED_DATABASE.reduce((stats, seed) => {
        stats[seed.priority] = (stats[seed.priority] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      const sourceStats = PRODUCT_SEED_DATABASE.reduce((stats, seed) => {
        stats[seed.source] = (stats[seed.source] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      return NextResponse.json({
        success: true,
        operation: "info",
        database: {
          totalProducts: PRODUCT_SEED_DATABASE.length,
          categoryBreakdown: categoryStats,
          priorityBreakdown: priorityStats,
          sourceBreakdown: sourceStats
        },
        availableOperations: {
          seed: "/api/seed-products?operation=seed&category=gpu&maxProducts=20",
          "seed-priority": "/api/seed-products?operation=seed-priority&priority=high&maxProducts=30",
          "seed-all": "/api/seed-products?operation=seed-all",
          status: "/api/seed-products?operation=status"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "seed" && category) {
      // Seed products by category
      console.log(`🌱 Starting category seeding: ${category} (max: ${maxProducts})`);
      
      const stats = await seedByCategory(category, maxProducts);
      
      return NextResponse.json({
        success: true,
        operation: "seed",
        category,
        maxProducts,
        stats,
        message: `Successfully seeded ${stats.successful} ${category} products`,
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "seed-priority" && priority) {
      // Seed products by priority
      console.log(`🌱 Starting priority seeding: ${priority} (max: ${maxProducts})`);
      
      const engine = new ProductSeedingEngine();
      const stats = await engine.seedProducts({
        priority,
        maxProducts
      });
      
      return NextResponse.json({
        success: true,
        operation: "seed-priority",
        priority,
        maxProducts,
        stats,
        message: `Successfully seeded ${stats.successful} ${priority}-priority products`,
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "seed-all") {
      // Seed all products (use with caution)
      console.log(`🌱 Starting full database seeding (${PRODUCT_SEED_DATABASE.length} products)`);
      
      const stats = await seedAllProducts();
      
      return NextResponse.json({
        success: true,
        operation: "seed-all",
        stats,
        message: `Successfully seeded ${stats.successful} of ${stats.totalSeeds} products`,
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "seed-high-priority") {
      // Seed high-priority products only
      console.log(`🌱 Starting high-priority seeding (max: ${maxProducts})`);
      
      const stats = await seedHighPriorityProducts(maxProducts);
      
      return NextResponse.json({
        success: true,
        operation: "seed-high-priority",
        maxProducts,
        stats,
        message: `Successfully seeded ${stats.successful} high-priority products`,
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "preview") {
      // Preview products that would be seeded
      let seeds = PRODUCT_SEED_DATABASE;
      
      if (category) {
        seeds = seeds.filter(seed => seed.category === category);
      }
      
      if (priority) {
        seeds = seeds.filter(seed => seed.priority === priority);
      }
      
      const preview = seeds.slice(0, maxProducts).map(seed => ({
        asin: seed.asin,
        category: seed.category,
        priority: seed.priority,
        tags: seed.tags,
        source: seed.source
      }));
      
      return NextResponse.json({
        success: true,
        operation: "preview",
        filters: { category, priority, maxProducts },
        preview,
        totalMatching: seeds.length,
        wouldSeed: Math.min(seeds.length, maxProducts),
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "status") {
      // Get seeding engine status
      const engine = new ProductSeedingEngine();
      const results = engine.getResults();
      const stats = engine.getStats();
      
      return NextResponse.json({
        success: true,
        operation: "status",
        engine: {
          hasResults: results.length > 0,
          lastRunResults: results.length,
          lastRunStats: stats
        },
        database: {
          totalSeeds: PRODUCT_SEED_DATABASE.length,
          categories: [...new Set(PRODUCT_SEED_DATABASE.map(s => s.category))],
          priorities: [...new Set(PRODUCT_SEED_DATABASE.map(s => s.priority))]
        },
        timestamp: new Date().toISOString()
      });
    }

    // Default: return API documentation
    return NextResponse.json({
      success: true,
      message: "DXM Product Seeding API",
      operations: {
        info: "Get database information and statistics",
        seed: "Seed products by category",
        "seed-priority": "Seed products by priority level",
        "seed-high-priority": "Seed only high-priority products",
        "seed-all": "Seed entire product database (use carefully)",
        preview: "Preview products that would be seeded",
        status: "Get current seeding engine status"
      },
      parameters: {
        category: ["gpu", "cpu", "laptop", "monitor", "ssd", "psu", "ram"],
        priority: ["high", "medium", "low"],
        maxProducts: "1-100 (default: 50)"
      },
      database: {
        totalProducts: PRODUCT_SEED_DATABASE.length,
        categories: [...new Set(PRODUCT_SEED_DATABASE.map(s => s.category))].length,
        realASINs: true,
        dxmScoring: true
      },
      version: "v2.1-dxm"
    });

  } catch (error: any) {
    console.error("[SEED_PRODUCTS_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Product seeding request failed",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, options = {} } = body;

    if (operation === "custom-seed") {
      // Custom seeding with specific options
      const {
        categories = [],
        priority,
        maxProducts = 50,
        batchSize = 10,
        delayMs = 1000,
        skipExisting = false
      } = options;

      console.log(`🌱 Starting custom seeding:`, options);

      const engine = new ProductSeedingEngine(batchSize, delayMs);
      const stats = await engine.seedProducts({
        categories: categories.length > 0 ? categories : undefined,
        priority,
        maxProducts,
        skipExisting
      });

      return NextResponse.json({
        success: true,
        operation: "custom-seed",
        options,
        stats,
        results: engine.getResults(),
        message: `Custom seeding completed: ${stats.successful}/${stats.totalSeeds} products`,
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "batch-seed") {
      // Seed multiple categories in sequence
      const { batches = [] } = options;
      
      if (!Array.isArray(batches) || batches.length === 0) {
        return NextResponse.json({
          success: false,
          error: "Invalid batches array"
        }, { status: 400 });
      }

      console.log(`🌱 Starting batch seeding: ${batches.length} batches`);

      const batchResults = [];
      let totalStats = {
        totalSeeds: 0,
        successful: 0,
        failed: 0,
        processingTime: 0
      };

      for (const batch of batches) {
        const { category, priority, maxProducts = 20 } = batch;
        
        try {
          const engine = new ProductSeedingEngine();
          const stats = await engine.seedProducts({
            categories: category ? [category] : undefined,
            priority,
            maxProducts
          });

          batchResults.push({
            batch,
            stats,
            success: true
          });

          totalStats.totalSeeds += stats.totalSeeds;
          totalStats.successful += stats.successful;
          totalStats.failed += stats.failed;
          totalStats.processingTime += stats.processingTime;

        } catch (error: any) {
          batchResults.push({
            batch,
            error: error.message,
            success: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        operation: "batch-seed",
        batches: batches.length,
        batchResults,
        totalStats,
        message: `Batch seeding completed: ${totalStats.successful} total products seeded`,
        timestamp: new Date().toISOString()
      });
    }

    if (operation === "validate-seeds") {
      // Validate seed database without actually seeding
      const { sampleSize = 10 } = options;
      
      const sampleSeeds = PRODUCT_SEED_DATABASE
        .sort(() => 0.5 - Math.random())
        .slice(0, sampleSize);

      console.log(`🔍 Validating ${sampleSize} random seeds`);

      const validationResults = await Promise.all(
        sampleSeeds.map(async (seed) => {
          try {
            // Test Amazon API connectivity for this ASIN
            const response = await fetch(`/api/amazon?operation=product&asin=${seed.asin}`);
            const data = await response.json();
            
            return {
              asin: seed.asin,
              category: seed.category,
              valid: data.success,
              price: data.product?.price,
              availability: data.product?.availability,
              error: data.error
            };
          } catch (error: any) {
            return {
              asin: seed.asin,
              category: seed.category,
              valid: false,
              error: error.message
            };
          }
        })
      );

      const validCount = validationResults.filter(r => r.valid).length;
      const validationRate = (validCount / sampleSize) * 100;

      return NextResponse.json({
        success: true,
        operation: "validate-seeds",
        sampleSize,
        validationResults,
        validationStats: {
          valid: validCount,
          invalid: sampleSize - validCount,
          validationRate: Math.round(validationRate * 100) / 100
        },
        recommendation: validationRate >= 80 ? 
          "Database quality is excellent - proceed with seeding" :
          validationRate >= 60 ?
          "Database quality is good - monitor failed seeds" :
          "Database quality needs improvement - review failed ASINs",
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid operation. Supported: custom-seed, batch-seed, validate-seeds"
    }, { status: 400 });

  } catch (error: any) {
    console.error("[SEED_PRODUCTS_POST_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Product seeding POST request failed",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
