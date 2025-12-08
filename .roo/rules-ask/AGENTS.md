# Project Documentation Rules (Non-Obvious Only)

## DXM Scoring System Context
- Multi-dimensional scoring engine ranks products 0-10 using performance, deal quality, trust, efficiency, trend signals
- Segment-aware normalization: budget vs. 1080p vs. 1440p vs. 4k vs. enthusiast products have different baselines
- Real-time calculation with price momentum analysis and trend signals
- GPU performance database includes 100+ models with TDP, VRAM, architecture data

## Amazon API Integration Details
- AWS Signature v4 authentication with custom implementation in `src/lib/awsSigning.ts`
- 15-minute intelligent LRU caching with category-specific TTL settings
- Graceful fallback to mock data when API credentials missing or API fails
- Category mapping: GPU, CPU, RAM, SSD, Motherboard, PSU, Monitor, Laptop with specialized search

## Affiliate Revenue System
- Context-aware tracking ID system with 12+ tracking IDs automatically selected by priority
- Priority hierarchy: Intent > Category > Source > Default (review > gpu > seo > main)
- Tracking IDs follow pattern: `dxmatrix-{category|source|intent}-20`
- Revenue attribution through impressions, clicks, conversions with automated earnings sync

## Environment Architecture
- Strict Zod validation with separate schemas for server vs. client variables
- Production requires 8+ specific variables including Amazon credentials and database URL
- Environment readiness scoring system with detailed validation reports
- Client-safe variables use NEXT_PUBLIC_ prefix, server variables are secret

## Component Architecture Patterns
- Server components by default with "use client" directive only for interactivity
- Category-specific scoring logic in `src/lib/categories/` folder (GPU, CPU, laptop specialized algorithms)
- Glassmorphism design system with cyber theme: dark blue background, glass panels, cyan/purple/orange accents
- Image optimization with Next.js Image component and SVG CSP sandboxing

## Database Schema Understanding
- PostgreSQL with custom schema v2 including product tables, category-specific spec tables, deal tracking
- Migration system with scripts in `database/migrations/` directory
- Connection pooling configured through environment variables
- User analytics, email subscriptions, impression/click metrics tracking

## API Route Patterns
- All routes use `apiSafe()` wrapper providing consistent error handling and logging
- Never expose raw errors to clients - responses automatically sanitized
- Input validation using `safeJsonParse()` and `safeQueryParse()` utilities
- Structured logging with global `log` instance from `src/lib/log.ts`

## Build and Deployment Context
- Next.js 14 App Router with TypeScript strict mode and custom path aliases
- Cloudflare Pages/Workers optimized with `output: 'standalone'` configuration
- Build validation with environment checking required before deployment
- Production URL: https://dxm369.com with automated deployment blocking on validation failures

## Performance Optimization Details
- Static generation prioritized where possible with lazy loading below fold
- Amazon API responses cached for 15 minutes with intelligent eviction
- Image optimization with fallbacks and Next.js Image component configuration
- Deal detection system with price drop alerts and deal qualification logic

## Development Workflow Context
- pnpm package manager with custom scripts for environment validation and earnings import
- ESLint with Next.js config including TypeScript rules and import validation
- Tailwind CSS with custom glassmorphism utilities and cyber theme color palette
- Mock data system for development with comprehensive fallback datasets

## Operational Documentation
- Extensive ops logs in `ops/` directory with dated operational reports
- Phase-based development approach with completion tracking and next steps
- 30-day passive revenue plan with SEO page generation and content strategy
- Kanban implementation board for project management and task tracking