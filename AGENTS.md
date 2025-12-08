# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build Commands (Non-Obvious Only)

- `pnpm build:strict` - Includes environment validation before build (blocks deployment with invalid env)
- `pnpm check:env` - Validates production readiness (different rules for dev/prod)
- `pnpm validate-env` - Detailed readiness score with missing/configured variable counts

## DXM Scoring System (Critical - Never Hardcode)

- Multi-dimensional algorithm: Performance Value (40%), Deal Quality (25%), Trust Signal (15%), Efficiency (10%), Trend Signal (10%)
- Segment-aware normalization prevents cross-category anomalies (budget RTX 3050 vs enthusiast RTX 4090)
- Price momentum analysis with 7-day trend windows and consecutive drop bonuses
- GPU performance database includes 100+ models with TDP, VRAM, architecture metadata

## API Route Security (Mandatory Pattern)

- **ALL API routes must use `apiSafe()` wrapper** from `src/lib/apiSafe.ts` (not optional)
- **Response format:** All routes MUST return `{ ok: true/false, data/error }` structure
- **Error handling:** Raw errors never exposed to clients - responses automatically sanitized
- **Input validation:** Use `safeJsonParse()` for POST/PUT bodies and `safeQueryParse()` for query params
- **Structured logging:** Global `log` instance from `src/lib/log.ts` - never use `console.log/error/warn`
- **Admin routes:** Use `env.securityConfig.adminSecret` for authentication (never `process.env.ADMIN_SECRET`)

### Required Pattern for All Routes

```typescript
import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeJsonParse, safeQueryParse } from "@/lib/apiSafe";
import { env } from "@/lib/env";

// GET handler
export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const param = searchParams.get("param");
  
  const data = await fetchData();
  
  return NextResponse.json({ ok: true, data });
});

// POST handler
export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ field: string }>(request);
  
  if (!body || !body.field) {
    return NextResponse.json({ ok: false, error: "Missing field" }, { status: 400 });
  }
  
  const result = await processData(body);
  
  return NextResponse.json({ ok: true, data: result });
});
```

### Admin Route Authentication Pattern

```typescript
export const GET = apiSafe(async (request: NextRequest) => {
  const adminKey = request.headers.get("x-admin-key");
  const secret = env.securityConfig.adminSecret;
  
  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  
  // ... handler logic
});
```

## Environment Hardening (Enterprise-Grade)

- Dual Zod schemas: server secrets vs client NEXT_PUBLIC variables
- Production requires 8+ specific variables including Amazon credentials and database URL
- Environment inheritance with development overrides and production hardening
- Configuration helpers: `isDatabaseConfigured()`, `isAmazonConfigured()`, `isEmailConfigured()`

## Affiliate Revenue System (Context-Aware)

- Tracking ID router with hierarchical priority: Intent > Category > Source > Default
- 12+ tracking IDs automatically selected based on traffic source, product category, user intent
- Revenue attribution pipeline: impressions → clicks → conversions with automated sync
- Earnings optimization engine with actionable recommendations and EPC/CR analytics

## GPU Category Intelligence (Specialized Logic)

- Performance database with 100+ GPU models including architecture-specific bonuses
- Brand reputation scoring: NVIDIA (1.00), AMD (0.95), ASUS (0.92), MSI (0.90)
- VRAM future-proofing bonus for 16GB+ cards in high-resolution segments
- Ray tracing capability bonus for RTX/RDNA 3 architectures

## Amazon API Integration (Custom Implementation)

- AWS Signature v4 with custom implementation handling request signing and timestamp validation
- 15-minute LRU caching with category-specific TTL (GPU data cached longer than volatile deals)
- Graceful degradation: API failure → mock data fallback → error handling
- Category-specific search optimization with specialized Amazon browse nodes

## Logging Architecture (Structured)

- Global `log` instance from `src/lib/log.ts` - never use console.log directly
- JSON format in production, pretty-printed in development
- Error objects include stack traces only in development mode
- Log levels filtered: debug level excluded in production

## Component Constraints (Non-Standard)

- Category-specific scoring modules in `src/lib/categories/` with specialized algorithms
- Image system with DXMProductImage component handling Amazon images + local fallbacks
- Glassmorphism design system with CSS variables and Tailwind utilities
- Deal detection system with price monitoring and alert mechanisms