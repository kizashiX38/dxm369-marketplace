# Kaggle API Setup & Dataset Download Guide

**Status**: Security Issue Detected ⚠️
**Action Required**: Token revocation + new credential generation
**Estimated Time**: 15 minutes total

---

## 🔴 SECURITY ACTION - ACTION ITEM #0

### Exposed Token Information
- **Token**: `KGAT_0198c0c0cdc5f9368cfeb89cefecc922` (COMPROMISED)
- **Status**: DO NOT USE after revocation
- **Assumption**: Token is burned/compromised due to chat exposure

### Immediate Steps Required

**Step 1: Revoke Exposed Token** (2 minutes)
1. Go to https://www.kaggle.com/account
2. Scroll to "API" section
3. Click "Revoke" button on the exposed token
4. Confirm revocation

**Step 2: Generate New API Key** (2 minutes)
1. Still in https://www.kaggle.com/account → API section
2. Click "Create New API Token"
3. This downloads `kaggle.json` file to your Downloads folder
4. **DO NOT** commit this file to git or paste in chat

**Step 3: Install kaggle.json** (2 minutes)
```bash
# Create Kaggle config directory
mkdir -p ~/.kaggle

# Copy the downloaded kaggle.json
cp ~/Downloads/kaggle.json ~/.kaggle/

# Set correct permissions (required by Kaggle CLI)
chmod 600 ~/.kaggle/kaggle.json

# Verify installation
ls -la ~/.kaggle/kaggle.json
# Should show: -rw------- 1 dxm dxm ... kaggle.json
```

**Step 4: Verify Kaggle CLI** (2 minutes)
```bash
# Test authentication
kaggle datasets list -s "electronics" --max-items 3

# Expected output:
# ref                                               title                                  size  lastUpdated        downloadCount  voteCount
# akeshkumarhp/electronics-products-amazon-10k...  Electronics Products Amazon 10K ...   75MB  2023-05-15        12345          567
```

If you see datasets listed, Kaggle CLI is properly configured. ✅

---

## 📥 Dataset Download Instructions

### Setup

```bash
# Create data directory
mkdir -p ~/Documents/DXM_ASIN_Sourcing/data
cd ~/Documents/DXM_ASIN_Sourcing
```

### Dataset 1: Kaggle Electronics 10K

**Description**: Premium electronics dataset with 10,000+ ASINs
**Dataset ID**: `akeshkumarhp/electronics-products-amazon-10k-items`
**Expected Size**: ~75 MB (uncompressed: ~250 MB)
**Expected Duration**: 1-2 minutes

```bash
# Download
echo "Downloading Kaggle 10K dataset..."
kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items -p data

# Unzip
echo "Extracting..."
unzip -o "data/electronics-products-amazon-10k-items.zip" -d data
rm data/electronics-products-amazon-10k-items.zip

# Verify
ls -lah data/ | grep -i electronics
# Should show: electronics_data.csv (or similar)
```

**CSV Schema Expected**:
```
asin,title,price,rating,review_count,brand,category,image_url
B0BJQRXJZD,NVIDIA GeForce RTX 4090...,2499.99,4.8,5200,NVIDIA,Electronics,...
```

**Key Columns**:
- `asin` - Amazon Standard Identification Number (10-character code)
- `title` - Product name
- `price` - Current price
- `rating` - Average customer rating (0-5)
- `review_count` - Number of reviews
- `brand` - Manufacturer name
- `category` - Product category

---

### Dataset 2: Kaggle Amazon Products 2023 (1.4M)

**Description**: Massive 1.4M product dataset from 2023
**Dataset ID**: `asaniczka/amazon-products-dataset-2023-1-4m-products`
**Expected Size**: ~200 MB compressed (1+ GB uncompressed)
**Expected Duration**: 3-5 minutes download + extraction
**Note**: Script samples this dataset (~5,000 items) due to size

```bash
# Download
echo "Downloading Kaggle 1.4M dataset..."
kaggle datasets download -d asaniczka/amazon-products-dataset-2023-1-4m-products -p data

# Unzip
echo "Extracting (this may take 1-2 minutes)..."
unzip -o "data/amazon-products-dataset-2023-1-4m-products.zip" -d data
rm "data/amazon-products-dataset-2023-1-4m-products.zip"

# Verify
ls -lah data/ | grep -i amazon
# Should show: amazon_products_2023.csv (or similar) - 1+ GB file
```

**CSV Schema Expected**:
```
asin,title,category,price,rating,reviews
B0BJQRXJZE,NVIDIA GeForce RTX 4080...,Electronics,1599.99,4.7,3100
```

**Note on Size**: This dataset is large (~1GB uncompressed). The sourcing engine includes intelligent sampling (processes ~1 in every N-th row) to extract ~5,000 representative products without loading entire dataset into memory.

---

### Dataset 3: GitHub Electronics ASINs

**Status**: Optional but recommended for maximum coverage
**Expected Benefit**: +200-500 additional unique ASINs
**Expected Duration**: 2-3 minutes

**Option A: Clone GitHub Repository** (Recommended)
```bash
# Find a suitable electronics ASIN dataset on GitHub
# Example: https://github.com/[user]/amazon-asins-electronics

# Clone to a temporary location
git clone https://github.com/[USER]/[REPO].git /tmp/github-electronics

# Copy CSV files to data directory
mkdir -p data/github-electronics
cp /tmp/github-electronics/*.csv data/github-electronics/

# Cleanup
rm -rf /tmp/github-electronics
```

**Option B: Manual Download**
1. Browse GitHub for "amazon ASIN" or "amazon products" repositories
2. Look for `.csv` files with ASIN data
3. Download and extract to `data/github-electronics/`

**Recommended Repos to Search**:
- Search: "amazon electronics ASIN csv github"
- Look for: repos with 100+ stars, recent commits
- Files: `*.csv` with columns like `asin,title,price,category`

---

## 🧪 Verification & Diagnostics

### Run Prerequisite Checker

After setting up Kaggle and downloading datasets, verify everything is ready:

```bash
# Check all prerequisites
npx ts-node scripts/dxm-prereq-check.ts

# Expected output:
# ✓ Kaggle Config          [PASS] Configured for user: your_username
# ✓ Data Directory         [PASS] Directory exists: /home/dxm/Documents/DXM_ASIN_Sourcing/data
# ✓ Kaggle 10K Dataset     [PASS] Found electronics_data.csv
# ✓ Kaggle 1.4M Dataset    [PASS] Found amazon_products_2023.csv
# ✓ GitHub Datasets        [WARN] github-electronics directory not found
# ✓ ADMIN_SECRET           [PASS] Set to: ak3***
# ✓ Dev Server             [PASS] Running on http://localhost:3002
# ✓ Output Directory       [PASS] Exists: /tmp/dxm-asin-engine
```

### Check File Sizes

```bash
# Verify dataset sizes
du -sh ~/Documents/DXM_ASIN_Sourcing/data/*

# Expected output:
# 250M electronics_data.csv (Kaggle 10K)
# 1.2G amazon_products_2023.csv (Kaggle 1.4M)
# 50M  github-electronics/ (if present)
```

### Test Kaggle Authentication

```bash
# List available datasets
kaggle datasets list --max-items 5

# Download a small test file
kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items -p /tmp/test

# Should complete without authentication errors
```

---

## 🚀 Ready to Execute

Once all prerequisites pass, run the sourcing engine:

```bash
# Option 1: With environment variable
ADMIN_SECRET="ak3693" npx ts-node scripts/dxm-asin-sourcing-engine.ts

# Option 2: With .env.local configured
npx ts-node scripts/dxm-asin-sourcing-engine.ts

# Option 3: Full verbose execution
ADMIN_SECRET="ak3693" NEXT_PUBLIC_SITE_URL="http://localhost:3002" \
  npx ts-node scripts/dxm-asin-sourcing-engine.ts 2>&1 | tee /tmp/sourcing-engine.log
```

**Expected Output**:
```
🚀 DXM ASIN SOURCING ENGINE v1.0

📂 Parsing Kaggle 10K: /home/dxm/Documents/DXM_ASIN_Sourcing/data/electronics_data.csv
✓ Kaggle 10K: 8,547 valid products extracted

📂 Parsing Kaggle 1.4M: /home/dxm/Documents/DXM_ASIN_Sourcing/data/amazon_products_2023.csv
✓ Kaggle 1.4M: 4,821 valid products extracted (sampled)

📂 Parsing GitHub datasets from: /home/dxm/Documents/DXM_ASIN_Sourcing/data/github-electronics
✓ GitHub: 342 valid products extracted

📊 Total products from all sources: 13,710
🧹 Deduplicating and enforcing per-category caps...
gpu: 250/2102 (capped at 250)
cpu: 250/1998 (capped at 250)
storage: 250/3001 (capped at 250)
...

✅ COMPLETE: 1,200 products ready
📁 Output: /tmp/dxm-asin-engine/dxm_clean_products.json

👉 Next: Ingest with:
curl -X POST http://localhost:3002/api/admin/products/bulkImport \
  -H "Content-Type: application/json" \
  -H "x-admin-key: ak3693" \
  --data @/tmp/dxm-asin-engine/dxm_clean_products.json
```

---

## 🔧 Troubleshooting

### Issue: "403 Forbidden" when downloading

**Cause**: Kaggle token not configured or invalid
**Fix**:
```bash
# Verify kaggle.json exists
cat ~/.kaggle/kaggle.json

# Should show JSON with "username" and "key" fields
# If missing, re-download from https://www.kaggle.com/account

# Check permissions
chmod 600 ~/.kaggle/kaggle.json
```

### Issue: "Dataset not found"

**Cause**: Dataset ID changed or was removed
**Fix**:
```bash
# Search for alternative datasets
kaggle datasets search -s "amazon electronics"

# Use dataset ref from search results
kaggle datasets download -d [new-ref] -p data
```

### Issue: "Insufficient disk space"

**Cause**: 1.4M dataset is 1+ GB uncompressed
**Fix**:
```bash
# Check available space
df -h ~/Documents/

# Free up space or use alternative:
# Download only Kaggle 10K dataset (75 MB)
# The sourcing engine still produces 1,000+ ASINs with just 10K dataset
```

### Issue: CSV parsing errors

**Cause**: Unexpected column names or formats
**Fix**:
1. Check first 5 lines: `head -5 data/electronics_data.csv`
2. Verify column headers match expected schema
3. Open sourcing engine script and adjust parsing logic if needed

---

## 📋 Checklist

- [ ] Revoked exposed Kaggle token (KGAT_0198c0c0cdc5f9368cfeb89cefecc922)
- [ ] Generated new Kaggle API token
- [ ] Installed kaggle.json to `~/.kaggle/`
- [ ] Set correct permissions: `chmod 600 ~/.kaggle/kaggle.json`
- [ ] Verified Kaggle CLI: `kaggle datasets list -s "electronics"`
- [ ] Created data directory: `~/Documents/DXM_ASIN_Sourcing/data`
- [ ] Downloaded Kaggle 10K dataset
- [ ] Downloaded Kaggle 1.4M dataset
- [ ] (Optional) Downloaded GitHub dataset
- [ ] Verified all files with `du -sh` and `ls -la`
- [ ] Ran prerequisite checker: `npx ts-node scripts/dxm-prereq-check.ts`
- [ ] Dev server running: `npm run dev` on port 3002
- [ ] Ready to execute sourcing engine

---

## 📞 Quick Reference

```bash
# Full setup in one command (after manual Kaggle setup):
mkdir -p ~/Documents/DXM_ASIN_Sourcing/data && \
cd ~/Documents/DXM_ASIN_Sourcing && \
kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items -p data && \
unzip -o "data/electronics-products-amazon-10k-items.zip" -d data && \
rm data/*.zip && \
npx ts-node scripts/dxm-prereq-check.ts

# Then execute:
ADMIN_SECRET="ak3693" npx ts-node scripts/dxm-asin-sourcing-engine.ts
```

---

**Next Step**: Follow this guide, then execute the sourcing engine to ingest 1,000+ ASINs into the marketplace.
