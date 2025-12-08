// src/app/api/dxm/score-test-v2/route.ts
// Enhanced DXM Scoring System Test API v2
// Multi-category testing, validation, and benchmarking

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeQueryParse, safeJsonParse } from "@/lib/apiSafe";
import { calculateDXMScoreV2, DXMScoreInputs } from "@/lib/dxmScoring";
import { getGPUData, calculateGPUScore } from "@/lib/categories/gpu";
import { getCPUData, calculateCPUScore } from "@/lib/categories/cpu";
import { getLaptopData, calculateLaptopScore } from "@/lib/categories/laptop";
import { getGpuDeals, getCpuDeals, getLaptopDeals, getFeaturedDeals, getTrendingDeals } from "@/lib/dealRadar";

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const testType = searchParams.get("type") || "quick";
  const category = searchParams.get("category") || "gpu";
  const product = searchParams.get("product") || "RTX 4070";
  const price = parseFloat(searchParams.get("price") || "549");
  const msrp = parseFloat(searchParams.get("msrp") || "599");
    if (testType === "quick") {
      // Quick test with category-specific scoring
      let score: number;
      let productData: any;
      
      switch (category) {
        case "gpu":
          productData = getGPUData(product);
          score = calculateGPUScore({
            asin: "TEST123",
            title: product,
            brand: productData.model?.includes("RTX") ? "NVIDIA" : "AMD",
            currentPrice: price,
            msrpPrice: msrp,
            amazonRating: 4.3,
            ratingCount: 1250,
            inStock: true
          });
          break;
          
        case "cpu":
          productData = getCPUData(product);
          score = calculateCPUScore({
            asin: "TEST123",
            title: product,
            brand: productData.model?.includes("i") ? "Intel" : "AMD",
            currentPrice: price,
            msrpPrice: msrp,
            amazonRating: 4.3,
            ratingCount: 1250,
            inStock: true
          });
          break;
          
        case "laptop":
          productData = getLaptopData(product);
          score = calculateLaptopScore({
            asin: "TEST123",
            title: product,
            brand: "Lenovo",
            currentPrice: price,
            msrpPrice: msrp,
            amazonRating: 4.3,
            ratingCount: 1250,
            inStock: true
          });
          break;
          
        default:
          throw new Error(`Unsupported category: ${category}`);
      }
      
      return NextResponse.json({
        ok: true,
        data: {
          test: "quick-v2",
          category,
          product,
          price,
          msrp,
          productData,
          dxmScore: score,
          precision: "v2 (2 decimals)",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (testType === "detailed") {
      // Detailed test with full component breakdown
      const inputs: DXMScoreInputs = {
        asin: "TEST123",
        title: product,
        brand: category === "gpu" ? "NVIDIA" : category === "cpu" ? "Intel" : "Lenovo",
        category: category as any,
        segment: "mainstream",
        currentPrice: price,
        msrpPrice: msrp,
        perfIndex: 70.0,
        tdpWatts: category === "gpu" ? 220 : category === "cpu" ? 125 : 65,
        amazonRating: 4.3,
        ratingCount: 1250,
        brandReputation: 0.95,
        clicks7d: 45,
        impressions7d: 1200,
        inStock: true,
        priceHistory: [msrp, msrp * 0.95, msrp * 0.92, price * 1.05, price]
      };

      const result = calculateDXMScoreV2(inputs);

      return NextResponse.json({
        ok: true,
        data: {
          test: "detailed-v2",
          category,
          inputs: {
            product,
            price,
            msrp,
            category,
            segment: inputs.segment
          },
          result,
          componentWeights: result.componentWeights,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (testType === "live") {
      // Test with live Deal Radar data across categories
      const [gpuDeals, cpuDeals, laptopDeals, featuredDeals, trendingDeals] = await Promise.all([
        getGpuDeals(),
        getCpuDeals(),
        getLaptopDeals(),
        getFeaturedDeals(3),
        getTrendingDeals(3)
      ]);

      const allDeals = [...gpuDeals, ...cpuDeals, ...laptopDeals];
      
      // Category breakdown
      const categoryStats = {
        gpu: {
          count: gpuDeals.length,
          avgScore: gpuDeals.reduce((sum, deal) => sum + deal.dxmScore, 0) / gpuDeals.length,
          topScore: Math.max(...gpuDeals.map(d => d.dxmScore)),
          topDeal: gpuDeals.find(d => d.dxmScore === Math.max(...gpuDeals.map(d => d.dxmScore)))?.title
        },
        cpu: {
          count: cpuDeals.length,
          avgScore: cpuDeals.reduce((sum, deal) => sum + deal.dxmScore, 0) / cpuDeals.length,
          topScore: Math.max(...cpuDeals.map(d => d.dxmScore)),
          topDeal: cpuDeals.find(d => d.dxmScore === Math.max(...cpuDeals.map(d => d.dxmScore)))?.title
        },
        laptop: {
          count: laptopDeals.length,
          avgScore: laptopDeals.reduce((sum, deal) => sum + deal.dxmScore, 0) / laptopDeals.length,
          topScore: Math.max(...laptopDeals.map(d => d.dxmScore)),
          topDeal: laptopDeals.find(d => d.dxmScore === Math.max(...laptopDeals.map(d => d.dxmScore)))?.title
        }
      };

      return NextResponse.json({
        ok: true,
        data: {
          test: "live-v2",
          totalDeals: allDeals.length,
          categoryStats,
          featuredDeals: featuredDeals.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            price: d.price,
            dxmScore: d.dxmScore
          })),
          trendingDeals: trendingDeals.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            price: d.price,
            previousPrice: d.previousPrice,
            dxmScore: d.dxmScore,
            savings: d.previousPrice ? Math.round(((d.previousPrice - d.price) / d.previousPrice) * 100) : 0
          })),
          overallStats: {
            averageScore: allDeals.reduce((sum, deal) => sum + deal.dxmScore, 0) / allDeals.length,
            scoreDistribution: {
              exceptional: allDeals.filter(d => d.dxmScore >= 9.5).length,
              excellent: allDeals.filter(d => d.dxmScore >= 9.0 && d.dxmScore < 9.5).length,
              veryGood: allDeals.filter(d => d.dxmScore >= 8.5 && d.dxmScore < 9.0).length,
              good: allDeals.filter(d => d.dxmScore >= 8.0 && d.dxmScore < 8.5).length,
              average: allDeals.filter(d => d.dxmScore >= 7.0 && d.dxmScore < 8.0).length,
              poor: allDeals.filter(d => d.dxmScore < 7.0).length
            }
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    if (testType === "benchmark") {
      // Multi-category benchmark comparison
      const testProducts = {
        gpu: [
          { name: "RTX 4090", price: 1599, msrp: 1699 },
          { name: "RTX 4080 SUPER", price: 999, msrp: 1199 },
          { name: "RTX 4070 SUPER", price: 549, msrp: 639 },
          { name: "RX 7800 XT", price: 479, msrp: 529 }
        ],
        cpu: [
          { name: "i9-13900K", price: 519, msrp: 589 },
          { name: "Ryzen 9 7950X", price: 599, msrp: 699 },
          { name: "i5-13600K", price: 269, msrp: 319 },
          { name: "Ryzen 7 7800X3D", price: 349, msrp: 449 }
        ],
        laptop: [
          { name: "Legion 7i RTX 4070", price: 1899, msrp: 2299 },
          { name: "MacBook Pro M3 Pro", price: 1799, msrp: 1999 },
          { name: "ThinkPad X1 Carbon", price: 1299, msrp: 1599 }
        ]
      };

      const benchmarkResults: any = {};

      for (const [cat, products] of Object.entries(testProducts)) {
        benchmarkResults[cat] = products.map(product => {
          let score: number;
          let productData: any;

          switch (cat) {
            case "gpu":
              productData = getGPUData(product.name);
              score = calculateGPUScore({
                asin: "BENCH",
                title: product.name,
                brand: product.name.includes("RTX") ? "NVIDIA" : "AMD",
                currentPrice: product.price,
                msrpPrice: product.msrp,
                amazonRating: 4.3,
                ratingCount: 1000,
                inStock: true
              });
              break;
              
            case "cpu":
              productData = getCPUData(product.name);
              score = calculateCPUScore({
                asin: "BENCH",
                title: product.name,
                brand: product.name.includes("i") ? "Intel" : "AMD",
                currentPrice: product.price,
                msrpPrice: product.msrp,
                amazonRating: 4.3,
                ratingCount: 1000,
                inStock: true
              });
              break;
              
            case "laptop":
              productData = getLaptopData(product.name);
              score = calculateLaptopScore({
                asin: "BENCH",
                title: product.name,
                brand: product.name.includes("MacBook") ? "Apple" : "Lenovo",
                currentPrice: product.price,
                msrpPrice: product.msrp,
                amazonRating: 4.3,
                ratingCount: 1000,
                inStock: true
              });
              break;
              
            default:
              score = 5.0;
              productData = {};
          }

          return {
            product: product.name,
            price: product.price,
            msrp: product.msrp,
            dxmScore: score,
            perfIndex: productData.perfIndex || 50,
            savings: product.msrp > product.price ? ((product.msrp - product.price) / product.msrp * 100).toFixed(1) + "%" : "0%",
            valueRating: score >= 9.0 ? "Exceptional" : score >= 8.0 ? "Excellent" : score >= 7.0 ? "Good" : "Fair"
          };
        }).sort((a, b) => b.dxmScore - a.dxmScore);
      }

      return NextResponse.json({
        ok: true,
        data: {
          test: "benchmark-v2",
          results: benchmarkResults,
          insights: {
            bestOverallValue: Object.values(benchmarkResults).flat().sort((a: any, b: any) => b.dxmScore - a.dxmScore)[0],
            categoryWinners: {
              gpu: benchmarkResults.gpu[0],
              cpu: benchmarkResults.cpu[0],
              laptop: benchmarkResults.laptop[0]
            }
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    if (testType === "validation") {
      // Score validation and consistency testing
      const testCases = [
        // High-end products with good deals
        { category: "gpu", product: "RTX 4090", price: 1499, msrp: 1699, expectedRange: [8.5, 9.5] },
        { category: "cpu", product: "i9-13900K", price: 489, msrp: 589, expectedRange: [8.0, 9.0] },
        { category: "laptop", product: "MacBook Pro M3 Pro", price: 1699, msrp: 1999, expectedRange: [8.0, 9.0] },
        
        // Overpriced products
        { category: "gpu", product: "RTX 4060", price: 399, msrp: 299, expectedRange: [3.0, 5.0] },
        { category: "cpu", product: "i5-13600K", price: 399, msrp: 319, expectedRange: [4.0, 6.0] },
        
        // Fair priced products
        { category: "gpu", product: "RTX 4070", price: 599, msrp: 599, expectedRange: [6.0, 7.5] },
        { category: "cpu", product: "Ryzen 7 7800X3D", price: 449, msrp: 449, expectedRange: [6.5, 8.0] }
      ];

      const validationResults = testCases.map(testCase => {
        let score: number;
        
        switch (testCase.category) {
          case "gpu":
            score = calculateGPUScore({
              asin: "VAL",
              title: testCase.product,
              brand: testCase.product.includes("RTX") ? "NVIDIA" : "AMD",
              currentPrice: testCase.price,
              msrpPrice: testCase.msrp,
              amazonRating: 4.2,
              ratingCount: 800,
              inStock: true
            });
            break;
            
          case "cpu":
            score = calculateCPUScore({
              asin: "VAL",
              title: testCase.product,
              brand: testCase.product.includes("i") ? "Intel" : "AMD",
              currentPrice: testCase.price,
              msrpPrice: testCase.msrp,
              amazonRating: 4.2,
              ratingCount: 800,
              inStock: true
            });
            break;
            
          case "laptop":
            score = calculateLaptopScore({
              asin: "VAL",
              title: testCase.product,
              brand: "Apple",
              currentPrice: testCase.price,
              msrpPrice: testCase.msrp,
              amazonRating: 4.2,
              ratingCount: 800,
              inStock: true
            });
            break;
            
          default:
            score = 5.0;
        }

        const inRange = score >= testCase.expectedRange[0] && score <= testCase.expectedRange[1];
        
        return {
          ...testCase,
          actualScore: score,
          inExpectedRange: inRange,
          deviation: inRange ? 0 : Math.min(
            Math.abs(score - testCase.expectedRange[0]),
            Math.abs(score - testCase.expectedRange[1])
          )
        };
      });

      const passedTests = validationResults.filter(r => r.inExpectedRange).length;
      const totalTests = validationResults.length;

      return NextResponse.json({
        ok: true,
        data: {
          test: "validation-v2",
          results: validationResults,
          summary: {
            passed: passedTests,
            total: totalTests,
            passRate: Math.round((passedTests / totalTests) * 100),
            avgDeviation: validationResults.reduce((sum, r) => sum + r.deviation, 0) / totalTests
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ 
      ok: false,
      error: "Invalid test type. Use: quick, detailed, live, benchmark, or validation" 
    }, { status: 400 });
});

// POST endpoint for custom scoring tests
export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ category?: string; [key: string]: any }>(request);
  const category = body?.category || "gpu";
    
    let score: number;
    
    // Category-specific custom scoring
    switch (category) {
      case "gpu":
        score = calculateGPUScore({
          asin: body?.asin || "CUSTOM",
          title: body?.title || "Custom GPU Test",
          brand: body?.brand || "NVIDIA",
          currentPrice: body?.currentPrice || 500,
          msrpPrice: body?.msrpPrice,
          amazonRating: body?.amazonRating,
          ratingCount: body?.ratingCount,
          inStock: body?.inStock !== false,
          priceHistory: body?.priceHistory
        });
        break;
        
      case "cpu":
        score = calculateCPUScore({
          asin: body?.asin || "CUSTOM",
          title: body?.title || "Custom CPU Test",
          brand: body?.brand || "Intel",
          currentPrice: body?.currentPrice || 300,
          msrpPrice: body?.msrpPrice,
          amazonRating: body?.amazonRating,
          ratingCount: body?.ratingCount,
          inStock: body?.inStock !== false,
          priceHistory: body?.priceHistory
        });
        break;
        
      case "laptop":
        score = calculateLaptopScore({
          asin: body?.asin || "CUSTOM",
          title: body?.title || "Custom Laptop Test",
          brand: body?.brand || "Lenovo",
          currentPrice: body?.currentPrice || 1200,
          msrpPrice: body?.msrpPrice,
          amazonRating: body?.amazonRating,
          ratingCount: body?.ratingCount,
          inStock: body?.inStock !== false,
          priceHistory: body?.priceHistory
        });
        break;
        
      default:
        // Generic v2 scoring
        const inputs: DXMScoreInputs = {
          asin: body?.asin || "CUSTOM",
          title: body?.title || "Custom Test",
          brand: body?.brand || "Unknown",
          category: category,
          segment: body?.segment || "mainstream",
          currentPrice: body?.currentPrice || 500,
          msrpPrice: body?.msrpPrice,
          perfIndex: body?.perfIndex || 50,
          tdpWatts: body?.tdpWatts,
          amazonRating: body?.amazonRating,
          ratingCount: body?.ratingCount,
          brandReputation: body?.brandReputation,
          clicks7d: body?.clicks7d,
          impressions7d: body?.impressions7d,
          inStock: body?.inStock !== false,
          priceHistory: body?.priceHistory,
          segmentMedians: body?.segmentMedians
        };
        
        const result = calculateDXMScoreV2(inputs);
        score = result.dxmValueScore;
    }

    return NextResponse.json({
      ok: true,
      data: {
        test: "custom-v2",
        category,
        inputs: body,
        dxmScore: score,
        precision: "v2 (2 decimals)",
        timestamp: new Date().toISOString()
      }
    });
});
