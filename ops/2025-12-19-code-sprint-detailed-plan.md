# DXM369 Marketplace - Code Sprint Detailed Plan

**Date:** 2025-12-19
**Status:** Ready for Execution
**Owner:** Kiro (DevOps & Code)
**Orchestrator:** DXM (Project Management)

---

## Executive Summary

**Project State:** 60% complete, architecture sound, critical blockers preventing production deployment

**Sprint Goal:** Fix all P0 blockers to achieve production-ready build with fully functional data pipeline and affiliate system

**Critical Issues:**
- Build compilation errors
- Database connection not verified
- Dead links on 70% of category pages
- Environment variables missing
- Static generation URL parsing failures
- Data pipeline not integrated (mock data in production path)

---

## Detailed Blocker Analysis

### 🚨 **BLOCKER #1: Dead Links on Category Pages**

**Severity:** CRITICAL - User-facing breakage

**Affected Pages:**
- ✅ GPU page - Working
- ✅ CPU page - Working
- ⚠️ Laptop page - Partial (some working)
- ❌ Memory/RAM page - Dead links
- ❌ Storage page - Dead links
- ❌ Monitor page - Dead links
- ❌ Motherboard page - Dead links
- ❌ Cooling page - Dead links
- ❌ Gaming Mice page - Dead links
- ❌ PSU page - Dead links

**Root Cause Analysis Required:**
1. Check if seed data is actually in database
2. Verify API endpoints are returning data vs empty arrays
3. Check if mock data fallback is working
4. Verify ASIN data in `data/asin-seed.json`
5. Check page component error handling

**Investigation Tasks:**
```bash
# 1. Test each API endpoint directly
curl http://localhost:3000/api/dxm/products/gpus
curl http://localhost:3000/api/dxm/products/cpus
curl http://localhost:3000/api/dxm/products/memory
curl http://localhost:3000/api/dxm/products/storage
curl http://localhost:3000/api/dxm/products/monitors
curl http://localhost:3000/api/dxm/products/laptops

# 2. Check database for products
psql $DATABASE_URL -c "SELECT category, COUNT(*) FROM product_catalog GROUP BY category;"

# 3. Check seed data file exists
ls -la data/asin-seed.json

# 4. Check if mock data exists
ls -la src/lib/mock*.ts
```

**Resolution Strategy:**
- If seed data missing: Load seed data into database
- If API endpoints broken: Fix endpoint logic to return data
- If fallback not working: Implement proper mock data fallback
- If data type mismatch: Fix data structure in API responses

---

### 🚨 **BLOCKER #2: Build Errors (TypeScript)**

**Severity:** CRITICAL - Blocks deployment

**Identified Issues:**

#### Issue 2.1: Missing Export - `calculateRealDXMScoreV2`
- Function exists in `src/lib/dealRadar.ts` (line 43)
- Used by: `src/lib/amazonPAAPI.ts`, `src/lib/productDiscovery.ts`
- Status: Export/import mismatch
- **Action:** Verify export statement in `dealRadar.ts`

#### Issue 2.2: Union Type Error - `analytics/page.tsx:161`
- Error: Property 'timestamp' doesn't exist on union type
- Cause: Type guard not narrowing union properly
- **Action:** Add explicit type guard before accessing property

```typescript
// Current (broken):
const timestamp = event.timestamp;

// Fixed:
if ('timestamp' in event) {
  const timestamp = event.timestamp;
}
```

#### Issue 2.3: Script Variable Collisions
- Multiple scripts declare `const ADMIN_KEY`
- TypeScript treats as same compilation unit if included in build
- **Action:** Check `tsconfig.json` excludes scripts/ directory, or rename variables

**Verification Commands:**
```bash
# Run full build with detailed error output
npm run build 2>&1 | grep -A 5 "error TS"

# Check specific file exports
grep -n "export.*calculateRealDXMScoreV2" src/lib/dealRadar.ts

# Verify tsconfig excludes scripts
grep -A 5 '"exclude"' tsconfig.json
```

---

### 🚨 **BLOCKER #3: Database Connection Not Verified**

**Severity:** CRITICAL - Data persistence broken

**Current State:**
- `.env.local` exists
- `DATABASE_URL` may or may not be set
- Migrations not run
- Connection pooling not tested

**Required Actions:**

#### 3.1: Verify Database Configuration
```bash
# Check if DATABASE_URL is set
grep "DATABASE_URL" .env.local

# Test connection string
psql $DATABASE_URL -c "SELECT version();"
```

#### 3.2: Run Database Migrations
```bash
# Execute schema migration
psql $DATABASE_URL < database/schema-v2.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

#### 3.3: Test Connection Pooling
```bash
# Start dev server
npm run dev

# In another terminal, hit health endpoint
curl http://localhost:3000/api/health

# Check response includes database status
# Expected: { status: 'ok', database: 'connected', ... }
```

#### 3.4: Test Basic Operations
```bash
# Query products
curl http://localhost:3000/api/dxm/products/gpus

# Test analytics
curl -X POST http://localhost:3000/api/dxm/pageview \
  -H "Content-Type: application/json" \
  -d '{"path":"/"}'

# Test newsletter
curl -X POST http://localhost:3000/api/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

### 🚨 **BLOCKER #4: Environment Variables Missing**

**Severity:** HIGH - Runtime failures

**Required Variables (Must Have):**
```
AMAZON_ACCESS_KEY_ID=<your_key>
AMAZON_SECRET_ACCESS_KEY=<your_secret>
AMAZON_ASSOCIATE_TAG=dxm369-20
DATABASE_URL=postgresql://user:pass@host:5432/dxm369
ADMIN_SECRET=<random_32_char_string>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20
```

**Optional but Important:**
```
JWT_SECRET=<random_32_char_string>
RATE_LIMIT_SECRET=<random_32_char_string>
APP_SECRET=<random_32_char_string>
CRON_SECRET=<random_32_char_string>
SENDGRID_API_KEY=<optional>
SENTRY_DSN=<optional>
```

**Actions:**
1. Copy template to active config: `cp .env.local.example .env.local`
2. Populate all required variables
3. Create validation script if missing
4. Test validation: `npm run validate-env`
5. Document which are actually used vs optional

---

### 🚨 **BLOCKER #5: Static Generation URL Parsing Errors**

**Severity:** HIGH - Pages won't generate statically

**Affected Routes:**
- `/[category]` - Dynamic routes for all categories
- `/[category]/page.tsx` - Main category page component

**Root Cause:**
Server-side code using relative URLs with `fetch()` or `new Request()` during static generation. Next.js needs absolute URLs.

**Current (Broken):**
```typescript
const response = await fetch('/api/dxm/products/laptops');
```

**Fixed:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const response = await fetch(`${baseUrl}/api/dxm/products/laptops`);
```

**Files Requiring Fixes:**
- `src/app/[category]/page.tsx` - Category listing page
- `src/app/[category]/layout.tsx` - Category layout (if fetching)
- Any other server components using relative fetch URLs

**Testing:**
```bash
# Run static generation locally
npm run build

# Check for URL parsing errors in output
npm run build 2>&1 | grep -i "url"
```

---

### 🚨 **BLOCKER #6: Data Pipeline Not Integrated**

**Severity:** CRITICAL - No real product data in production

**Current State:**
- Mock data in production path: `src/lib/dealRadar.ts` (lines 149-379)
- Amazon PA-API implemented but not used
- Database schema exists but unused
- No automated data refresh

**Target Architecture:**
```
Amazon PA-API → Database → Normalization → UI
     ↓
Price History Tracking
DXM Score Calculation
Real-time Updates
```

**Required Work:**

#### 6.1: Remove Mock Data from Production Path
- Identify all mock data in `dealRadar.ts`
- Create separate mock data file for development only
- Update imports to use new location
- Ensure development mode can still use mocks

#### 6.2: Implement Product Service Layer
Create `src/lib/services/productService.ts`:
```typescript
export async function saveOrUpdateProduct(product: DXMProduct) {
  // Insert or update in database
  // Handle duplicate ASINs
  // Update price history
}

export async function saveOrUpdateOffer(offer: Offer) {
  // Track price changes
  // Trigger deal detection
}

export async function getProductsByCategory(category: string) {
  // Query database
  // Apply DXM scoring
  // Return sorted results
}
```

#### 6.3: Connect Amazon PA-API to Database
- Test Amazon API credentials
- Fetch products from Amazon
- Normalize data to DXMProduct schema
- Save to database via `saveOrUpdateProduct()`

#### 6.4: Implement Product Seeding Script
Create `scripts/seedProducts.ts`:
```typescript
// 1. Fetch from Amazon PA-API
// 2. Normalize to schema
// 3. Save to database
// 4. Generate initial DXM scores
// 5. Log results
```

#### 6.5: Database Population Strategy
- Seed with 20-30 real products per category
- Ensure all major categories have products
- Verify affiliate links work with real ASINs
- Set up automated refresh pipeline

---

## Execution Plan - Ordered Blocks

### **BLOCK A: Emergency Triage (Foundation)**

**Purpose:** Establish stable baseline

**Tasks:**
1. Verify current build status
   - Run `npm run build`
   - Collect all error messages
   - Categorize by type

2. Check database connectivity
   - Verify `DATABASE_URL` is set
   - Test connection: `psql $DATABASE_URL -c "SELECT 1"`
   - Document database state

3. List missing environment variables
   - Compare `.env.local` to `.env.local.example`
   - Identify critical vs optional
   - Create requirements checklist

4. Audit dead links issue
   - Test each category API endpoint
   - Check database product counts
   - Query for empty results
   - Check mock data availability

**Success Criteria:**
- [ ] Know exact build errors
- [ ] Database connectivity verified or identified as blocker
- [ ] Missing env vars documented
- [ ] Root cause of dead links identified

---

### **BLOCK B: Build Stabilization (TypeScript & Compilation)**

**Purpose:** Get `npm run build` passing

**Tasks:**
1. Fix `calculateRealDXMScoreV2` export issue
   - Verify function exists in `dealRadar.ts`
   - Check export statement format
   - Verify import statements in consuming files
   - Test build after fix

2. Fix union type error in `analytics/page.tsx:161`
   - Add type guard for 'timestamp' property
   - Use discriminated union pattern
   - Test type checking: `npm run build`

3. Resolve script variable collisions
   - Check `tsconfig.json` excludes scripts/
   - Or rename conflicting variables
   - Verify no compilation unit conflicts

4. Run full type check
   - Execute `npm run build` with verbose output
   - Fix any remaining TypeScript errors
   - Verify no ESLint blocks

**Success Criteria:**
- [ ] `npm run build` completes without TypeScript errors
- [ ] Build output shows zero critical errors
- [ ] All three type issues resolved
- [ ] Build time reasonable (<60 seconds)

---

### **BLOCK C: Environment Configuration (Setup)**

**Purpose:** Configure all required variables

**Tasks:**
1. Populate `.env.local` with required variables
   - Copy from `.env.local.example`
   - Set: Amazon API keys, Database URL, Secrets
   - Generate random strings for: `ADMIN_SECRET`, `JWT_SECRET`, `RATE_LIMIT_SECRET`
   - Set: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

2. Create environment validation (if missing)
   - Ensure `src/lib/env.ts` validates all vars
   - Create validation script: `npm run validate-env`
   - Add build-time check to catch missing vars early
   - Update `.env.local.example` documentation

3. Test environment validation
   - Run validation script
   - Fix any reported issues
   - Verify in production mode: `NODE_ENV=production npm run build`

4. Document environment setup
   - List required variables
   - List optional variables
   - Include where each is used
   - Create setup checklist

**Success Criteria:**
- [ ] All required vars in `.env.local`
- [ ] Validation script runs successfully
- [ ] Production mode build accepts configuration
- [ ] Documentation complete

---

### **BLOCK D: Database Setup (Persistence Foundation)**

**Purpose:** Establish working database with schema and data

**Tasks:**
1. Verify `DATABASE_URL` configuration
   - Check `.env.local` has valid connection string
   - Test connection: `psql $DATABASE_URL -c "SELECT version();"`
   - Confirm database exists

2. Run database migrations
   - Execute: `psql $DATABASE_URL < database/schema-v2.sql`
   - Verify tables created: `psql $DATABASE_URL -c "\dt"`
   - Check schema matches expected structure

3. Verify connection pooling
   - Start dev server: `npm run dev`
   - Monitor connection pool in logs
   - Test concurrent requests

4. Test basic database operations
   - Test write: Insert product into `product_catalog`
   - Test read: Query products by category
   - Test update: Modify price of product
   - Test analytics: Insert click/pageview event
   - Test newsletter: Insert email subscription

5. Load initial seed data
   - If `data/asin-seed.json` exists, load it
   - Verify seed products appear in queries
   - Check all categories have at least 3 products

**Success Criteria:**
- [ ] Database connection works
- [ ] Schema migrations complete
- [ ] Tables visible in `psql`
- [ ] CRUD operations successful
- [ ] Seed data loaded (or identified as missing)

---

### **BLOCK E: Static Generation Fix (URL Parsing)**

**Purpose:** Fix relative URL errors during build

**Tasks:**
1. Identify all relative fetch() calls in server components
   - Search: `grep -r "fetch('/" src/app/`
   - Search: `grep -r 'fetch("/' src/app/`
   - Document each occurrence with file and line number

2. Fix `src/app/[category]/page.tsx`
   - Convert relative URLs to absolute
   - Use `process.env.NEXT_PUBLIC_SITE_URL`
   - Fallback to `http://localhost:3000` for local dev
   - Test with each category

3. Fix other server components with relative URLs
   - Apply same pattern throughout
   - Test static generation after each fix
   - Verify no URL parsing errors

4. Run static generation test
   - Execute: `npm run build`
   - Check output for URL errors
   - Verify 116 routes generated successfully
   - Test all category pages load

**Success Criteria:**
- [ ] No relative URL fetch() calls in server components
- [ ] `npm run build` completes without URL errors
- [ ] All 116 routes generate successfully
- [ ] Category pages load with data

---

### **BLOCK F: Dead Links Root Cause Fix (Data Pipeline)**

**Purpose:** Ensure all category pages have working affiliate links

**Tasks:**
1. Determine root cause
   - API endpoints returning empty? Check `/api/dxm/products/*` responses
   - Database empty? Check `product_catalog` row counts
   - Mock data missing? Check `src/lib/mock*.ts` files
   - Fallback broken? Check error handling in pages

2. If data source missing: Implement seeding
   - Create `scripts/seedProducts.ts`
   - Fetch from Amazon PA-API OR use provided seed ASINs
   - Normalize to `DXMProduct` schema
   - Insert into database with proper categories
   - Generate initial DXM scores

3. If API endpoints broken: Fix routes
   - Verify `/api/dxm/products/[category]` route exists
   - Check database query logic
   - Ensure fallback to mock data works
   - Test endpoint returns valid product array

4. If mock data missing: Recreate
   - Check `src/lib/mockGPU.ts`, `mockCPU.ts`, etc.
   - Verify each category has mock products
   - Ensure mock data format matches schema
   - Use for development fallback

5. Test all category pages
   - Load each page: `/gpus`, `/cpus`, `/laptops`, `/storage`, etc.
   - Verify products display
   - Click affiliate links
   - Confirm `dxm369-20` tag present in URL

**Success Criteria:**
- [ ] All category pages load without dead links
- [ ] Each page shows 3+ products (real or mock)
- [ ] Affiliate links functional and tagged
- [ ] API endpoints return valid data

---

### **BLOCK G: Data Pipeline Integration (Real Data Flow)**

**Purpose:** Connect Amazon → Database → UI with real products

**Tasks:**
1. Test Amazon PA-API credentials
   - Verify `AMAZON_ACCESS_KEY_ID` and `AMAZON_SECRET_ACCESS_KEY` are valid
   - Test API call with simple query
   - Verify response format

2. Create product service layer
   - Implement `saveOrUpdateProduct()` in `src/lib/services/productService.ts`
   - Handle ASIN deduplication
   - Update price history
   - Return product with DXM score

3. Implement offer tracking service
   - Create `saveOrUpdateOffer()` function
   - Track price changes over time
   - Trigger deal detection
   - Log price history

4. Implement product seeding
   - Create `scripts/seedProducts.ts`
   - Fetch products from Amazon API
   - Normalize to schema
   - Calculate DXM scores
   - Save to database
   - Generate report

5. Connect pipeline end-to-end
   - Remove mock data from production path
   - Update API routes to query database first
   - Add fallback to mock for missing categories
   - Test: Amazon API → Database → UI

6. Verify data flow
   - Query each category: Should return database products
   - Check DXM scores: Should be calculated
   - Monitor database growth: Should add new products
   - Verify price tracking: Should log changes

**Success Criteria:**
- [ ] `saveOrUpdateProduct()` working
- [ ] `saveOrUpdateOffer()` working
- [ ] Seed script successfully populates database
- [ ] All categories have real products
- [ ] API routes return database data
- [ ] DXM scores calculated and displayed
- [ ] Price history tracked

---

### **BLOCK H: Testing & Validation (Full Stack)**

**Purpose:** Verify entire system works end-to-end

**Tasks:**
1. Unit test critical functions
   - Test `calculateDXMScore()` with various inputs
   - Test `buildAmazonProductUrl()` affiliate tag injection
   - Test environment validation
   - Test database queries

2. Integration tests
   - Test API → Database flow
   - Test product seeding pipeline
   - Test affiliate link generation
   - Test analytics tracking

3. End-to-end testing
   - Visit each category page
   - Verify products load
   - Click affiliate links
   - Confirm Amazon URLs have correct tag
   - Check browser console for errors
   - Verify no 404s or dead links

4. Performance testing
   - Measure build time
   - Check bundle sizes
   - Test static generation speed
   - Verify database query performance

5. Production simulation
   - Set `NODE_ENV=production`
   - Run `npm run build`
   - Test production build locally
   - Verify no runtime errors
   - Check memory usage

**Success Criteria:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E testing shows working system
- [ ] No console errors on pages
- [ ] Affiliate links functional
- [ ] Performance acceptable
- [ ] Production build works

---

### **BLOCK I: Documentation & Knowledge Transfer**

**Purpose:** Document system for future maintenance

**Tasks:**
1. Document data pipeline
   - Create diagram: Amazon API → Database → UI
   - Document schema
   - Document API endpoints
   - Document service layer

2. Document affiliate system
   - How tracking IDs work
   - How links are generated
   - Where to find code
   - How to test

3. Document environment variables
   - What each one does
   - Which are required
   - How to generate secrets
   - Production setup checklist

4. Document database setup
   - How to run migrations
   - How to seed data
   - How to backup/restore
   - Common queries

5. Create runbook for common issues
   - Build failing
   - Database not connecting
   - Dead links appearing
   - API returning errors

**Success Criteria:**
- [ ] Data pipeline documented
- [ ] Affiliate system documented
- [ ] Environment variables documented
- [ ] Database procedures documented
- [ ] Troubleshooting guide created

---

## Dependencies & Sequencing

**Critical Path (Must Complete in Order):**

```
BLOCK A (Triage)
    ↓
BLOCK B (Build Fix) ← BLOCK A output
    ↓
BLOCK C (Env Setup) ← BLOCK B must pass
    ↓
BLOCK D (Database) ← BLOCK C must have DATABASE_URL
    ↓
BLOCK E (URL Fix) ← BLOCK B must pass first
    ↓
BLOCK F (Dead Links) ← BLOCK D + BLOCK E must work
    ↓
BLOCK G (Data Pipeline) ← BLOCK D + BLOCK F working
    ↓
BLOCK H (Testing) ← All above blocks complete
    ↓
BLOCK I (Documentation) ← System validated
```

**Parallel Opportunities:**
- BLOCK C and BLOCK E can run in parallel (no dependency)
- BLOCK I can start once BLOCK G is stable (doesn't block anything)

---

## Technical Specifications

### Amazon PA-API Integration

**Credentials Required:**
```
AMAZON_ACCESS_KEY_ID=<from Amazon Partners Central>
AMAZON_SECRET_ACCESS_KEY=<from Amazon Partners Central>
AMAZON_ASSOCIATE_TAG=dxm369-20
AMAZON_REGION=us-east-1
AMAZON_HOST=webservices.amazon.com
```

**API Details:**
- Endpoint: `https://webservices.amazon.com/`
- Service: Product Advertising API v5
- Operation: SearchItems, GetItems
- Rate Limit: 1 request per second

**Implementation Files:**
- `src/lib/amazonPAAPI.ts` - API client
- `src/lib/amazonAdapter.ts` - Adapter/normalizer
- `src/lib/awsSigning.ts` - AWS Signature v4
- `src/lib/affiliate.ts` - URL builder

### DXM Score Calculation

**Algorithm Location:** `src/lib/dxmScoring.ts`

**Components:**
- Performance Value (40%)
- Deal Quality (15%)
- Trust Signal (20%)
- Efficiency (10%)
- Trend Signal (15%)

**Usage:**
```typescript
const score = calculateDXMScore({
  asin: product.asin,
  currentPrice: product.price,
  perfIndex: product.perfIndex,
  segment: 'gpu-1440p-high',
  priceHistory: product.prices,
});
// Returns: { dxmValueScore: 8.5, breakdown: {...} }
```

### Database Schema

**Key Tables:**
- `product_catalog` - Main products
- `product_offers` - Price history
- `analytics_events` - Clicks/pageviews
- `newsletter_subscribers` - Email list
- Category-specific: `gpu_specs`, `cpu_specs`, `laptop_specs`

**Connection:**
```typescript
import { db } from '@/lib/db';

const products = await db.query(
  'SELECT * FROM product_catalog WHERE category = $1',
  [category]
);
```

### Affiliate Link Generation

**Pattern:**
```typescript
const url = buildAmazonProductUrl(asin, {
  context: {
    category: 'gpu',
    source: 'seo',
    intent: 'review',
  },
});
// Output: https://amazon.com/dp/B0BJQRXJZD?tag=dxmatrix-review-20
```

**Tracking IDs (Priority Order):**
1. Intent-based: `dxmatrix-review-20` (highest)
2. Category-based: `dxmatrix-gpu-20`
3. Source-based: `dxmatrix-seo-20`
4. Default: `dxm369-20`

---

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Amazon API credentials invalid | Cannot fetch products | Test credentials early in BLOCK A |
| Database not accessible | No data persistence | Verify DATABASE_URL in BLOCK A |
| Missing seed data | All pages show dead links | Have fallback mock data ready |
| Build takes too long | Development friction | Cache dependencies, use esbuild |
| Static generation fails | Pages won't deploy | Test with `npm run build` frequently |
| Environment vars incomplete | Runtime errors in production | Validation script catches early |
| Type errors in new code | Build breaks | Run `npm run build` before commits |
| Database migrations fail | Schema mismatch | Test migrations in dev environment first |

---

## Success Metrics

### Build Health
- [ ] `npm run build` passes
- [ ] Zero TypeScript errors
- [ ] Zero critical ESLint warnings
- [ ] Build time < 60 seconds

### Data Flow
- [ ] Database has 100+ products
- [ ] All 6 category pages show products
- [ ] API endpoints return valid data
- [ ] Price history tracking working

### Affiliate System
- [ ] Links have `dxm369-20` tag
- [ ] Links open in new window
- [ ] Links include context parameters
- [ ] All category pages use links

### Production Readiness
- [ ] Staging deployment succeeds
- [ ] No console errors in production
- [ ] Database queries performant
- [ ] Error handling comprehensive
- [ ] Monitoring in place

---

## Post-Execution Items (P1 & P2)

### P1 - High Priority
1. Error handling standardization across API routes
2. UX improvements (sorting, filtering, pagination)
3. Loading skeletons and empty states
4. Cookie consent banner
5. Newsletter double opt-in

### P2 - Polish & Performance
1. Image optimization (AVIF/WebP)
2. DXM score caching
3. Price change notifications
4. Background job queue for data refresh
5. Advanced analytics dashboard

---

## Sign-Off & Handoff

**Orchestrator:** DXM (Project Management)
**Developer:** Kiro (DevOps & Code)
**Status:** Ready for Execution
**Next Step:** Execute BLOCK A (Triage) to establish baseline

**Questions Before Kickoff:**
1. Do you have valid Amazon API credentials?
2. What's the PostgreSQL database setup (local/Supabase/RDS)?
3. Is there a staging environment for testing?
4. Any deployment target preference (Vercel/Docker/Manual)?
5. Do you need CI/CD setup during this sprint?

---

**Document Status:** ✅ Complete
**Plan Status:** 📋 Ready for Developer
**Approval Required:** By Kiro before execution
