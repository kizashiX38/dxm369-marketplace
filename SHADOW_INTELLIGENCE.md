# 🕵️ DXMatrix Shadow Intelligence Layer

**Status:** ✅ Operational
**Last Updated:** 2025-12-08

The Shadow Intelligence Layer is DXM369's **fully autonomous Amazon data collection system**. It replaces dependency on Amazon's Product Advertising API (PA-API) with a **Playwright-based scraper** that extracts complete product metadata, price history, and deal signals.

---

## 🎯 Why Shadow Intelligence?

### PA-API Limitations:
- ❌ Limited metadata (no discount %, hidden specs, stock levels)
- ❌ Rate limits (1 request/second, 8640 requests/day)
- ❌ Approval required
- ❌ No price history
- ❌ No real-time stock tracking

### Shadow Scraper Advantages:
- ✅ **Full metadata** (JSON-LD + DOM extraction)
- ✅ **Discount %** calculated automatically
- ✅ **Price history** tracked in time-series database
- ✅ **Stock-level heuristics** ("Only 3 left in stock")
- ✅ **Rating histogram** + review count
- ✅ **Product badges** + buybox seller
- ✅ **Image gallery** (all resolutions)
- ✅ **Hidden tech specs** from attributes table
- ✅ **Variants** (colors, sizes, etc.)
- ✅ **Anti-detection** (bypasses bot checks)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ASIN Manager UI                           │
│              (http://localhost:3000/admin/asin-manager)     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Shadow Scraper API                          │
│              (/api/shadow/scrape)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Playwright Headless Browser                      │
│  • Chromium with anti-detection fingerprinting             │
│  • User-Agent rotation                                     │
│  • Stealth scripts (bypass webdriver detection)            │
│  • Random delays (2-5 seconds between requests)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Amazon.com Product Pages                       │
│  • JSON-LD structured data extraction                      │
│  • DOM parsing (price, rating, specs, images)              │
│  • Availability + stock level detection                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Shadow Intelligence Database                     │
│  • shadow_products (current state)                         │
│  • shadow_price_history (time-series)                      │
│  • shadow_deal_radar (anomaly detection)                   │
│  • shadow_scrape_queue (job management)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Components

### 1. **Shadow Scraper Service**
**Location:** `src/services/shadow-scraper/amazonScraper.ts`

**Features:**
- Playwright browser pool manager
- Anti-detection fingerprinting
- JSON-LD metadata extraction
- DOM parsing engine
- Retry logic with exponential backoff
- Random User-Agent rotation

**Usage:**
```typescript
import { getScraper } from '@/services/shadow-scraper/amazonScraper';

const scraper = await getScraper();
const metadata = await scraper.scrapeASIN('B0BJQRXJZD');

console.log(metadata);
// {
//   asin: 'B0BJQRXJZD',
//   title: 'NVIDIA GeForce RTX 4070 Ti',
//   price: 799.99,
//   listPrice: 899.99,
//   discountPercent: 11,
//   rating: 4.7,
//   reviewCount: 1523,
//   category: 'Graphics Cards',
//   brand: 'NVIDIA',
//   imageUrl: '...',
//   imageGallery: [...],
//   availability: 'In Stock',
//   stockLevel: 'Only 5 left in stock',
//   attributes: {...},
//   technicalSpecs: {...},
//   variants: [...],
//   lastUpdated: '2025-12-08T12:00:00Z',
//   source: 'shadow-scraper'
// }
```

---

### 2. **Time-Series Database Schema**
**Location:** `database/shadow-intelligence-schema.sql`

**Tables:**
- `shadow_products` — Current product state (title, price, rating, specs)
- `shadow_price_history` — Price snapshots over time
- `shadow_deal_radar` — Detected price drops and deals
- `shadow_scrape_queue` — Job queue for background scraping
- `shadow_scraper_stats` — Performance monitoring

**Helper Functions:**
- `get_price_trend(asin, days)` — Price chart data
- `detect_price_drops()` — Find significant discounts
- `get_lowest_price(asin, days)` — Historical low price

**Setup:**
```bash
# Run schema migration
psql -U your_user -d your_database -f database/shadow-intelligence-schema.sql
```

---

### 3. **Shadow Scraper API**
**Location:** `src/app/api/shadow/scrape/route.ts`

**Endpoints:**

#### `GET /api/shadow/scrape?asins=B001,B002`
Scrape multiple ASINs (max 10 per request)

**Response:**
```json
{
  "ok": true,
  "data": {
    "products": [...],
    "scraped": 8,
    "failed": 2,
    "errors": ["Failed to scrape B003"]
  }
}
```

#### `POST /api/shadow/scrape`
Batch scrape with JSON body

**Request:**
```json
{
  "asins": ["B0BJQRXJZD", "B0CCLPW7LQ"]
}
```

#### `DELETE /api/shadow/scrape`
Close browser and cleanup resources

---

### 4. **ASIN Manager Integration**
**Location:** `src/app/admin/asin-manager/page.tsx`

**Features:**
- **Fetch Tab:** Scrape ASINs via Shadow Scraper
- **Search Tab:** Filter scraped products
- **Database Tab:** View product stats
- **Cache Tab:** Manage scraper cache
- **Sync Tab:** Sync to marketplace database
- **Export Tab:** Export as JSON/CSV

**Access:** http://localhost:3000/admin/asin-manager

---

## 🚀 Usage

### Quick Start

1. **Install Dependencies:**
```bash
npm install
npx playwright install chromium
```

2. **Run Database Migrations:**
```bash
psql -U postgres -d dxm369 -f database/shadow-intelligence-schema.sql
```

3. **Start Dev Server:**
```bash
npm run dev
```

4. **Open ASIN Manager:**
```
http://localhost:3000/admin/asin-manager
```

5. **Fetch ASINs:**
- Enter ASINs in the Fetch tab (space or comma separated)
- Click "🚀 Fetch ASINs"
- Shadow Scraper will scrape Amazon and return full metadata

---

### API Usage

**Scrape Single ASIN:**
```bash
curl "http://localhost:3000/api/shadow/scrape?asins=B0BJQRXJZD"
```

**Batch Scrape:**
```bash
curl -X POST http://localhost:3000/api/shadow/scrape \
  -H "Content-Type: application/json" \
  -d '{"asins": ["B0BJQRXJZD", "B0CCLPW7LQ"]}'
```

**Close Browser:**
```bash
curl -X DELETE http://localhost:3000/api/shadow/scrape
```

---

## 🔒 Anti-Detection Features

### Browser Fingerprinting
- `navigator.webdriver` override (set to `false`)
- Mock plugins array
- Mock languages (`en-US`, `en`)
- Chrome runtime object injection
- Permissions API mocking

### Request Behavior
- Random User-Agent rotation (Windows, macOS, Linux)
- Random delays between requests (2-5 seconds)
- Realistic viewport sizes (1920x1080)
- Locale/timezone spoofing (en-US, America/New_York)

### Headers
- Disabled automation features
- No sandbox mode (for Docker compatibility)
- Disabled web security (allows cross-origin requests)

---

## 📊 Data Extraction

### JSON-LD Structured Data
Amazon embeds product metadata in `<script type="application/ld+json">` tags:
```json
{
  "@type": "Product",
  "name": "NVIDIA GeForce RTX 4070 Ti",
  "brand": "NVIDIA",
  "offers": {
    "price": "799.99",
    "priceCurrency": "USD",
    "availability": "InStock"
  },
  "aggregateRating": {
    "ratingValue": "4.7",
    "reviewCount": "1523"
  }
}
```

### DOM Parsing Targets
| Data | Selector |
|------|----------|
| Title | `#productTitle` |
| Price | `.a-price .a-offscreen` |
| List Price | `.a-price.a-text-price .a-offscreen` |
| Rating | `[data-hook="rating-out-of-text"]` |
| Reviews | `[data-hook="total-review-count"]` |
| Category | `#wayfinding-breadcrumbs_feature_div a` |
| Brand | `#bylineInfo` |
| Image | `#landingImage` |
| Availability | `#availability` |
| Attributes | `#feature-bullets ul li` |
| Specs | `#productDetails_techSpec_section_1 tr` |

---

## 🎯 DXM Score Calculation

The Shadow Scraper includes a **Quick DXM Score** algorithm:

```typescript
function calculateQuickDXMScore(product) {
  let score = 5; // Base

  // Discount boost (+0 to +2)
  if (product.discountPercent > 0) {
    score += Math.min(product.discountPercent / 10, 2);
  }

  // Rating boost (+0 to +1.5)
  if (product.rating >= 4.5) score += 1.5;
  else if (product.rating >= 4.0) score += 1;
  else if (product.rating >= 3.5) score += 0.5;

  // Review count (+0 to +1)
  if (product.reviewCount > 1000) score += 1;
  else if (product.reviewCount > 500) score += 0.5;

  // Availability (+0.5)
  if (product.availability.includes('In Stock')) score += 0.5;

  return Math.min(score, 10); // Cap at 10
}
```

---

## 🛠️ Configuration

### Environment Variables
```bash
# Not required for shadow scraper (replaces PA-API)
# Optional: Add PostgreSQL connection for time-series tracking
DATABASE_URL=postgresql://user:pass@localhost:5432/dxm369
```

### Scraper Settings
Edit `src/services/shadow-scraper/amazonScraper.ts`:

```typescript
// Browser args
args: [
  '--disable-blink-features=AutomationControlled',
  '--no-sandbox',
  // Add proxy here:
  // '--proxy-server=http://proxy.example.com:8080'
]

// Request delays
this.randomDelay(2000, 5000); // 2-5 seconds
```

---

## 🚧 Roadmap

### Phase 1: Core Scraper ✅
- [x] Playwright browser pool
- [x] Anti-detection fingerprinting
- [x] JSON-LD + DOM extraction
- [x] ASIN Manager integration

### Phase 2: Price Intelligence ⏳
- [ ] Automatic background scraping (CRON)
- [ ] Price drop detection
- [ ] Deal Radar automation
- [ ] Email alerts for price drops

### Phase 3: Advanced Features 🔮
- [ ] Proxy rotation (residential proxies)
- [ ] CAPTCHA solving (2captcha integration)
- [ ] Multi-threading (parallel browser instances)
- [ ] Redis queue for job management
- [ ] Product image downloading + CDN upload

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| Scrape Time (per ASIN) | 3-8 seconds |
| Max ASINs/Request | 10 |
| Success Rate | ~95% (no CAPTCHA) |
| Browser Memory | ~150MB per instance |
| Concurrent Requests | 1 (sequential to avoid detection) |

---

## ⚠️ Important Notes

### Legal & Ethical Use
- **Robots.txt Compliance:** Amazon's robots.txt blocks automated scraping. This tool is intended for **personal research and development only**.
- **Rate Limiting:** Use responsible delays (2-5 seconds) to avoid overloading Amazon's servers.
- **Terms of Service:** Review Amazon's TOS before deploying in production.

### Production Deployment
- Use **residential proxies** to avoid IP bans
- Implement **CAPTCHA solving** (2captcha, Anti-Captcha)
- Add **request retry logic** with exponential backoff
- Monitor scraper health via `shadow_scraper_stats` table
- Run in **Docker container** for isolated browser environment

---

## 🐛 Troubleshooting

### CAPTCHA Detected
```
[Shadow Scraper] CAPTCHA detected for B0BJQRXJZD
```
**Solution:** Add residential proxies or implement CAPTCHA solving.

### Browser Fails to Launch
```
Error: Failed to launch browser
```
**Solution:** Install Chromium manually:
```bash
npx playwright install chromium
```

### Slow Scraping
```
[Shadow Scraper] Fetching took 45 seconds
```
**Solution:** Reduce `waitForTimeout` in `amazonScraper.ts` or use faster proxies.

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Amazon JSON-LD Reference](https://schema.org/Product)
- [DXM369 Main Docs](./README.md)

---

**Built with 🔥 by DXMatrix Intelligence**
Shadow ops. No dependencies. Full control.
