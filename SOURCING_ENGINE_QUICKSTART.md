# DXM Sourcing Engine - Quick Start (5 Minutes)

## 🔴 Action Item #0: Revoke Exposed Token (2 min)

Kaggle token leaked in chat: `KGAT_0198c0c0cdc5f9368cfeb89cefecc922`

```
1. https://www.kaggle.com/account → API → Revoke
2. Create New API Token → saves kaggle.json
3. mkdir -p ~/.kaggle && cp ~/Downloads/kaggle.json ~/.kaggle/
4. chmod 600 ~/.kaggle/kaggle.json
```

Verify: `kaggle datasets list -s "electronics"`

---

## 📥 Action Item #1: Download Datasets (5 min)

```bash
mkdir -p ~/Documents/DXM_ASIN_Sourcing/data
cd ~/Documents/DXM_ASIN_Sourcing

# 10K dataset
kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items -p data
unzip -o data/*.zip -d data && rm data/*.zip

# 1.4M dataset (optional, large - 1GB)
kaggle datasets download -d asaniczka/amazon-products-dataset-2023-1-4m-products -p data
unzip -o data/*.zip -d data && rm data/*.zip
```

Verify: `ls -lah ~/Documents/DXM_ASIN_Sourcing/data/`

---

## ✅ Execute Pipeline

```bash
cd ~/Documents/Cursor_Dev/Project_DXM369_Marketplace

# Option A: Full automatic (interactive)
bash scripts/dxm-full-pipeline.sh

# Option B: Manual steps
npx ts-node scripts/dxm-prereq-check.ts
ADMIN_SECRET="ak3693" npx ts-node scripts/dxm-asin-sourcing-engine.ts
curl -X POST http://localhost:3002/api/admin/products/bulkImport \
  -H "Content-Type: application/json" \
  -H "x-admin-key: ak3693" \
  --data @/tmp/dxm-asin-engine/dxm_clean_products.json
```

---

## 🎯 Success = 1,200+ ASINs Ingested

Expected response:
```json
{
  "ok": true,
  "data": {
    "success": 1200,
    "failed": 0
  }
}
```

Verify marketplace: `http://localhost:3002` (after `npm run dev`)

---

## 📚 Full Docs

- **Complete Setup**: `docs/KAGGLE_SETUP_GUIDE.md`
- **Detailed Guide**: `DXM_SOURCING_ENGINE_READY.md`
- **Implementation**: `scripts/dxm-asin-sourcing-engine.ts`

---

**Timeline**: 10 minutes (5 min setup + 5 min execution) = **1,200+ ASINs live**
