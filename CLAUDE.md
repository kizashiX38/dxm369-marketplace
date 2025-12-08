# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated:** 2025-12-08
**Status:** Phase 1 Complete ✅ | Shadow Intelligence Deployed ✅ | Phase 2 Ready 🚀

## Project Overview

**DXM369 Gear Nexus** is a hardware discovery marketplace with **Shadow Intelligence Layer** — a fully autonomous Amazon scraping system. The project aggregates deals and product listings through affiliate links, featuring intelligent DXM scoring, price tracking, and deal detection.

**Tech Stack:**
- Next.js 14 (App Router, React Server Components)
- TypeScript (strict mode)
- Tailwind CSS (custom cyber-glass theme)
- npm (package manager)
- PostgreSQL (with pg driver)
- Playwright (headless browser scraper)
- Vercel (deployment platform with cron jobs)

## Development Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint

# Environment validation
npm run validate-env     # Validate all environment variables
npm run check-env        # Build-time env check (non-blocking)

# Data management
npm run rehydrate        # Refresh product data from Amazon
npm run import-earnings  # Import earnings CSV from Amazon Associates

# Shadow Intelligence
npx playwright install chromium  # Install Playwright browser
# Then use UI at http://localhost:3000/admin/asin-manager

# Testing API Integration
curl http://localhost:3000/api/dxm-status                    # System status
curl http://localhost:3000/api/health                        # Health check
curl http://localhost:3000/api/shadow/scrape -X POST \
  -H "Content-Type: application/json" \
  -d '{"asin":"B0BJQRXJZD"}'                                 # Test Shadow scraper
```

## Environment Setup

Create `.env.local` from `.env.local.example` (62 variables documented):

```bash
# Amazon Product Advertising API
AMAZON_ACCESS_KEY_ID=your_access_key
AMAZON_SECRET_ACCESS_KEY=your_secret_key
AMAZON_ASSOCIATE_TAG=dxm369-20
AMAZON_REGION=us-east-1
AMAZON_HOST=webservices.amazon.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/dxm369
# Local dev: Use localhost (SSL automatically disabled)
# Production: Use full connection string with ?sslmode=require

# Admin Security
ADMIN_SECRET=your_secret_key_here
# Required in production for /admin routes
# Pass as x-admin-key header in API requests

# Application
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20
DXM_APP_ENV=prod

# Earnings Automation (optional)
CRON_SECRET=your_cron_secret
# For Vercel cron job authentication (daily earnings sync at 2 AM UTC)

# Email (optional)
SENDGRID_API_KEY=your_sendgrid_key
# For newsletter functionality

# Error Tracking (optional)
SENTRY_DSN=your_sentry_dsn
```

**See:** `.env.local.example` for complete list with descriptions

## Architecture Overview

### Core Intelligence System

**DXM Value Score Algorithm** (`src/lib/dxmScoring.ts`):
- Multi-dimensional scoring engine that ranks products 0-10
- Components: Performance Value (40%), Deal Quality (15%), Trust Signal (20%), Efficiency (10%), Trend Signal (15%)
- Segment-aware normalization (budget, 1080p, 1440p, 4k, enthusiast)
- Real-time calculation with price momentum analysis
- Never hardcode scores - always use `calculateDXMScore()` function

**Amazon Integration Triple-Fallback Strategy:**
1. **Shadow Intelligence** (`src/services/shadow-scraper/amazonScraper.ts`) - Playwright scraper (primary)
2. **PA-API** (`src/lib/amazonAdapter.ts`) - Official Amazon API (secondary)
3. **Mock Data** (`src/lib/mock*.ts`) - Development fallback (tertiary)

### Data Layer

**Database Schema** (`database/schema-v2.sql`):
- PostgreSQL schema with product tables, category-specific spec tables (GPU, CPU, laptop)
- Deal tracking with impression/click metrics
- User analytics and email subscriptions
- Shadow Intelligence tables for scraped data
- Migration scripts in `database/migrations/`

**Database Connection** (`src/lib/db.ts`):
- Connection pooling with pg driver
- Automatic SSL detection (disabled for localhost, enabled for production)
- Server-side only - never import in client components

### Component Architecture

**Key Components** (`src/components/`):
- `CyberDealCard.tsx` - Glassmorphism product card with DXM score display
- `DXMProductImage.tsx` - Optimized product image with fallbacks
- `CyberSidebar.tsx` - Newegg-style category navigation
- `ScoreBreakdown.tsx` - Interactive DXM score visualization
- `Header.tsx` / `Footer.tsx` - Site navigation
- `SearchBar.tsx` - Product search interface
- `NewsletterSignup.tsx` - Email subscription component
- `mobile/` - Mobile-optimized components

### API Routes (`src/app/api/`)

**51 API endpoints organized into:**

**DXM System APIs** (`api/dxm/`):
- `GET /api/dxm/products/{category}` - Product catalog (gpus, cpus, laptops, monitors, etc.)
- `POST /api/dxm/click` - Track affiliate link clicks
- `POST /api/dxm/pageview` - Track page views
- `POST /api/dxm/batch` - Batch analytics events
- `GET /api/dxm/monitoring` - System monitoring metrics
- `GET /api/dxm/score-test-v2` - DXM scoring algorithm test endpoint

**Admin APIs** (`api/admin/`) - **Require `x-admin-key` header in production:**
- `GET /api/admin/earnings` - Earnings data (EPC, CR, revenue by tracking ID)
- `GET /api/admin/earnings/optimization` - Revenue optimization recommendations
- `POST /api/admin/earnings/sync` - Manual earnings sync from Amazon
- `POST /api/admin/earnings/upload` - Upload earnings CSV
- `GET /api/admin/products/list` - Product database listing
- `POST /api/admin/products/add` - Add product
- `POST /api/admin/products/refresh` - Refresh product data from Amazon
- `DELETE /api/admin/products/delete` - Delete product
- `POST /api/admin/products/bulkImport` - Bulk import from seed files
- `GET /api/admin/analytics` - Analytics dashboard data
- `GET /api/admin/newsletter` - Newsletter analytics

**Shadow Intelligence** (`api/shadow/`):
- `POST /api/shadow/scrape` - Scrape ASIN with Playwright

**Amazon Integration** (`api/amazon/`):
- `GET /api/amazon/search` - PA-API product search
- `GET /api/amazon/items` - PA-API item lookup

**Other Services:**
- `GET /api/health` - Application health check
- `GET /api/dxm-status` - System status (db, cache, API)
- `POST /api/email/subscribe` - Newsletter signup
- `POST /api/email/unsubscribe` - Newsletter unsubscribe

### Page Structure (`src/app/`)

**Category Pages:**
- `/gpus` - GPU rankings with live Amazon data
- `/cpus` - CPU rankings and comparisons
- `/laptops` - Laptop recommendations
- `/gaming-monitors` - Monitor listings
- `/power-supplies` - PSU recommendations
- `/storage` - SSD listings
- `/memory` - RAM listings
- `/motherboards` - Motherboard listings
- `/deals` - DXM Deals Radar (sorted by Value Score)
- `/builds` - Curated PC builds

**SEO Landing Pages:**
- `/best-gpu-deals` - SEO-optimized GPU deals
- `/best-laptop-deals` - Laptop deals
- `/best-ssd-deals` - SSD deals
- `/best-gaming-monitors` - Monitor deals

**Content Pages:**
- `/blog` - Blog posts and guides
- `/about` - About page
- `/legal` - Privacy policy, terms, affiliate disclosure

**Admin Panel** (`/admin` - protected by middleware):
- `/admin` - Dashboard overview
- `/admin/asin-manager` - Product ASIN management + Shadow scraper UI
- `/admin/earnings` - Revenue analytics dashboard
- `/admin/products` - Product database management
- `/admin/health` - System health monitoring
- `/admin/launch-readiness` - Production deployment checklist

**SEO Configuration:**
- `sitemap.ts` - Dynamic sitemap generation
- `robots.ts` - Robots.txt configuration

## Key Libraries & Utilities

**Core Business Logic** (`src/lib/`):
- `env.ts` - Server-side environment validation (Zod schemas)
- `env-client.ts` - Client-safe environment variables
- `db.ts` - PostgreSQL connection pool (server-only)
- `log.ts` - Logging utility
- `dxmScoring.ts` - DXM Value Score algorithm
- `dealDetection.ts` - Price drop detection
- `dealRadar.ts` - Deal aggregation system
- `amazonAdapter.ts` - Amazon PA-API client with caching
- `awsSigning.ts` - AWS Signature v4 signing
- `affiliate.ts` - Amazon affiliate link builder
- `trackingIdRouter.ts` - Context-aware tracking ID selection
- `tracking.ts` - Client-side analytics tracking

**Category Systems** (`src/lib/categories/`):
- `gpu.ts` - GPU-specific scoring and metadata
- `cpu.ts` - CPU-specific scoring and metadata
- `laptop.ts` - Laptop-specific scoring and metadata

**Services** (`src/lib/services/`):
- `products.ts` - Product data service
- `adminProducts.ts` - Admin product management
- `earnings.ts` - Earnings data service
- `earningsAnalytics.ts` - Revenue optimization
- `revenueOptimization.ts` - EPC/CR analysis
- `analytics.ts` - Event tracking
- `clickTracking.ts` - Affiliate click tracking
- `newsletter.ts` - Email management
- `asinFetcher.ts` - ASIN fetch service
- `seedLoader.ts` - Mock data loader

**Security** (`src/lib/security/`):
- `asinValidation.ts` - ASIN format validation
- `rateLimit.ts` - API rate limiting

**Types** (`src/lib/types/`):
- `product.ts` - DXMProduct canonical type definition

## Design System

**Cyber Glass Theme:**
- Dark theme with glassmorphism effects
- Background: `#0a1124` (dark blue)
- Glass panels: `rgba(255, 255, 255, 0.05)` with backdrop blur
- Accent colors: Cyan (`#00d9ff`), Purple, Orange for scores
- Terminal-inspired monospace fonts for data
- Custom styles in `src/styles/cyber-glass.css`

**Tailwind Configuration** (`tailwind.config.ts`):
- Custom color palette
- Glass panel utilities
- Path alias: `@/*` → `./src/*`

## Important Development Notes

### 1. React Server Components

**All pages are React Server Components by default** - Use `"use client"` directive only when necessary:
- Client interactivity (onClick, onChange handlers)
- React hooks (useState, useEffect, useContext)
- Browser APIs (window, document, localStorage)

Server components can:
- Directly access databases
- Use environment variables from `lib/env.ts`
- Import server-only code

### 2. Database Usage

**Database is server-side only:**
- Import `db` from `@/lib/db` in server components, API routes, and server utilities
- Never import `db` in client components (will cause build errors)
- Use API routes to expose database data to client components

### 3. Admin Panel Access

**Middleware protection** (`src/middleware.ts`):
- Development: Always accessible at `/admin`
- Production: Requires `x-admin-key` header with `ADMIN_SECRET` value
- Returns 503 if `ADMIN_SECRET` not configured
- Applies to all routes matching `/admin/*`

**Example authenticated request:**
```bash
curl http://localhost:3000/api/admin/earnings \
  -H "x-admin-key: your_admin_secret_here"
```

### 4. DXM Scoring System

**Always use the scoring function:**
```typescript
import { calculateDXMScore } from '@/lib/dxmScoring';

const scoreResult = calculateDXMScore({
  asin: product.asin,
  currentPrice: product.price,
  perfIndex: product.perfIndex,
  segment: '1440p-high',
  // ... other inputs
});

// Use scoreResult.dxmValueScore for display
// Use scoreResult.breakdown for explanation
```

**Never hardcode scores** - Scores are calculated server-side for consistency

### 5. Revenue Tracking

**Always use context-aware affiliate links:**
```typescript
import { buildAmazonProductUrl } from '@/lib/affiliate';

const url = buildAmazonProductUrl(asin, {
  context: {
    category: 'storage',    // → dxmatrix-storage-20
    source: 'seo',          // → dxmatrix-seo-20 (if no category)
    intent: 'review',       // → dxmatrix-review-20 (highest priority)
    pageType: 'product',
  },
});

// Priority: Intent > Category > Source > Default (dxm369-20)
```

**Track clicks:**
```typescript
// Client-side (automatic with <a> wrapper component)
import { trackClick } from '@/lib/tracking';
await trackClick(asin, 'gpu', trackingId);

// Server-side API
POST /api/dxm/click
{
  "asin": "B0BJQRXJZD",
  "category": "gpu",
  "trackingId": "dxmatrix-gpus-20"
}
```

**Monitor performance:**
- Dashboard: `/admin/earnings`
- Optimization: `/api/admin/earnings/optimization`
- Automated sync: Daily at 2 AM UTC (Vercel cron)
- Manual sync: `POST /api/admin/earnings/sync`

### 6. Image Handling

**Always use DXMProductImage component:**
```typescript
import DXMProductImage from '@/components/DXMProductImage';

<DXMProductImage
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={300}
/>
```

- Supports Amazon images and local fallbacks
- Next.js Image component configured with optimization
- SVG support enabled with CSP sandboxing

### 7. Deployment

**Optimized for Vercel:**
- `output: 'standalone'` in `next.config.mjs`
- Build command: `npm run build`
- Production URL: `https://dxm369.com`
- Cron job configured in `vercel.json` (daily earnings sync at 2 AM UTC)

**Build requirements:**
- Node.js 18+ required
- PostgreSQL database accessible
- All required environment variables in production
- Playwright chromium installed for Shadow Intelligence

### 8. Performance Considerations

- Amazon API responses cached for 15 minutes (LRU cache)
- Static page generation where possible
- Lazy load components below fold
- Optimize images automatically (AVIF/WebP)
- Database connection pooling
- Rate limiting on API endpoints

## Recent Updates

### Shadow Intelligence Layer (2025-12-08) ✅ DEPLOYED
**Status:** Fully operational

**What is Shadow Intelligence?**
A Playwright-based Amazon scraper that **replaces PA-API dependency** with complete metadata extraction:
- ✅ Full product data (price, specs, images, ratings, stock)
- ✅ Discount % auto-calculated
- ✅ Price history tracking (time-series database)
- ✅ Deal detection & anomaly alerts
- ✅ Anti-detection (bypasses bot checks)
- ✅ DXM Score integration

**Components:**
- Scraper Service: `src/services/shadow-scraper/amazonScraper.ts`
- API Endpoint: `/api/shadow/scrape`
- Database Schema: `database/shadow-intelligence-schema.sql`
- UI Integration: `/admin/asin-manager` (Fetch tab)

**Quick Start:**
```bash
npx playwright install chromium
npm run dev
# Open http://localhost:3000/admin/asin-manager
```

**Documentation:**
- `SHADOW_INTELLIGENCE.md` — Full architecture & API reference
- `SHADOW_INTELLIGENCE_QUICKSTART.md` — 3-minute quick start
- `ops/2025-12-08-shadow-intelligence-deployment.md` — Deployment report

### Phase 1: Build & Infrastructure (2025-12-06) ✅ COMPLETE
- ✅ All dependencies installed and verified
- ✅ Build passes successfully (`npm run build`)
- ✅ All TypeScript errors fixed
- ✅ All critical linting errors resolved
- ✅ Client/server component separation fixed
- ✅ Database imports properly isolated to server-side

**See:** `ops/2025-12-06-phase-1-completion-report.md`

### Phase 2: Environment & Secrets Architecture 🚀 READY
**Status:** Ready for implementation

**Objectives:**
- Build comprehensive environment validation layer
- Create `.env.local.example` with all required variables
- Fix all runtime env errors
- Update `lib/env.ts` with complete validation
- Patch all places that use missing envs
- Verify build passes cleanly

**See:** `ops/2025-12-06-cursor-phase-2-plan.md`

### Monetization Optimization System ✅ COMPLETE
**Status:** Fully operational

**Features:**
- ✅ Context-aware tracking ID system (12+ tracking IDs)
- ✅ Automated earnings sync (daily cron job)
- ✅ Revenue optimization engine with actionable recommendations
- ✅ Performance monitoring dashboard
- ✅ EPC/CR analytics and leaderboards
- ✅ Tracking ID heatmap visualization

**Tracking IDs:**
- Category-based: `dxmatrix-storage-20`, `dxmatrix-laptops-20`, `dxmatrix-monitors-20`, etc.
- Source-based: `dxmatrix-seo-20`, `dxmatrix-x-20`, `dxmatrix-youtube-20`, etc.
- Intent-based: `dxmatrix-review-20`, `dxmatrix-top10-20`, `dxmatrix-deal-20`, etc.

**See:** `ops/2025-12-06-monetization-optimization-complete.md`

### 30-Day Passive Revenue Plan ✅ READY
**Status:** Ready to execute

**Resources:**
- 3 SEO pages ready: `/best-ssd-deals`, `/best-laptop-deals`, `/best-gaming-monitors`
- SEO page generator script: `scripts/generate-seo-page.ts`
- Daily checklist: `ops/2025-12-06-30-day-daily-checklist.md`
- Full plan: `ops/2025-12-06-30-day-passive-revenue-plan.md`

**Quick Start:**
```bash
# Generate SEO page
ts-node scripts/generate-seo-page.ts "Best SSD for Gaming 2025" --category storage

# Deploy
npm run build
```

**See:** `ops/2025-12-06-passive-revenue-quick-start.md`

## Documentation References

- `README.md` - General project overview and quick start
- `AMAZON_API_SETUP.md` - Amazon API integration guide
- `LAUNCH_READY.md` - Production deployment checklist
- `DEBUG_GUIDE.md` - Debugging common issues
- `EARNINGS_INTEGRATION.md` - Earnings tracking system guide
- `TRACKING_ID_STRATEGY.md` - Tracking ID architecture
- `SHADOW_INTELLIGENCE.md` - Shadow scraper documentation
- `ops/` - Operational logs and change history
- `database/schema-v2.sql` - Database blueprint
- `.env.local.example` - Complete environment variable reference

## Common Patterns

### Adding a New Product Category

1. Create category-specific scoring in `src/lib/categories/[category].ts`
2. Add Amazon category mapping in `amazonAdapter.ts`
3. Create page in `src/app/[category]/page.tsx`
4. Add mock data in `src/lib/mock[Category].ts`
5. Update sitemap in `src/app/sitemap.ts`
6. Add database spec table in `database/schema-v2.sql`

### Creating API Endpoints

- Use Next.js 14 Route Handlers (not Pages API)
- File location: `src/app/api/[route]/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Return `NextResponse.json()` with proper status codes
- Implement error handling with try/catch
- Add CORS headers if needed for client access
- Use `headers()` from `next/headers` to read request headers

Example:
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Generating SEO Pages

```bash
# Use the generator script
ts-node scripts/generate-seo-page.ts "Best SSD for Gaming 2025" --category storage

# Options:
# --category <category>    storage, laptop, monitor, gpu, cpu
# --slug <slug>           Custom URL slug
# --description <desc>    Meta description
# --keywords <keywords>   Comma-separated keywords
# --intro <intro>         Page introduction
```

### Working with Earnings & Optimization

```typescript
// Get optimization recommendations
const response = await fetch('/api/admin/earnings/optimization', {
  headers: { 'x-admin-key': process.env.ADMIN_SECRET },
});
const report = await response.json();

// Access recommendations
report.data.recommendations.forEach(rec => {
  console.log(`${rec.priority}: ${rec.title} - ${rec.impact}`);
});

// Check EPC leaderboard
const epcResponse = await fetch('/api/admin/earnings?action=epc-leaderboard', {
  headers: { 'x-admin-key': process.env.ADMIN_SECRET },
});
```

### Using Shadow Intelligence Scraper

**API Usage:**
```typescript
const response = await fetch('/api/shadow/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    asin: 'B0BJQRXJZD',
    skipCache: false,  // Optional: force fresh scrape
  }),
});

const result = await response.json();
if (result.success) {
  const product = result.data.product;
  console.log(`${product.title}: $${product.price}`);
}
```

**Direct Service Usage (server-side only):**
```typescript
import { scrapeAmazonProduct } from '@/services/shadow-scraper/amazonScraper';

const product = await scrapeAmazonProduct('B0BJQRXJZD', {
  saveToDb: true,
  skipCache: false,
});
```

## Environment Variables

**Required in Production:**
- `AMAZON_ACCESS_KEY_ID` - PA-API access key
- `AMAZON_SECRET_ACCESS_KEY` - PA-API secret key
- `AMAZON_ASSOCIATE_TAG` - Base tracking tag (dxm369-20)
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_SECRET` - Admin panel authentication
- `NEXT_PUBLIC_SITE_URL` - Production site URL

**Optional but Recommended:**
- `AMAZON_TRACKING_IDS` - Comma-separated tracking IDs for context-aware routing
- `CRON_SECRET` - For Vercel cron job authentication
- `SENDGRID_API_KEY` - For email functionality
- `SENTRY_DSN` - For error tracking
- `JWT_SECRET` - For session management
- `ENCRYPTION_KEY` - For data encryption

**Client-Safe (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_SITE_URL` - Site URL
- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` - Base tracking tag
- `NEXT_PUBLIC_TRACKING_BASE_TAG` - Alternative tracking tag

**See:** `.env.local.example` for complete list (62 variables) and `src/lib/env.ts` for validation schema
- #4 [2025-12-08 18:31:03] ⚡45ms dxm@dxm-83dv ~/D/C/Project_DXM369_Marketplace
> vercel --prod --yes
Vercel CLI 49.1.2
🔍  Inspect: https://vercel.com/dxmatrixs-projects/dxm369-hardware/HbqbvvfDVc9RYZTZWvDRgW2VkrE6 [7s]
✅  Production: https://dxm369-hardware-5yravp61q-dxmatrixs-projects.vercel.app [2m]
#5 [2025-12-08 18:35:20] ⚡116706ms dxm@dxm-83dv ~/D/C/Project_DXM369_Marketplace
>