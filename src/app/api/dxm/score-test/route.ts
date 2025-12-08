// src/app/api/dxm/score-test/route.ts
// DXM Scoring System Test API
// Validate scoring algorithm and debug score components

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeQueryParse } from "@/lib/apiSafe";
import { log } from "@/lib/log";
import { calculateDXMScore, quickDXMScore, getGPUPerformanceIndex, extractGPUModel, DXMScoreInputs } from "@/lib/dxmScoring";
import { getGpuDeals } from "@/lib/dealRadar";

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const testType = searchParams.get("type") || "quick";
  const gpu = searchParams.get("gpu") || "RTX 4070";
  const price = parseFloat(searchParams.get("price") || "549");
  const msrp = parseFloat(searchParams.get("msrp") || "599");

  if (testType === "quick") {
    // Quick test with minimal inputs
    const perfIndex = getGPUPerformanceIndex(gpu);
    const score = quickDXMScore(perfIndex, price, msrp, "NVIDIA", "1440p-high");
    
    return NextResponse.json({
      ok: true,
      test: "quick",
      data: {
        gpu,
        price,
        msrp,
        perfIndex,
        dxmScore: score,
        model: extractGPUModel(gpu)
      }
    });
  }

  if (testType === "detailed") {
    // Detailed test with full inputs
    const perfIndex = getGPUPerformanceIndex(gpu);
    
    const inputs: DXMScoreInputs = {
      asin: "TEST123",
      title: gpu,
      brand: "NVIDIA",
      category: "gpu",
      segment: "1440p-high",
      currentPrice: price,
      msrpPrice: msrp,
      perfIndex,
      tdpWatts: 220,
      amazonRating: 4.3,
      ratingCount: 1250,
      brandReputation: 1.0,
      clicks7d: 45,
      impressions7d: 1200,
      inStock: true,
      priceHistory: [msrp, msrp * 0.95, msrp * 0.92, price * 1.05, price]
    };

    const result = calculateDXMScore(inputs);

    return NextResponse.json({
      ok: true,
      test: "detailed",
      data: {
        inputs: {
          gpu,
          price,
          msrp,
          perfIndex,
          segment: inputs.segment
        },
        result
      }
    });
  }

  if (testType === "live") {
    // Test with live Deal Radar data
    const deals = await getGpuDeals();
    const topDeals = deals.slice(0, 5).map(deal => ({
      id: deal.id,
      title: deal.title,
      brand: deal.brand,
      price: deal.price,
      previousPrice: deal.previousPrice,
      dxmScore: deal.dxmScore,
      perfIndex: getGPUPerformanceIndex(deal.title),
      segment: deal.price > 1200 ? "enthusiast" : deal.price > 600 ? "1440p-high" : "1080p-mainstream"
    }));

    return NextResponse.json({
      ok: true,
      test: "live",
      data: {
        totalDeals: deals.length,
        topDeals,
        averageScore: deals.reduce((sum, deal) => sum + deal.dxmScore, 0) / deals.length,
        scoreDistribution: {
          excellent: deals.filter(d => d.dxmScore >= 9).length,
          good: deals.filter(d => d.dxmScore >= 7 && d.dxmScore < 9).length,
          fair: deals.filter(d => d.dxmScore >= 5 && d.dxmScore < 7).length,
          poor: deals.filter(d => d.dxmScore < 5).length
        }
      }
    });
  }

  if (testType === "benchmark") {
    // Benchmark different GPUs
    const testGPUs = [
      { name: "RTX 4090", price: 1599, msrp: 1699 },
      { name: "RTX 4080 SUPER", price: 999, msrp: 1199 },
      { name: "RTX 4070 SUPER", price: 549, msrp: 639 },
      { name: "RTX 4060", price: 299, msrp: 329 },
      { name: "RX 7800 XT", price: 479, msrp: 529 },
      { name: "RX 7600", price: 249, msrp: 279 }
    ];

    const benchmarkResults = testGPUs.map(gpu => {
      const perfIndex = getGPUPerformanceIndex(gpu.name);
      const score = quickDXMScore(perfIndex, gpu.price, gpu.msrp, gpu.name.startsWith("RTX") ? "NVIDIA" : "AMD");
      
      return {
        gpu: gpu.name,
        price: gpu.price,
        msrp: gpu.msrp,
        perfIndex,
        dxmScore: score,
        perfPerDollar: perfIndex / gpu.price,
        savings: gpu.msrp > gpu.price ? ((gpu.msrp - gpu.price) / gpu.msrp * 100).toFixed(1) + "%" : "0%"
      };
    });

    // Sort by DXM score
    benchmarkResults.sort((a, b) => b.dxmScore - a.dxmScore);

    return NextResponse.json({
      ok: true,
      test: "benchmark",
      data: {
        results: benchmarkResults,
        insights: {
          bestValue: benchmarkResults[0],
          worstValue: benchmarkResults[benchmarkResults.length - 1],
          avgScore: benchmarkResults.reduce((sum, r) => sum + r.dxmScore, 0) / benchmarkResults.length
        }
      }
    });
  }

  return NextResponse.json({ 
    ok: false,
    error: "Invalid test type. Use: quick, detailed, live, or benchmark" 
  }, { status: 400 });
});

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await request.json();
  
  const inputs: DXMScoreInputs = {
    asin: body.asin || "CUSTOM",
    title: body.title || "Custom GPU Test",
    brand: body.brand || "NVIDIA",
    category: "gpu",
    segment: body.segment || "1440p-high",
    currentPrice: body.currentPrice || 500,
    msrpPrice: body.msrpPrice,
    baselinePrice: body.baselinePrice,
    perfIndex: body.perfIndex || getGPUPerformanceIndex(body.title || "RTX 4070"),
    tdpWatts: body.tdpWatts,
    amazonRating: body.amazonRating,
    ratingCount: body.ratingCount,
    brandReputation: body.brandReputation,
    clicks7d: body.clicks7d,
    impressions7d: body.impressions7d,
    inStock: body.inStock !== false,
    priceHistory: body.priceHistory,
    segmentMedians: body.segmentMedians
  };

  const result = calculateDXMScore(inputs);

  return NextResponse.json({
    ok: true,
    test: "custom",
    data: {
      inputs,
      result
    }
  });
});
