# DXM369 Marketplace - Vercel Environment Checklist

sudo **Priority:** 🚨 **CRITICAL** - Fix these first to get production online

---

## 🎯 STEP 1: BASE_URL FIX (5 minutes)

**Issue:** `baseUrl: clientEnv.NEXT_PUBLIC_BASE_URL || clientEnv.NEXT_PUBLIC_SITE_URL` are both undefined

**Solution:** Add this single variable in Vercel:

```env
NEXT_PUBLIC_BASE_URL=https://dxm369.com
```

**Impact:** This alone fixes broken URLs, wrong categories, marketplace display errors, and build-time fetch problems.

---

## 🚨 STEP 2: CRITICAL PRODUCTION VARIABLES (10 minutes)

### Required Server Environment Variables (Production Bootstrapping)

Add these variables in Vercel Project Settings → Environment Variables:

| Variable | Value | Priority | Purpose |
|----------|-------|----------|---------|
| `AMAZON_ACCESS_KEY_ID` | `placeholder` | Critical | Amazon API authentication |
| `AMAZON_SECRET_ACCESS_KEY` | `placeholder` | Critical | Amazon API authentication |
| `AMAZON_ASSOCIATE_TAG` | `dxm369-20` | Critical | Your affiliate tag |
| `DATABASE_URL` | **ALREADY CONFIGURED** ✅ | - | Database connection |
| `APP_SECRET` | `dev123` | Critical | Application security |
| `JWT_SECRET` | `dev123` | Critical | JWT token signing |
| `RATE_LIMIT_SECRET` | `dev123` | Critical | Rate limiting |

### Required Client Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_BASE_URL` | `https://dxm369.com` | **FIXES URL CONSTRUCTION** |
| `NEXT_PUBLIC_SITE_URL` | `https://dxm369.com` | Site URL fallback |
| `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` | `dxm369-20` | Public affiliate tag |

---

## 📋 COMPLETE VERCEL ENVIRONMENT VARIABLES

### 🔧 Server-Side Variables (Never exposed to browser)

```env
# CRITICAL - Add these in Vercel
AMAZON_ACCESS_KEY_ID=placeholder
AMAZON_SECRET_ACCESS_KEY=placeholder
AMAZON_ASSOCIATE_TAG=dxm369-20
APP_SECRET=dev123
JWT_SECRET=dev123
RATE_LIMIT_SECRET=dev123

# ALREADY CONFIGURED ✅
DATABASE_URL=postgres://postgres.exjybhkzpujynbsswsth:ykupXjBJNEPlKdnH@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# OPTIONAL (can add later)
AMAZON_REGION=us-east-1
AMAZON_HOST=webservices.amazon.com
AMAZON_TRACKING_IDS=dxm369-20,dxmatrix-storage-20,dxmatrix-laptops-20,dxmatrix-monitors-20,dxmatrix-gpus-20,dxmatrix-cpus-20,dxmatrix-seo-20,dxmatrix-x-20,dxmatrix-youtube-20,dxmatrix-review-20,dxmatrix-top10-20,dxmatrix-deal-20
ADMIN_SECRET=admin123
CRON_SECRET=cron123
FROM_EMAIL=noreply@dxm369.com
```

### 🌐 Client-Side Variables (```env
# CRITICAL - AddSafe to expose)

 these in Vercel
NEXT_PUBLIC_BASE_URL=https://dxm369.com
NEXT_PUBLIC_SITE_URL=https://dxm369.com
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20

# ALREADY CONFIGURED ✅
NEXT_PUBLIC_DATABASE_SUPABASE_URL=https://exjybhkzpujynbsswsth.supabase.co
NEXT_PUBLIC_DATABASE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4anliaGt6cHVqeW5ic3N3c3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDU4MTQsImV4cCI6MjA4MDc4MTgxNH0.QJ_t_fkg2hKSBo-CLZypvFd_C_7QhnUmfEYZY5N9noo
```

---

## ⚡ STEP 3: DNS CONFIGURATION (1 minute)

**Current Issue:** Domain `dxm369.com` still points to old hosting (216.198.79.1)

**Fix Required:** Update Cloudflare DNS records:

```
Type: CNAME
Name: dxm369.com
Target: cname.vercel-dns.com
TTL: Auto

Type: CNAME  
Name: www
Target: cname.vercel-dns.com
TTL: Auto
```

**Timeline:** DNS propagation takes 1 hour maximum.

---

## 🧪 STEP 4: POST-DEPLOYMENT VERIFICATION

### Immediate Tests (After Vercel Deploy)

1. **URL Construction Test**
   - Visit: `https://dxm369.com/best-gpu-deals`
   - Should load without URL parsing errors

2. **Environment Validation**
   - Run: `pnpm validate-env`
   - Should show 70%+ readiness score

3. **Database Connection**
   - Test API route: `https://dxm369.com/api/dxm/products/gpus`
   - Should return data (not database connection errors)

4. **Marketplace Pages**
   - Test: `https://dxm369.com/gpus`
   - Should display products correctly

### Complete Testing Suite

```bash
# Run these commands to verify everything works
pnpm validate-env
pnpm build:strict
curl https://dxm369.com/api/dxm/products/gpus
curl https://dxm369.com/api/dxm/products/laptops
```

---

## 🔄 DEPLOYMENT SEQUENCE

### Phase 1: Environment Variables (10 minutes)
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable from the lists above
4. Set Environment: Production
5. Click "Save"

### Phase 2: Deploy (5 minutes)
1. Trigger new deployment (git push or manual deploy)
2. Wait for build completion
3. Check deployment logs for errors

### Phase 3: DNS Update (1 minute)
1. Cloudflare Dashboard → DNS
2. Update CNAME records as shown above
3. Wait for propagation (1 hour max)

### Phase 4: Verification (15 minutes)
1. Run post-deployment tests above
2. Verify all critical pages load
3. Test marketplace functionality

---

## 🚀 IMMEDIATE ACTION ITEMS

**Copy & Paste This Into Vercel:**

```env
# Add these CRITICAL variables:
AMAZON_ACCESS_KEY_ID=placeholder
AMAZON_SECRET_ACCESS_KEY=placeholder
AMAZON_ASSOCIATE_TAG=dxm369-20
APP_SECRET=dev123
JWT_SECRET=dev123
RATE_LIMIT_SECRET=dev123
NEXT_PUBLIC_BASE_URL=https://dxm369.com
NEXT_PUBLIC_SITE_URL=https://dxm369.com
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20
```

---

## 📊 EXPECTED RESULTS

After implementing this checklist:

✅ **URL Construction Fixed** - All pages load without errors  
✅ **Database Connected** - Products display correctly  
✅ **Environment Validated** - 70%+ readiness score  
✅ **Marketplace Online** - Full functionality restored  
✅ **Build Process Stable** - No more build failures  

**Timeline:** 15 minutes total implementation → Production live

---

## 🔐 REPLACE PLACEHOLDERS LATER

These placeholders allow production to boot immediately. Replace with real values when ready:

- `placeholder` → Your real Amazon credentials
- `dev123` → Secure production secrets
- `admin123` → Secure admin password

**Current Status:** 95% complete - just needs these configuration fixes!

---

