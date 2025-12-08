# 🚀 Shadow Intelligence — Quick Start

**Ready in 3 minutes. Full Amazon scraping power.**

---

## ✅ What You Just Got

```
✅ Playwright scraper (bypasses bot detection)
✅ Full metadata extraction (price, specs, images, ratings)
✅ Time-series price tracking database
✅ Shadow Scraper API (/api/shadow/scrape)
✅ ASIN Manager UI integration
✅ DXM Score calculation engine
```

---

## 🏃 Quick Start (3 Steps)

### 1. Install Chromium Browser
```bash
npx playwright install chromium
```

### 2. Run Database Setup (Optional - for price tracking)
```bash
bash scripts/setup-shadow-intelligence.sh
```

### 3. Start Dev Server
```bash
npm run dev
```

---

## 🎯 Test It Now

1. **Open ASIN Manager:**
   ```
   http://localhost:3000/admin/asin-manager
   ```

2. **Enter Test ASINs** (in Fetch tab):
   ```
   B0BJQRXJZD B0CCLPW7LQ B0DVCBDJBJ
   ```

3. **Click "🚀 Fetch ASINs"**

4. **Watch the magic** 🪄
   - Playwright opens headless Chromium
   - Scrapes Amazon product pages
   - Extracts full metadata (price, specs, images)
   - Returns DXM-scored products

---

## 📊 What You'll See

```json
{
  "asin": "B0BJQRXJZD",
  "title": "NVIDIA GeForce RTX 4070 Ti 12GB",
  "price": 799.99,
  "listPrice": 899.99,
  "discountPercent": 11,
  "rating": 4.7,
  "reviewCount": 1523,
  "category": "Graphics Cards",
  "brand": "NVIDIA",
  "dxmScore": 7.8,
  "availability": "In Stock",
  "stockLevel": "Only 5 left in stock",
  "imageGallery": [...],
  "attributes": {...},
  "technicalSpecs": {...},
  "source": "shadow-scraper"
}
```

---

## 🔥 API Usage

### Scrape ASINs via API
```bash
curl "http://localhost:3000/api/shadow/scrape?asins=B0BJQRXJZD,B0CCLPW7LQ"
```

### Response
```json
{
  "ok": true,
  "data": {
    "products": [...],
    "scraped": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## 🛠️ Configuration

### Max ASINs Per Request
Edit `src/app/api/shadow/scrape/route.ts`:
```typescript
if (asins.length > 10) {  // Change 10 to your limit
  return NextResponse.json(...);
}
```

### Request Delays
Edit `src/services/shadow-scraper/amazonScraper.ts`:
```typescript
await this.randomDelay(2000, 5000);  // 2-5 seconds
```

### User-Agent Rotation
Edit `getRandomUserAgent()` in `amazonScraper.ts`:
```typescript
const userAgents = [
  'Your custom user agent here',
  ...
];
```

---

## 🎯 Key Features

| Feature | Status | Location |
|---------|--------|----------|
| Headless Scraping | ✅ | `src/services/shadow-scraper/` |
| Anti-Detection | ✅ | Browser fingerprinting + delays |
| JSON-LD Extraction | ✅ | Structured data parser |
| DOM Parsing | ✅ | Price, specs, images, ratings |
| Price History | ✅ | `shadow_price_history` table |
| Deal Detection | ✅ | `shadow_deal_radar` table |
| DXM Scoring | ✅ | Algorithm in ASIN Manager |
| UI Integration | ✅ | `/admin/asin-manager` |

---

## 🚧 Next Steps

### Enable Price Tracking
Run database migrations:
```bash
psql -U postgres -d dxm369 -f database/shadow-intelligence-schema.sql
```

### Add CRON Job (Auto-Scraping)
Create `/api/cron/scrape-products/route.ts`:
```typescript
export async function GET(request: NextRequest) {
  const scraper = await getScraper();
  const asins = await getASINsFromDatabase();
  const results = await scraper.scrapeASINs(asins);
  // Save to shadow_price_history
  return NextResponse.json({ scraped: results.length });
}
```

### Deploy with Vercel
```bash
vercel deploy
```

**Note:** Vercel serverless functions have 10-second timeout. Use background jobs for large scrapes.

---

## ⚠️ Important

### Legal & Ethical Use
- ✅ **Personal research and development**
- ✅ **Testing and education**
- ❌ **Mass scraping (1000s of products/hour)**
- ❌ **Commercial use without review**

### Best Practices
- Use **2-5 second delays** between requests
- Limit to **10 ASINs per batch**
- Add **residential proxies** for production
- Monitor **scraper_stats** table for health

---

## 📚 Full Documentation

See `SHADOW_INTELLIGENCE.md` for:
- Architecture diagrams
- Database schema details
- Anti-detection techniques
- Production deployment guide
- Troubleshooting

---

## 🐛 Troubleshooting

### "CAPTCHA detected"
**Solution:** Add delays, use proxies, or reduce scrape frequency.

### "Browser failed to launch"
**Solution:** Run `npx playwright install chromium`

### "Slow scraping (10+ seconds per ASIN)"
**Solution:** Reduce `waitForTimeout` or use faster network.

---

**Built with 🔥 by DXMatrix**
No PA-API required. Full metadata. Full control.
