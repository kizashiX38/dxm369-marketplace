# Project Architecture Rules (Non-Obvious Only)

## DXM Scoring Engine Architecture
- Multi-dimensional algorithm: Performance Value (40%), Deal Quality (25%), Trust Signal (15%), Efficiency (10%), Trend Signal (10%)
- Segment-aware normalization prevents cross-category anomalies (budget RTX 3050 vs enthusiast RTX 4090)
- Price momentum analysis with 7-day trend windows and consecutive drop bonuses
- GPU performance database with 100+ models including TDP, VRAM, architecture metadata

## Amazon API Integration Architecture
- AWS Signature v4 with custom implementation handling request signing and timestamp validation
- 15-minute LRU caching with category-specific TTL (GPU data cached longer than volatile deals)
- Graceful degradation: API failure → mock data fallback → error handling
- Category-specific search optimization with specialized Amazon browse nodes

## Affiliate Revenue Architecture
- Context-aware tracking ID router with hierarchical priority system
- 12+ tracking IDs with automated selection based on traffic source, product category, user intent
- Revenue attribution pipeline: impressions → clicks → conversions with automated sync
- Earnings optimization engine with actionable recommendations and EPC/CR analytics

## Environment Validation Architecture
- Dual Zod schemas: server variables (secrets) vs. client variables (NEXT_PUBLIC_ prefixed)
- Production readiness scoring with 8+ required variables and validation blocking deployment
- Environment inheritance with development overrides and production hardening
- Configuration helpers: `isDatabaseConfigured()`, `isAmazonConfigured()`, `isEmailConfigured()`

## Component Architecture Constraints
- Server-first architecture with client components only for interactivity (hooks, state, events)
- Category-specific scoring modules in `src/lib/categories/` with specialized algorithms
- Image system with DXMProductImage component handling Amazon images + local fallbacks
- Glassmorphism design system with CSS variables and Tailwind utilities

## Database Architecture Patterns
- PostgreSQL schema v2 with product tables, category-specific spec tables, deal tracking
- Migration system with forward-only design (no rollbacks) in `database/migrations/`
- Connection pooling with environment-configured min/max connections
- Analytics tables for user behavior, email subscriptions, impression/click tracking

## API Route Architecture
- `apiSafe()` wrapper providing consistent error handling, logging, and response sanitization
- Input validation with `safeJsonParse()` and `safeQueryParse()` preventing malformed requests
- Structured logging with global `log` instance and JSON production format
- Error responses never expose stack traces or raw errors to clients

## Caching and Performance Architecture
- Multi-layer caching: Next.js static generation + API response caching + LRU eviction
- Image optimization with Next.js Image component and SVG CSP sandboxing
- Lazy loading architecture with below-fold component deferral
- Deal detection system with price monitoring and alert mechanisms

## Build and Deployment Architecture
- Next.js 14 App Router with TypeScript strict mode and custom path resolution
- Cloudflare Pages/Workers optimization with `output: 'standalone'` configuration
- Build pipeline with environment validation gates blocking invalid deployments
- Production hardening with required environment variables and error handling

## Development Workflow Architecture
- pnpm monorepo with custom scripts for validation, earnings import, environment checking
- ESLint with Next.js config including TypeScript and import validation rules
- Tailwind CSS with extended glassmorphism utilities and cyber theme color system
- Mock data architecture providing comprehensive development fallbacks

## Operational Architecture
- Phase-based development with ops documentation in dated files
- 30-day revenue plan with SEO content generation and automated deployment
- Kanban task management with completion tracking and progress reporting
- Automated earnings sync with cron jobs and manual override capabilities

## Security Architecture
- Environment variable isolation with server-only access to secrets
- API route protection with admin keys and rate limiting
- Affiliate link validation preventing direct Amazon URL usage
- Error sanitization preventing information leakage to clients

## Analytics and Monitoring Architecture
- DXM analytics pipeline tracking pageviews, clicks, impressions with batch processing
- Earnings dashboard with optimization recommendations and performance metrics
- User behavior tracking with privacy-conscious data collection
- System monitoring with health checks and performance metrics