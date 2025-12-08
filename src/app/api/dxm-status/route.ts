// src/app/api/dxm-status/route.ts
// DXM369 Marketplace Status Endpoint

import { NextResponse } from "next/server";
import { apiSafe } from "@/lib/apiSafe";
import { env, amazonConfig } from "@/lib/env";

export const GET = apiSafe(async () => {
  const config = {
    hasAccessKey: !!amazonConfig.accessKeyId,
    hasSecretKey: !!amazonConfig.secretAccessKey,
    hasPartnerTag: !!amazonConfig.associateTag,
    region: amazonConfig.region || 'us-east-1',
    host: amazonConfig.host || 'webservices.amazon.com'
  };

  const isConfigured = config.hasAccessKey && config.hasSecretKey && config.hasPartnerTag;

  return NextResponse.json({
    ok: true,
    data: {
      status: "DXM369 Marketplace",
      version: "v3.8 Glass Cyber Terminal",
      timestamp: new Date().toISOString(),
      amazon_api: {
        configured: isConfigured,
        mode: isConfigured ? 'live' : 'mock_fallback',
        region: config.region,
        host: config.host,
        credentials: {
          access_key: config.hasAccessKey ? '✅ Set' : '❌ Missing',
          secret_key: config.hasSecretKey ? '✅ Set' : '❌ Missing', 
          partner_tag: config.hasPartnerTag ? '✅ Set' : '❌ Missing'
        }
      },
      features: {
        deal_cards: '✅ Active',
        glass_ui: '✅ Active',
        sidebar_navigation: '✅ Active',
        dxm_scoring: '✅ Active',
        caching: '✅ Active',
        error_fallbacks: '✅ Active'
      },
      categories: {
        live: ['GPU', 'CPU', 'Laptop'],
        coming_soon: ['RAM', 'SSD', 'Motherboard', 'PSU', 'Monitor'],
        total: '50+ Categories'
      },
      endpoints: {
        test_gpu_search: '/api/test-gpu-search',
        test_product: '/api/test-product?asin=B0BJQRXJZD',
        health: '/api/health',
        status: '/api/dxm-status'
      }
    }
  });
});
