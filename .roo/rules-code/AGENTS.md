# Project Coding Rules (Non-Obvious Only)

## DXM Scoring Integration
- Always use `calculateDXMScore()` from `src/lib/dxmScoring.ts` - never hardcode scores
- GPU scoring requires `calculateGPUScore()` with category-specific enhancements
- CPU scoring uses specialized algorithms in `src/lib/categories/cpu.ts`
- Scoring calculations must consider segment context (budget vs. enthusiast baselines)

## Affiliate Link Generation
- Use `buildAmazonProductUrl(asin, { context: {...} })` instead of direct Amazon links
- Context object must include: `category`, `source`, `intent`, `pageType`
- Tracking ID selection follows priority: Intent > Category > Source > Default
- See `src/lib/trackingIdRouter.ts` for routing logic implementation

## API Route Patterns
- All API routes must wrap handlers with `apiSafe()` from `src/lib/apiSafe.ts`
- Use `safeJsonParse()` and `safeQueryParse()` for input validation
- Error responses are automatically sanitized - never expose raw errors
- Logging is handled automatically by the wrapper

## Environment Variable Access
- Import from `src/lib/env.ts` - never access `process.env` directly
- Environment validation uses Zod schemas with different rules for dev/prod
- Production requires: AMAZON_ACCESS_KEY_ID, DATABASE_URL, APP_SECRET, JWT_SECRET
- Client-safe variables use NEXT_PUBLIC_ prefix

## Amazon API Integration
- AWS Signature v4 authentication implemented in `src/lib/awsSigning.ts`
- 15-minute LRU caching with category-specific TTL settings
- Graceful fallback to mock data when credentials missing
- Mock data files: `mockDeals.ts`, `mockGpus.ts`, `mockCpus.ts`, `mockLaptops.ts`

## Logging Requirements
- Use global `log` instance from `src/lib/log.ts` for all logging
- Structured JSON format in production, pretty-printed in development
- Error objects include stack traces only in development mode
- Log levels: info, warn, error, debug (debug only in dev)