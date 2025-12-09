# Changelog

## [2025-12-10] 7-Category Marketplace Expansion - 135 ASINs Ingested

### New Categories Deployed
- ✅ **Storage** (SSDs/NVMe/External): 20 products
- ✅ **Memory** (DDR4/DDR5): 20 products
- ✅ **Gaming Mice**: 19 products
- ✅ **Cooling** (AIO/Air): 19 products
- ✅ **Motherboards** (B550/B650/Z790): 19 products
- ✅ **Power Supplies** (80+ Gold/Platinum): 19 products
- ✅ **Monitors** (High refresh/OLED): 19 products

### Infrastructure Changes
- **CATEGORY_CONFIG**: Added 7 new dynamic category definitions with unique accent colors
- **marketplace_products table**: Created for admin-managed product catalog
- **marketplace_sync_logs table**: Created for operation tracking
- **API routes**: Created `/api/dxm/products/marketplace/[category]` generic endpoint
- **page.tsx**: Integrated new categories with dynamic routing & ISR

### Data Ingestion
- **scripts/bulk-ingest-7-categories.ts**: Automated batch ingestion script (140 ASINs)
- **Ingestion Results**: 135/140 successful (96.4% success rate)
- **Database**: All 135 products indexed and visible on category pages

### Pages Now Live
- `/storage` - 20 SSDs with DXM scores
- `/memory` - 20 RAM modules
- `/gaming-mice` - 19 gaming mice
- `/cooling` - 19 cooling solutions
- `/motherboards` - 19 motherboards
- `/psu` - 19 power supplies
- `/monitors` - 19 displays

---

## [2025-12-09] DXM-C.O.P. Memory Bank & ASIN Ingestion

### Memory Bank System
- **DXM_MEMORY_BANK/**: Created external cortex for LLM context optimization
- **profiles/**: Claude/GPT presets, playbook HTML
- **diagrams/**: Split-brain system (Mermaid), Supabase schema (ERD)
- **projects/dxm369-marketplace/**: Project config, specs, logs, snapshots

### ASIN Pipeline
- **asin-manifest-2025-12-09.json**: 102 unique ASINs categorized (22 GPU, 9 CPU, 9 Laptop, 62 unknown)
- **scripts/ingest-asin-dump.ts**: Bulk ingestion script with category detection
- **asin-supabase-architecture.md**: Complete pipeline documentation for GPT/Claude reasoning

### Architecture Docs
- **supabase-schema.mmd**: ERD diagram for all tables (product_catalog, price_history, offers, click_events, earnings)
- **split-brain-system.mmd**: DXM-C.O.P. workflow visualization

---

## [2025-12-09] Domain Hardening & Route Stability

### Infrastructure
- **next.config.mjs**: Added www.dxm369.com → dxm369.com redirect (308 permanent)
- **[category]/page.tsx**: Added `generateStaticParams()` for ISR/SSG route discovery
- **sitemap.ts**: Added all 16 category slugs to sitemap for search engine indexing

### SEO
- **Category metadata**: Added canonical URLs, OpenGraph, and Twitter cards
- **Sitemap priority**: Category pages at 0.9, hourly changefreq

### DevOps
- **scripts/post-deploy-check.sh**: Route verification script for post-deploy validation

---

## [2025-12-09] Bug Audit & Security Patches

### Critical Fixes
- **shadow/scrape route**: Added JSON parse error handling to prevent crashes on malformed payloads
- **earnings/upload route**: Renamed `parseInt` function to `parseIntValue` to avoid shadowing global

### High Severity Fixes
- **cron/route.ts**: Added proper fetch error handling with status code and text extraction
- **newsletter.ts**: Fixed Subscriber interface to use `string` instead of `Date` for SQL timestamp compatibility
- **adminProducts.ts**: Improved error message for null result check
- **clickTracking.ts**: Converted SQL template literals to parameterized queries (SQL injection fix)
- **amazon/search route**: Added NaN validation for minPrice/maxPrice parseInt
- **bulkImport route**: Added CSV row bounds validation with clear error messages

### Medium Severity Fixes
- **unsubscribe route**: Improved security messaging and added logging for email-only attempts
- **health route**: Added error logging for DB connection failures instead of silent swallow
- **middleware.ts**: Restructured auth flow for clarity - early return for non-admin, explicit branches
- **amazonScraper.ts**: Added page timeout (45s) and Promise.race guard for render wait

### Low Severity Fixes
- **NewsletterSignup.tsx**: Added `relative` class to form for proper absolute positioning of error tooltip

### Build Status
- All patches verified with `npm run build`
- No TypeScript errors
- No breaking changes
