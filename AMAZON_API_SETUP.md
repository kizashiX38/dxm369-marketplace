# DXM369 Amazon API Integration Setup

## 🚀 Quick Start Guide

### 1. Amazon Associate Program Setup

1. **Sign up for Amazon Associates:**
   - Visit: https://affiliate-program.amazon.com/
   - Create account and get approved
   - Note your Associate Tag (e.g., `dxm369-20`)

2. **Get Product Advertising API Access:**
   - Visit: https://affiliate-program.amazon.com/assoc_credentials/home
   - Request Product Advertising API access
   - Generate Access Key ID and Secret Access Key

### 2. Environment Variables Setup

Create `.env.local` in your project root:

```bash
# Amazon Product Advertising API Configuration
AMAZON_ACCESS_KEY_ID=your_access_key_here
AMAZON_SECRET_ACCESS_KEY=your_secret_key_here
AMAZON_ASSOCIATE_TAG=dxm369-20
AMAZON_REGION=us-east-1
AMAZON_HOST=webservices.amazon.com

# DXM Revenue System
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20
DXM_APP_ENV=prod

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install Required Dependencies

```bash
# Install AWS SDK for API signing
pnpm add aws4 crypto-js

# Install additional utilities
pnpm add date-fns lodash
```

### 4. Test the Integration

```bash
# Start development server
pnpm dev

# Visit GPU page to see live data
open http://localhost:3000/gpus
```

## 🔧 API Implementation Status

### ✅ Completed Components

- **DXM Deal Card Component** - Product display with glass styling
- **Amazon Adapter Framework** - API integration structure
- **Caching System** - 15-minute cache with LRU eviction
- **Error Handling** - Graceful fallback to mock data
- **DXM Scoring Algorithm** - Intelligence scoring system

### 🔄 Next Steps (Implementation Required)

1. **AWS Signature Implementation**
   ```typescript
   // In amazonAdapter.ts - replace makeAmazonAPIRequest
   private async makeAmazonAPIRequest(operation: string, params: any) {
     const aws4 = require('aws4');
     // Implement AWS signature v4 signing
   }
   ```

2. **Real API Endpoints**
   - SearchItems operation
   - GetItems operation  
   - GetBrowseNodes operation

3. **Rate Limiting**
   - Implement request throttling
   - Handle API quotas gracefully

## 📊 DXM Intelligence Features

### DXM Value Score Algorithm

The adapter calculates intelligent scores based on:

- **Price-to-Performance (40%)** - Category-specific value analysis
- **Availability Bonus (10%)** - In stock + Prime eligible
- **Savings Bonus (15%)** - Discount percentage impact
- **Brand Reliability (20%)** - Premium brand recognition
- **Specifications Quality (30%)** - Category-specific spec scoring

### Category Mapping

```typescript
GPU: Graphics Cards, RTX, Radeon
CPU: Processors, Intel, AMD, Ryzen  
RAM: Memory, DDR4, DDR5
SSD: Solid State, NVMe, M.2
Motherboard: Mainboards, ASUS, MSI
PSU: Power Supplies, Modular
Monitor: Gaming Monitors, Displays
Laptop: Gaming Laptops, Notebooks
```

## 🛡️ Error Handling & Fallbacks

### Graceful Degradation

1. **API Failure** → Falls back to mock data
2. **Rate Limiting** → Uses cached results
3. **Invalid Products** → Filters out incomplete data
4. **Network Issues** → Shows cached + offline indicator

### Cache Strategy

- **Duration:** 15 minutes for product data
- **Size Limit:** 100 cached queries (LRU eviction)
- **Keys:** Category + search parameters
- **Invalidation:** Automatic expiration + manual refresh

## 🚀 Deployment Checklist

### Production Environment

```bash
# Set production environment variables
AMAZON_ACCESS_KEY_ID=prod_key
AMAZON_SECRET_ACCESS_KEY=prod_secret
AMAZON_ASSOCIATE_TAG=dxm369-20
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://dxm369.com
```

### Monitoring & Analytics

1. **API Usage Tracking**
   - Request counts per category
   - Cache hit/miss ratios
   - Error rates and types

2. **Performance Metrics**
   - Response times
   - Cache effectiveness
   - User engagement with deals

3. **Revenue Tracking**
   - Affiliate click-through rates
   - Conversion tracking
   - Revenue per category

## 🔍 Testing & Validation

### Local Testing

```bash
# Test GPU search
curl "http://localhost:3000/api/test-gpu-search"

# Test specific product
curl "http://localhost:3000/api/test-product/B08N5WRWNW"
```

### Production Validation

1. **API Connectivity** - Verify Amazon API responses
2. **Affiliate Links** - Test link generation and tracking
3. **Cache Performance** - Monitor cache hit rates
4. **Error Handling** - Test fallback scenarios

---

**Status:** Framework Complete - Ready for Amazon API Implementation  
**Next Step:** Implement AWS signature v4 signing in `makeAmazonAPIRequest`  
**Timeline:** 2-4 hours for full API integration
