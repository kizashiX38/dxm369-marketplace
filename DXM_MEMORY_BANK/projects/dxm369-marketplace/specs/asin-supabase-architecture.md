# DXM369 Marketplace — ASIN → Supabase → API → Frontend Architecture
> GPT-Optimized, Claude-Optimized, Cursor-Optimized

**Last Updated:** 2025-12-09

---

## 1. System Overview

```
[ Amazon Data Sources ]
      ↓
[ DXM ASIN Ingestion Layer ]
      ↓
[ Supabase PostgreSQL ]
      ↓
[ Next.js Server Actions & API Routes ]
      ↓
[ Marketplace Frontend (React/Next.js) ]
```

Three ingestion methods feed into Supabase PostgreSQL. Frontend only reads from our DB, never directly from Amazon.

**Guarantees:**
- Caching & performance
- Price-tracking over time
- Stable metadata
- Affiliate compliance

---

## 2. Ingestion Layer (Three Parallel Pipelines)

### (A) Shadow Scraper (Primary Source)

Custom "Shadow Intelligence" scraper using Playwright.

| Property | Value |
|----------|-------|
| URL Pattern | `/dp/{ASIN}` |
| Technology | Playwright headless Chromium |
| Service File | `src/services/shadow-scraper/amazonScraper.ts` |
| API Endpoint | `POST /api/shadow/scrape` |

**Request:**
```json
{ "asin": "B0BJQRXJZD" }
```

**Extracts:**
- Title
- Main image + gallery images
- Price (list, sale, deal price)
- Rating + review count
- Stock status
- Badges
- Specifications table
- Discount %
- Amazon category
- Delivery info

**Then:**
1. Computes internal DXM Score
2. Upserts into `product_catalog`
3. Logs scrape in `shadow_scrape_log`

**Flow:**
```
Request → Playwright → Parse DOM → Normalize → Supabase Upsert → Return Product JSON
```

### (B) PA-API (Amazon Product Advertising API)

Secondary source when scraping fails or for structured category search.

| Property | Value |
|----------|-------|
| Search Endpoint | `GET /api/amazon/search?q=...` |
| Item Endpoint | `GET /api/amazon/items?asin=...` |
| Adapter File | `src/lib/amazonAdapter.ts` |
| Cache | 15-minute LRU |

**Used for:**
- Bulk category discovery
- Real-time price verification
- Recovering failed scrapes

### (C) Bulk Import (Admin Tool)

Admin uploads CSV of ASINs or JSON of product metadata.

| Property | Value |
|----------|-------|
| Endpoint | `POST /api/admin/products/bulkImport` |
| Service File | `src/lib/services/adminProducts.ts` |

**Used for:**
- Ingesting curated ASIN lists
- Accelerating category population
- Seeding large number of items

---

## 3. Supabase PostgreSQL (Central Knowledge Graph)

**Connection:**
```
Host: aws-1-us-east-1.pooler.supabase.com
SSL: Required
Pooler: Enabled
```

**Connection Handler:** `src/lib/db.ts` (server-only)

### Core Tables

| Table | Purpose |
|-------|---------|
| `product_catalog` | Master list of all ASIN products |
| `shadow_scrape_log` | Playwright scrape history per ASIN |
| `price_history` | Records price changes per ASIN over time |
| `offers` | Deals / promotions |
| `click_events` | Affiliate outbound click tracking |
| `earnings` | Amazon Associates revenue import |

### product_catalog Schema

| Column | Type | Description |
|--------|------|-------------|
| `asin` | VARCHAR (PK) | Amazon Standard ID |
| `title` | TEXT | Product title |
| `price` | DECIMAL | Current price |
| `category` | VARCHAR | gpu, cpu, laptop, etc. |
| `images` | JSONB | Array of image URLs |
| `specs` | JSONB | Specifications object |
| `rating` | DECIMAL | Star rating |
| `review_count` | INTEGER | Number of reviews |
| `discount_percent` | INTEGER | Current discount % |
| `last_scraped_at` | TIMESTAMP | Last Shadow scrape |
| `last_verified_at` | TIMESTAMP | Last PA-API verify |
| `dxm_score` | DECIMAL | Calculated DXM Value Score |

**This is the single source of truth.**

---

## 4. Next.js Server Layer (API & Data Fetching)

Frontend never talks to Supabase directly. It calls Next.js server routes or server components.

**Example query:**
```typescript
import { db } from "@/lib/db";

const products = await db.query(
  "SELECT * FROM product_catalog WHERE category = $1 LIMIT 40",
  ["gpu"]
);
```

> **CRITICAL:** Never import `db.ts` inside client components — only server routes.

### Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/shadow/scrape` | POST | Trigger Shadow scraper |
| `/api/amazon/search` | GET | PA-API search |
| `/api/amazon/items` | GET | PA-API item lookup |
| `/api/admin/products/bulkImport` | POST | Bulk ASIN import |
| `/api/admin/products/refresh` | POST | Refresh product data |
| `/api/dxm/products/{category}` | GET | Category product list |

---

## 5. Admin Dashboard (ASIN Manager)

**Location:** `/admin/asin-manager`

**Functions:**
- Add new ASIN → triggers Shadow Scraper
- Validate & inspect product data
- Re-scrape ASIN
- Bulk upload CSV/JSON
- Monitor errors
- Delete / archive products
- View scrape history
- Override data

**Protection:**
- Admin-only middleware
- `ADMIN_SECRET` header required in production

**Flow:**
```
Admin UI → Next.js API → Ingestion Service → Supabase → Logs → UI refresh
```

---

## 6. Frontend Marketplace (Next.js App Router)

Category pages call internal API:
```
/api/dxm/products/gpu
```

**Product card displays:**
- Image
- Pricing
- Rating
- DXM Score
- "View on Amazon" affiliate link

**Affiliate URL template:**
```
https://www.amazon.com/dp/{ASIN}/?tag=dxm369-20
```

---

## 7. Environment Variables

```bash
# Database
DATABASE_URL           # Supabase pooler connection (SSL required)

# Admin
ADMIN_SECRET           # Protects /admin/* routes

# Amazon
AMAZON_ASSOCIATE_TAG   # dxm369-20
AMAZON_ACCESS_KEY_ID   # PA-API access
AMAZON_SECRET_ACCESS_KEY # PA-API secret
AMAZON_REGION          # us-east-1
```

---

## 8. Usage Guide for GPT/Claude

When asking GPT/Claude to:
- Modify ingestion logic
- Optimize scraping
- Extend DB schema
- Fix scraper errors
- Create new categories

**Provide this brief to ensure:**
- They know the full pipeline
- They understand Supabase → API → scraper interplay
- They never break the ingestion chain
- They use `db.ts` correctly (server-only)
- They generate atomic tasks compatible with DXM-C.O.P.

---

## 9. Quick Reference

### Scrape Single ASIN
```bash
curl -X POST http://localhost:3000/api/shadow/scrape \
  -H "Content-Type: application/json" \
  -d '{"asin":"B0BJQRXJZD"}'
```

### Query Products (psql)
```sql
SELECT asin, title, price, dxm_score
FROM product_catalog
WHERE category = 'gpu'
ORDER BY dxm_score DESC
LIMIT 10;
```

### Check Scrape History
```sql
SELECT * FROM shadow_scrape_log
WHERE asin = 'B0BJQRXJZD'
ORDER BY scraped_at DESC;
```

---

## 10. Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Shadow Scraper | `src/services/shadow-scraper/` | Primary data extraction |
| PA-API Adapter | `src/lib/amazonAdapter.ts` | Secondary/backup source |
| DB Connection | `src/lib/db.ts` | Server-only Supabase pool |
| Admin Products | `src/lib/services/adminProducts.ts` | CRUD operations |
| ASIN Manager UI | `/admin/asin-manager` | Admin dashboard |
| Product API | `/api/dxm/products/*` | Frontend data source |

**The entire flow is compatible with DXM Memory Bank + Split Brain System.**
