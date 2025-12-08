# DXM369 Marketplace - Prioritization Matrix v1
**Date:** December 6, 2025  
**CTO Battle Plan - 3-Day Launch Mode**  
**Status:** 🎯 ACTIVE

---

## Executive Summary

This matrix carves the jungle of missing/partial items into a clear battle plan. Items are prioritized by launch-blocking severity:

- **🟥 P0** = Must fix before ANY launch (Launch Blockers)
- **🟧 P1** = Required for polished, trusted product (Strong Priority)
- **🟩 P2** = Nice-to-have enhancements & optimizations (Post-Launch)

**Current Launch Readiness:** 3.2/5.0  
**Estimated Time to P0 Complete:** 20-30 hours  
**Estimated Time to P1 Complete:** +15-20 hours

---

## 🟥 P0 — CRITICAL PATH (Launch Blockers)

**If these are not fixed, the marketplace is not real, not stable, and not safe for users.**

### 🔥 REAL DATA + DB PIPELINE (NO MOCKS)

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Remove ALL mock data from production path** | ❌ Not Started | `src/lib/dealRadar.ts` (lines 149-379) | 4-6h | 🚨 Critical |
| **Connect Amazon PAAPI → DB → UI** | ❌ Not Started | `src/lib/amazonAdapter.ts`, `src/lib/db.ts` | 6-8h | 🚨 Critical |
| **Build real ASIN ingestion for GPUs/CPUs/Laptops** | ❌ Not Started | New service layer | 4-6h | 🚨 Critical |
| **Database MUST be active (no fallback mode)** | ❌ Not Started | `src/lib/db.ts`, env config | 2-4h | 🚨 Critical |
| **Add real-time data transformation and normalization** | ❌ Not Started | `src/lib/services/productService.ts` | 3-4h | 🚨 Critical |
| **Seed DB with first batch of real products** | ❌ Not Started | `scripts/seed-products.ts` | 2-3h | 🚨 Critical |

**Current State:**
- Mock data hardcoded in `dealRadar.ts` (lines 149-379)
- Amazon PA-API implemented but not integrated into main data flow
- Database schema exists but not connected
- No data seeding scripts

**Target State:**
```
Amazon PA-API → Database → Normalization → UI
     ↓
Price History Tracking
DXM Score Calculation
```

**Acceptance Criteria:**
- [ ] Zero mock data in production code path
- [ ] All product data comes from Amazon API or database
- [ ] Database connection verified and active
- [ ] At least 50 real products seeded (GPUs, CPUs, Laptops)
- [ ] Price history tracking working
- [ ] DXM scores calculated on real data

---

### 🔥 ENVIRONMENT & CONFIG

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Create full `.env.local.example`** | ❌ Not Started | `.env.local.example` | 30min | 🚨 Critical |
| **Document all required environment variables** | ❌ Not Started | `.env.local.example`, `README.md` | 1h | 🚨 Critical |
| **Require Amazon API keys, no silent fallback** | ⚠️ Partial | `src/lib/env.ts` | 1-2h | 🚨 Critical |
| **Require DATABASE_URL, no silent fallback** | ⚠️ Partial | `src/lib/db.ts` | 1h | 🚨 Critical |

**Current State:**
- `.env.local.example` file missing (referenced but not found)
- Env validation exists but allows silent fallbacks
- No documentation of required vs optional vars

**Target State:**
- Complete `.env.local.example` with all variables
- Production mode fails fast if required vars missing
- Clear documentation of what's required vs optional

**Acceptance Criteria:**
- [ ] `.env.local.example` exists with all variables
- [ ] Each variable has description and example
- [ ] Required vars marked clearly
- [ ] Production mode fails if `AMAZON_ACCESS_KEY_ID` missing
- [ ] Production mode fails if `DATABASE_URL` missing
- [ ] README updated with setup instructions

---

### 🔥 ERROR HANDLING & API STABILITY

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Create global API wrapper (`apiSafe`)** | ❌ Not Started | `src/lib/apiSafe.ts` | 2-3h | 🚨 Critical |
| **Fix ALL API routes with consistent error shape** | ⚠️ Partial | `src/app/api/**/*.ts` | 3-4h | 🚨 Critical |
| **Remove all hidden try/catch fallback data** | ❌ Not Started | Multiple API routes | 2-3h | 🚨 Critical |
| **Secure IP hashing (SHA-256 instead of Base64)** | ❌ Not Started | `src/app/api/dxm/click/route.ts` (line 21) | 1h | 🚨 Critical |

**Current State:**
- Inconsistent error handling across API routes
- Some routes have hidden fallbacks to mock data
- IP hashing uses Base64 (reversible, privacy risk)

**Target State:**
```typescript
// Consistent error shape
{
  success: boolean,
  data?: T,
  error?: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

**Acceptance Criteria:**
- [ ] `apiSafe` wrapper created and used in all routes
- [ ] All API routes return consistent error shape
- [ ] No silent fallbacks to mock data in production
- [ ] IP hashing uses SHA-256 with salt
- [ ] Error messages user-friendly (no stack traces)

---

### 🔥 DATABASE & PERSISTENCE BASICS

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Connect schema-v2 to code** | ❌ Not Started | `src/lib/db.ts`, migrations | 2-3h | 🚨 Critical |
| **Implement `saveOrUpdateProduct()`** | ❌ Not Started | `src/lib/services/productService.ts` | 2-3h | 🚨 Critical |
| **Implement `saveOrUpdateOffer()`** | ❌ Not Started | `src/lib/services/productService.ts` | 2-3h | 🚨 Critical |
| **Enable price history table updates** | ❌ Not Started | `src/lib/services/productService.ts` | 2-3h | 🚨 Critical |
| **Ensure DXM score runs on REAL data** | ❌ Not Started | `src/lib/dxmScoring.ts` | 1-2h | 🚨 Critical |

**Current State:**
- Schema exists (`database/schema-v2.sql`) but not connected
- No product/offer persistence functions
- Price history table exists but not used
- DXM scores calculated on mock data

**Target State:**
- All product data persisted to database
- Price changes tracked in `price_history`
- DXM scores calculated from real database data

**Acceptance Criteria:**
- [ ] Database migrations run successfully
- [ ] `saveOrUpdateProduct()` saves to `products` + category spec tables
- [ ] `saveOrUpdateOffer()` saves to `offers` table
- [ ] Price changes automatically logged to `price_history`
- [ ] DXM scores calculated from database data
- [ ] All CRUD operations tested

---

### 🔥 ANALYTICS & TRACKING (Minimum Viable)

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Click tracking must write to DB** | ⚠️ Partial | `src/app/api/dxm/click/route.ts` | 1-2h | 🚨 Critical |
| **Newsletter subscription must write to DB** | ✅ Working | `src/app/api/email/subscribe/route.ts` | ✅ Done | ✅ Complete |

**Current State:**
- Click tracking implemented but requires DB connection
- Newsletter subscription works with DB

**Target State:**
- All clicks persisted to `click_events` table
- Newsletter subscriptions persisted to `newsletter_subscribers`

**Acceptance Criteria:**
- [ ] Click events saved to database
- [ ] Newsletter subscriptions saved to database
- [ ] Both work without DB fallback mode

---

## 🟧 P1 — STRONG PRIORITY (Improves UX, Trust, and Conversion)

**These don't block launch, but without them the product feels immature.**

### ⭐ Marketplace UX

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Sorting options** | ❌ Not Started | `src/app/gpus/page.tsx`, etc. | 2-3h | ⭐ High |
| **Filtering options** | ❌ Not Started | `src/components/AdvancedFilters.tsx` | 3-4h | ⭐ High |
| **Loading skeletons** | ❌ Not Started | All page components | 2-3h | ⭐ High |
| **Empty states** | ❌ Not Started | All listing pages | 2-3h | ⭐ High |
| **Error UI (non-technical messages)** | ⚠️ Partial | Error boundaries | 2-3h | ⭐ High |
| **Retry logic for Amazon API failures** | ❌ Not Started | `src/lib/amazonAdapter.ts` | 2-3h | ⭐ High |

**Current State:**
- Sorting/filtering UI exists but handlers not implemented
- No loading spinners or skeletons
- Error messages are technical (stack traces)
- No "no results" states

**Acceptance Criteria:**
- [ ] Users can sort by price, score, date
- [ ] Users can filter by brand, price range, specs
- [ ] Loading skeletons shown during data fetch
- [ ] Empty states with helpful messages
- [ ] User-friendly error messages
- [ ] Automatic retry on API failures (3 attempts)

---

### ⭐ Scoring & Performance

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Cache DXM scores in DB** | ❌ Not Started | `src/lib/dxmScoring.ts`, `dxm_scores` table | 3-4h | ⭐ High |
| **Recompute scores only when price changes** | ❌ Not Started | Background job | 2-3h | ⭐ High |
| **Add update command (`dxm:refresh`)** | ❌ Not Started | `scripts/refresh-scores.ts` | 1-2h | ⭐ High |
| **Improve performance of repeated scoring calls** | ❌ Not Started | Caching layer | 2-3h | ⭐ High |

**Current State:**
- Scores calculated on every request (performance issue)
- No caching of scores
- No historical score tracking

**Acceptance Criteria:**
- [ ] Scores stored in `dxm_scores` table
- [ ] Scores only recalculated when price changes
- [ ] `npm run dxm:refresh` command available
- [ ] Score calculation < 100ms for cached scores

---

### ⭐ Compliance & User Trust

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Cookie consent banner** | ❌ Not Started | New component | 2-3h | ⭐ High |
| **Newsletter double opt-in** | ❌ Not Started | `src/app/api/email/subscribe/route.ts` | 3-4h | ⭐ High |
| **Proper privacy wording** | ✅ Complete | `src/app/legal/privacy/page.tsx` | ✅ Done | ✅ Complete |
| **Explicit affiliate disclosure in footer/product cards** | ✅ Complete | Footer, cards | ✅ Done | ✅ Complete |

**Current State:**
- Cookie policy exists but no consent banner
- Newsletter has basic opt-in only
- Privacy policy and affiliate disclosure present

**Acceptance Criteria:**
- [ ] Cookie consent banner appears on first visit
- [ ] Consent stored in localStorage/cookies
- [ ] Newsletter sends confirmation email
- [ ] Subscription only active after email confirmation
- [ ] All compliance requirements met (GDPR, CAN-SPAM)

---

### ⭐ Data & Integrations

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Automated data refresh job (manual for now)** | ❌ Not Started | `scripts/refresh-products.ts` | 2-3h | ⭐ High |
| **Category-specific product selection improvements** | ⚠️ Partial | Category logic | 2-3h | ⭐ High |
| **Intelligent "unavailable product" handling** | ❌ Not Started | Product service | 1-2h | ⭐ High |

**Acceptance Criteria:**
- [ ] Manual refresh script updates all products
- [ ] Category-specific ASIN lists curated
- [ ] Unavailable products handled gracefully
- [ ] Products marked as unavailable after X days

---

### ⭐ Minimal Monitoring

| Task | Status | Files | Effort | Impact |
|------|--------|-------|--------|--------|
| **Implement Sentry stub** | ❌ Not Started | Error tracking | 2-3h | ⭐ High |
| **Implement structured logger (`log.info`, `log.error`)** | ❌ Not Started | `src/lib/logger.ts` | 2-3h | ⭐ High |
| **Add `/admin/diagnostics`** | ❌ Not Started | Admin page | 2-3h | ⭐ High |

**Acceptance Criteria:**
- [ ] Sentry integration ready (can enable with env var)
- [ ] Structured logging with levels (info, warn, error)
- [ ] Diagnostics page shows system health
- [ ] Database connection status visible
- [ ] API health checks visible

---

## 🟩 P2 — ENHANCEMENTS (Optional, Post-Launch)

**These are luxury features. They elevate the platform but aren't mandatory for launching a working marketplace.**

### 🎨 UI/UX Enhancements

- More transitions and animations
- Improved hover effects & micro-interactions
- Better card design variants
- Enhanced mobile experience

**Effort:** 8-12 hours  
**Impact:** Better user engagement

---

### 📈 Advanced Analytics

- Conversion tracking pipeline
- Session analytics
- Heatmaps (self-hosted)
- User behavior tracking

**Effort:** 12-16 hours  
**Impact:** Better business insights

---

### ⚙️ Infrastructure Hardening

- Automated DB migrations
- Automated backup strategy
- Materialized views for analytics
- Index tuning
- Redis caching

**Effort:** 16-24 hours  
**Impact:** Better performance and reliability

---

### 🛡️ Legal & Compliance (Advanced)

- Data export (GDPR)
- Data deletion (GDPR)
- Full compliance on cookie categories
- Advanced privacy controls

**Effort:** 8-12 hours  
**Impact:** Full compliance coverage

---

### 🧪 Testing & Reliability

- Unit tests (Jest/Vitest)
- API integration tests
- E2E test suite (Playwright)
- Performance/load testing

**Effort:** 20-30 hours  
**Impact:** Confidence in changes, fewer bugs

---

### 🔍 SEO & Discovery

- Dynamic metadata generation
- OpenGraph tags
- Twitter cards
- Image CDN integration
- Sitemap + robots.txt optimization

**Effort:** 8-12 hours  
**Impact:** Better search rankings

---

## 📊 Priority Summary

| Bucket | Impact | Category | Description | Total Effort |
|--------|--------|----------|-------------|--------------|
| **P0** | 🚨 Critical | Core System | If not fixed → no launch, no real data | **20-30h** |
| **P1** | ⭐ High | UX + Trust + Stability | Makes product feel legitimate | **15-20h** |
| **P2** | 🟩 Medium/Low | Enhancements | Post-launch refinement | **60-80h** |

---

## 🎯 Execution Strategy

### Phase 1: P0 Critical Path (Days 1-2)
1. **Day 1 Morning:** Environment & Config (4h)
   - Create `.env.local.example`
   - Document all variables
   - Enforce required vars in production

2. **Day 1 Afternoon:** Database Connection (4h)
   - Connect schema-v2
   - Implement `saveOrUpdateProduct()`
   - Implement `saveOrUpdateOffer()`

3. **Day 2 Morning:** Real Data Pipeline (6h)
   - Remove mock data
   - Connect Amazon PAAPI → DB
   - Build ASIN ingestion

4. **Day 2 Afternoon:** Error Handling & Analytics (6h)
   - Create `apiSafe` wrapper
   - Fix all API routes
   - Secure IP hashing
   - Enable click tracking DB writes

### Phase 2: P1 Polish (Day 3)
1. **Day 3 Morning:** UX Improvements (4h)
   - Sorting/filtering
   - Loading skeletons
   - Empty states

2. **Day 3 Afternoon:** Compliance & Monitoring (4h)
   - Cookie consent banner
   - Newsletter double opt-in
   - Sentry stub
   - Structured logging

### Phase 3: P2 Enhancements (Post-Launch)
- Iterate based on user feedback
- Prioritize based on metrics
- Build in sprints

---

## ✅ Progress Tracking

### P0 Status: 0/20 tasks complete
- [ ] Real Data + DB Pipeline (0/6)
- [ ] Environment & Config (0/4)
- [ ] Error Handling & API Stability (0/4)
- [ ] Database & Persistence Basics (0/5)
- [ ] Analytics & Tracking (1/2)

### P1 Status: 0/19 tasks complete
- [ ] Marketplace UX (0/6)
- [ ] Scoring & Performance (0/4)
- [ ] Compliance & User Trust (2/4)
- [ ] Data & Integrations (0/3)
- [ ] Minimal Monitoring (0/3)

### P2 Status: 0/5 categories complete
- [ ] UI/UX Enhancements
- [ ] Advanced Analytics
- [ ] Infrastructure Hardening
- [ ] Legal & Compliance (Advanced)
- [ ] Testing & Reliability
- [ ] SEO & Discovery

---

## 📝 Notes

- **Backup Strategy:** All edits backed up to `.cursor_backups/` before changes
- **Testing:** Run `npm run build` before committing
- **Documentation:** Create ops docs in `ops/` for major changes
- **Tracking IDs:** Always use context-aware tracking via `buildAmazonProductUrl()`

---

**Last Updated:** December 6, 2025  
**Next Review:** After P0 completion  
**Owner:** DXM369 CTO

