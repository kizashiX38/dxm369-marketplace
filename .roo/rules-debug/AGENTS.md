# Project Debug Rules (Non-Obvious Only)

## Environment Validation Debugging
- Run `pnpm validate-env` for detailed environment readiness report with scores
- Check `src/lib/env.ts` for Zod validation errors - different schemas for dev/prod
- Production requires: AMAZON_ACCESS_KEY_ID, DATABASE_URL, APP_SECRET, JWT_SECRET, RATE_LIMIT_SECRET
- Missing variables cause hard failures in production, warnings in development

## API Route Debugging
- All API routes wrapped with `apiSafe()` - check `src/lib/apiSafe.ts` for error handling
- Raw errors never exposed to clients - sanitized responses only
- Error logging uses global `log` instance with structured JSON format
- Stack traces only included in development mode

## Amazon API Debugging
- AWS Signature v4 authentication in `src/lib/awsSigning.ts` - custom implementation
- 15-minute LRU caching with category-specific TTL - check cache eviction
- Graceful fallback to mock data when credentials missing
- Mock files: `mockDeals.ts`, `mockGpus.ts`, `mockCpus.ts`, `mockLaptops.ts`, `mockBuilds.ts`

## Database Debugging
- PostgreSQL schema in `database/schema-v2.sql` with custom migrations
- Connection pooling configured through environment variables
- Database imports isolated to server-side - client component errors indicate wrong import location
- Migration scripts in `database/migrations/` directory

## DXM Scoring Debugging
- Never hardcode scores - always use `calculateDXMScore()` from `dxmScoring.ts`
- GPU scoring uses `calculateGPUScore()` with category-specific logic
- Segment context critical: budget vs. enthusiast products have different baselines
- Performance index database in `src/lib/categories/gpu.ts` with 100+ GPU models

## Affiliate Link Debugging
- Use `buildAmazonProductUrl()` with context object for tracking ID selection
- Priority system: Intent > Category > Source > Default
- Tracking ID router in `src/lib/trackingIdRouter.ts` handles automatic selection
- Invalid ASINs cause failures - validate with `isValidASIN()` from affiliate utils

## Component Debugging
- Server components by default - "use client" directive only when necessary
- Image components must use `DXMProductImage` for fallback handling
- Glassmorphism styling uses specific Tailwind classes and CSS variables
- Category-specific components in `src/lib/categories/` have specialized logic

## Logging Debugging
- Global `log` instance from `src/lib/log.ts` - never use console.log directly
- Structured JSON in production, pretty-printed in development
- Error objects include stack traces only in development
- Log levels: info, warn, error, debug (debug filtered out in production)

## Build Debugging
- `pnpm build:strict` includes environment validation before build
- TypeScript strict mode with custom path aliases (`@/*` → `./src/*`)
- ESLint uses `eslint-config-next` with TypeScript rules
- Cloudflare deployment requires `output: 'standalone'` in `next.config.mjs`

## Performance Debugging
- Next.js Image component with `unoptimized: false` for optimization
- SVG support enabled with CSP sandboxing
- Static generation where possible - check for dynamic rendering issues
- Lazy loading for components below fold

## Deployment Debugging
- Environment validation blocks invalid deployments
- Production URL: https://dxm369.com
- Build validation required before deployment
- Check `ops/` directory for deployment logs and troubleshooting guides