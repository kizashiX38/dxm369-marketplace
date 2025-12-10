# DXM ASIN Sourcing Engine v1 - Complete ETL Guide

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Status:** ✅ Production Ready

---

## Overview

The DXM ASIN Sourcing Engine is a multi-source ETL pipeline that normalizes product data from Kaggle and GitHub datasets into a single, clean JSON format ready for bulk import into the DXM369 Marketplace.

**Target:** Scale from ~499 → 1,000+ valid ASINs

**Sources:**
1. Kaggle Electronics 10K (high signal, clean)
2. Kaggle 1.4M Amazon 2023 (wide coverage)
3. GitHub ASIN/electronics datasets (supplementary)

---

## Prerequisites

### 1. Kaggle CLI Setup (10 minutes)

```bash
# Install Kaggle CLI
pip install kaggle

# Create config directory
mkdir -p ~/.config/kaggle

# Get your API token from: https://www.kaggle.com/settings
# Download kaggle.json and place it in ~/.config/kaggle/

# Set secure permissions (CRITICAL)
chmod 600 ~/.config/kaggle/kaggle.json

# Verify it works
kaggle datasets list -s "electronics" | head -5
```

**⚠️ SECURITY:** Never commit `kaggle.json` to git. See `KAGGLE_SECURITY_URGENT.md` if token was exposed.

### 2. Directory Structure

```bash
# Create data directory
mkdir -p ~/Documents/DXM_ASIN_Sourcing/data
mkdir -p ~/Documents/DXM_ASIN_Sourcing/output
```

### 3. Node.js Dependencies

Already installed in project:
- TypeScript
- ts-node
- Node.js file system APIs

---

## Phase 1: Dataset Acquisition

### Option A: Automated Download (Recommended)

The script automatically downloads datasets using Kaggle CLI:

```bash
npx ts-node scripts/dxm-asin-sourcing-engine-v1.ts
```

This will:
1. Check for Kaggle CLI
2. Download Electronics 10K dataset
3. Download 1.4M Amazon 2023 dataset (sampled)
4. Process local GitHub datasets if present

### Option B: Manual Download

If you prefer manual control:

```bash
cd ~/Documents/DXM_ASIN_Sourcing/data

# Download Electronics 10K
kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items \
  -f electronics_data.csv -p . --unzip

# Download 1.4M Amazon 2023
kaggle datasets download -d asaniczka/amazon-products-dataset-2023-1-4m-products \
  -p . --unzip

# GitHub datasets (clone repos manually)
mkdir -p github-electronics
# Clone your preferred GitHub ASIN dataset repos here
```

---

## Phase 2: Canonical Product Schema

The engine normalizes all sources to this canonical format:

```typescript
interface DXMProduct {
  asin: string;             // BXXXXXXXXX (validated)
  category: string;         // gpu | cpu | storage | memory | monitor | laptop | psu | motherboard | mice | cooling
  title: string;
  brand?: string;
  price?: number | null;
  list_price?: number | null;
  image?: string | null;
  url?: string | null;
  source: "kaggle-10k" | "kaggle-1.4m" | "github" | "manual";
  rating?: number;
  review_count?: number;
}
```

**Key Rules:**
- ASIN must match `/^B[0-9A-Z]{9}$/`
- Category is auto-classified from title/keywords
- Brand is extracted from title if not provided
- Invalid/missing data is filtered out

---

## Phase 3: Category Classification

The engine uses keyword-based classification with priority matching:

### Category Keywords

| Category | Keywords |
|----------|----------|
| **GPU** | rtx 4090, rtx 4080, radeon rx, graphics card, geforce |
| **CPU** | ryzen 9, core i9, processor, threadripper |
| **Storage** | nvme, m.2, ssd, samsung 990, wd black |
| **Memory** | ddr5, ddr4, ram, corsair dominator, g.skill |
| **Monitor** | monitor, 1440p, 4k, ultrawide, gaming monitor |
| **Laptop** | laptop, notebook, macbook, gaming laptop |
| **Motherboard** | motherboard, b650, z790, am5, lga1700 |
| **PSU** | power supply, psu, modular, gold rated |
| **Cooling** | cooler, liquid cooling, aio, noctua |
| **Mice** | mouse, gaming mouse, wireless, g502 |

**Classification Logic:**
1. Search title + raw category for keywords
2. First match wins (priority order)
3. If no match → filtered out (not in our vertical)

---

## Phase 4: Normalization Strategy

### Source 1: Kaggle Electronics 10K

**Expected Columns:**
- `asin`, `title`, `category`, `brand`, `price`, `image`, `url`

**Mapping:**
- ASIN: validated, uppercased
- Category: classified from title + raw category
- Brand: extracted if missing
- Price: parsed, null if invalid
- Source: `"kaggle-10k"`

### Source 2: Kaggle 1.4M Amazon 2023

**Expected Columns:**
- `asin`, `title`, `category`, `price` (may vary)

**Mapping:**
- Same as 10K, but **sampled** (every Nth row to cap at ~5000)
- Only products matching hardware vertical kept
- Source: `"kaggle-1.4m"`

### Source 3: GitHub Datasets

**Expected Columns:**
- Flexible detection (`asin`, `title`, `category`, `price`)

**Mapping:**
- Auto-detects column names
- Same classification logic
- Source: `"github"`

---

## Phase 5: Deduplication & Safety Filters

### Deduplication Strategy

1. **ASIN-based dedup:** Keep first occurrence
2. **Quality scoring:** If duplicate, keep product with:
   - Price data (1 point)
   - Image URL (1 point)
   - Highest score wins

### Per-Category Caps

To prevent UI explosion during testing:

| Category | Max Products |
|----------|--------------|
| GPU | 200 |
| CPU | 200 |
| Storage | 200 |
| Memory | 200 |
| Monitor | 200 |
| Laptop | 200 |
| Motherboard | 150 |
| PSU | 150 |
| Cooling | 100 |
| Mice | 100 |

**Total Expected:** 800-1,200+ valid ASINs

### Safety Filters

Products are **filtered out** if:
- ❌ Invalid ASIN format
- ❌ Missing title
- ❌ No category match (not in hardware vertical)
- ❌ Duplicate ASIN (after dedup)

---

## Phase 6: Output Format

The engine produces `dxm_clean_products.json`:

```json
{
  "products": [
    {
      "asin": "B0BJQRXJZD",
      "category": "gpu",
      "title": "MSI Gaming GeForce RTX 4070",
      "brand": "MSI",
      "price": 599.99,
      "list_price": 649.99,
      "image": "https://images-na.ssl-images-amazon.com/...",
      "url": "https://www.amazon.com/dp/B0BJQRXJZD"
    }
  ]
}
```

**Location:** `~/Documents/DXM_ASIN_Sourcing/output/dxm_clean_products.json`

---

## Phase 7: Bulk Import

### Local Development

```bash
curl -X POST "http://localhost:3002/api/admin/products/bulkImport" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: ak3693" \
  --data @~/Documents/DXM_ASIN_Sourcing/output/dxm_clean_products.json
```

### Production

```bash
curl -X POST "https://dxm369.com/api/admin/products/bulkImport" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  --data @dxm_clean_products.json
```

### Expected Response

```json
{
  "ok": true,
  "data": {
    "success": 850,
    "failed": 12,
    "errors": [...]
  }
}
```

---

## Execution Workflow

### Quick Start (Automated)

```bash
# 1. Setup Kaggle CLI (one-time)
pip install kaggle
mkdir -p ~/.config/kaggle
# Copy kaggle.json here
chmod 600 ~/.config/kaggle/kaggle.json

# 2. Run the engine
npx ts-node scripts/dxm-asin-sourcing-engine-v1.ts

# 3. Import to marketplace
curl -X POST "http://localhost:3002/api/admin/products/bulkImport" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: ak3693" \
  --data @~/Documents/DXM_ASIN_Sourcing/output/dxm_clean_products.json
```

### Manual Workflow

```bash
# 1. Download datasets manually
cd ~/Documents/DXM_ASIN_Sourcing/data
kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items -f electronics_data.csv -p . --unzip
kaggle datasets download -d asaniczka/amazon-products-dataset-2023-1-4m-products -p . --unzip

# 2. Run parser (will use local files)
npx ts-node scripts/dxm-asin-sourcing-engine-v1.ts

# 3. Review output
cat ~/Documents/DXM_ASIN_Sourcing/output/dxm_clean_products.json | jq '.products | length'

# 4. Import
curl -X POST "http://localhost:3002/api/admin/products/bulkImport" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: ak3693" \
  --data @~/Documents/DXM_ASIN_Sourcing/output/dxm_clean_products.json
```

---

## Troubleshooting

### Issue: Kaggle CLI Not Found

```bash
# Install Kaggle CLI
pip install kaggle

# Verify installation
which kaggle
kaggle --version
```

### Issue: Authentication Error

```bash
# Check token exists
ls -la ~/.config/kaggle/kaggle.json

# Verify permissions
chmod 600 ~/.config/kaggle/kaggle.json

# Test authentication
kaggle datasets list -s "electronics" | head -5
```

### Issue: No Products Found

**Check:**
1. Data directory exists: `~/Documents/DXM_ASIN_Sourcing/data`
2. CSV files are present
3. Files are readable
4. CSV format matches expected columns

**Debug:**
```bash
# Check data directory
ls -la ~/Documents/DXM_ASIN_Sourcing/data/

# Check file contents
head -5 ~/Documents/DXM_ASIN_Sourcing/data/electronics_data.csv
```

### Issue: Category Classification Failing

**Symptoms:** Products filtered out, low counts

**Fix:** Review keyword mappings in script, add missing keywords for your datasets

### Issue: Import Fails

**Check:**
1. API endpoint is correct
2. Admin key is valid
3. JSON format is valid
4. Server is running

**Debug:**
```bash
# Validate JSON
cat dxm_clean_products.json | jq .

# Test API endpoint
curl http://localhost:3002/api/health
```

---

## Performance Metrics

**Expected Processing Times:**

| Dataset | Size | Processing Time |
|---------|------|-----------------|
| Kaggle 10K | ~10K rows | ~5 seconds |
| Kaggle 1.4M | ~1.4M rows | ~30 seconds (sampled) |
| GitHub | Variable | ~10 seconds |

**Total Pipeline:** ~1-2 minutes end-to-end

**Output Size:** ~800-1,200 products (after dedup & caps)

---

## Next Steps

After successful import:

1. **Verify Products:**
   ```bash
   curl http://localhost:3002/api/dxm/products/gpus?limit=10
   ```

2. **Check Categories:**
   - Visit `/gpus`, `/cpus`, `/storage`, etc.
   - Verify products display correctly

3. **Monitor Performance:**
   - Check database size
   - Monitor API response times
   - Review error logs

4. **Iterate:**
   - Adjust category caps if needed
   - Add more keyword mappings
   - Include additional data sources

---

## Maintenance

### Updating Keyword Mappings

Edit `CATEGORY_KEYWORDS` in `scripts/dxm-asin-sourcing-engine-v1.ts`:

```typescript
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gpu: [
    'rtx 4090',
    'rtx 4080',
    // Add new keywords here
  ],
  // ...
};
```

### Adjusting Category Caps

Edit `MAX_PER_CATEGORY` in script:

```typescript
const MAX_PER_CATEGORY: Record<string, number> = {
  gpu: 200,  // Increase if needed
  // ...
};
```

### Adding New Data Sources

1. Add parser function (similar to `parseCSV`)
2. Add source to main execution
3. Update `DXMProduct['source']` type

---

## Support

**Documentation:**
- `KAGGLE_SECURITY_URGENT.md` - Token security
- `DXM_ASIN_ETL.md` - This guide
- `AGENTS.md` - Agent instructions

**Scripts:**
- `scripts/dxm-asin-sourcing-engine-v1.ts` - Main ETL pipeline
- `scripts/kaggle-to-dxm-pipeline.ts` - Legacy pipeline (deprecated)

**API:**
- `/api/admin/products/bulkImport` - Bulk import endpoint

---

**Status:** ✅ Ready for production use  
**Last Tested:** 2025-12-10  
**Next Review:** After first 1,000+ product import

