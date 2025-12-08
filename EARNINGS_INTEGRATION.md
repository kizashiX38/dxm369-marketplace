# DXM369 Earnings Integration Guide

**Complete Amazon Associates earnings tracking system for DXM369 Marketplace.**

---

## 🎯 Overview

This earnings integration system allows you to:

- ✅ Track **real Amazon Associates earnings** (not just PAAPI product data)
- ✅ Monitor **commission rates** and **revenue per tracking ID**
- ✅ View **daily/weekly/monthly earnings trends**
- ✅ Analyze **conversion rates** and **EPC (earnings per click)**
- ✅ Sync earnings data via **API, CSV, or manual entry**

---

## 🗄️ Database Schema

The earnings system uses two new tables:

### `earnings_reports`
Stores daily/weekly/monthly earnings data per tracking ID.

**Key Fields:**
- `tracking_id` - Your Amazon Associates tag (e.g., `dxm369-20`)
- `report_date` - Date of the earnings report
- `clicks` - Total affiliate clicks
- `ordered_items` - Items ordered (conversions)
- `shipped_items` - Items shipped (confirmed)
- `returned_items` - Items returned/cancelled
- `revenue` - Total revenue in USD
- `commission` - Commission earned in USD
- `epc` - Earnings per click (calculated)
- `conversion_rate` - Conversion rate (calculated)

### `earnings_sync_log`
Tracks sync operations for audit and debugging.

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

```bash
# Connect to your PostgreSQL database
psql -U your_user -d dxm369_production

# Run the schema update
\i database/schema-v2.sql
```

Or apply just the earnings tables:

```sql
-- Copy the earnings_reports and earnings_sync_log table definitions
-- from database/schema-v2.sql (lines 312-350)
```

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
# Amazon Associates Earnings Configuration
# Option A: Session Cookies (for dashboard scraping)
AMAZON_SESSION_COOKIES=session-id=xxx;ubid-main=xxx;session-token=xxx
# OR
AMAZON_SESSION_ID=your_session_id
AMAZON_UBID_MAIN=your_ubid_main

# Option B: Tracking IDs (for manual/CSV sync)
AMAZON_TRACKING_IDS=dxm369-20,dxmatrix-20,dxmatrixus-20

# Admin API Key (required for earnings endpoints)
ADMIN_SECRET=your_secure_admin_secret_here
NEXT_PUBLIC_ADMIN_KEY=your_secure_admin_secret_here

# Amazon Associate Tag (default)
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20
```

### Step 3: Access the Earnings Dashboard

1. Navigate to `/admin/earnings`
2. Use your admin key in the request headers: `x-admin-key: your_secret`

---

## 📊 API Endpoints

### GET `/api/admin/earnings`

Get earnings statistics and charts data.

**Query Parameters:**
- `metric` - `overview` | `stats` | `by-tracking` | `trend` | `sync-status`
- `startDate` - Start date (YYYY-MM-DD), defaults to 30 days ago
- `endDate` - End date (YYYY-MM-DD), defaults to today
- `trackingId` - Optional: filter by specific tracking ID

**Example:**
```bash
curl -H "x-admin-key: your_secret" \
  "http://localhost:3000/api/admin/earnings?metric=overview&startDate=2025-11-01&endDate=2025-12-06"
```

### POST `/api/admin/earnings/sync`

Sync earnings data into the database.

**Methods:**

#### 1. CSV Upload
```json
{
  "method": "csv",
  "csvData": "Date,Tracking ID,Clicks,Ordered,Shipped,Returned,Revenue,Commission\n2025-12-01,dxm369-20,150,3,2,0,450.00,13.50"
}
```

#### 2. API Fetch (requires session cookies)
```json
{
  "method": "api",
  "trackingIds": ["dxm369-20", "dxmatrix-20"],
  "startDate": "2025-11-01",
  "endDate": "2025-12-06"
}
```

#### 3. Manual Entry
```json
{
  "method": "manual",
  "reports": [
    {
      "tracking_id": "dxm369-20",
      "report_date": "2025-12-06",
      "clicks": 150,
      "ordered_items": 3,
      "shipped_items": 2,
      "returned_items": 0,
      "revenue": 450.00,
      "commission": 13.50,
      "report_type": "daily"
    }
  ]
}
```

---

## 🔄 Automated Sync (Cron Job)

### Option 1: Vercel Cron (Recommended)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/admin/earnings/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Option 2: External Cron Service

Use a service like **cron-job.org** or **EasyCron** to call:

```
POST https://dxm369.com/api/admin/earnings/sync
Headers:
  x-admin-key: your_secret
Body:
  {
    "method": "api",
    "trackingIds": ["dxm369-20"],
    "startDate": "2025-12-05",
    "endDate": "2025-12-06"
  }
```

### Option 3: Local Cron Script

Create `scripts/sync-earnings.sh`:

```bash
#!/bin/bash
ADMIN_KEY="your_secret"
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
TODAY=$(date +%Y-%m-%d)

curl -X POST "http://localhost:3000/api/admin/earnings/sync" \
  -H "x-admin-key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"method\": \"api\",
    \"trackingIds\": [\"dxm369-20\"],
    \"startDate\": \"$YESTERDAY\",
    \"endDate\": \"$TODAY\"
  }"
```

Make it executable:
```bash
chmod +x scripts/sync-earnings.sh
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/scripts/sync-earnings.sh
```

---

## 🔐 Getting Amazon Session Cookies

### Method 1: Browser DevTools

1. Log into [Amazon Associates Dashboard](https://affiliate-program.amazon.com/home)
2. Open DevTools (F12)
3. Go to **Application** → **Cookies** → `affiliate-program.amazon.com`
4. Copy these cookies:
   - `session-id`
   - `ubid-main`
   - `session-token` (if available)

5. Add to `.env.local`:
```bash
AMAZON_SESSION_COOKIES=session-id=xxx;ubid-main=xxx;session-token=xxx
```

### Method 2: Export from Browser Extension

Use a cookie export extension to get all cookies, then extract the needed ones.

### Method 3: Manual CSV Download

1. Go to [Amazon Associates Reports](https://affiliate-program.amazon.com/home/reports)
2. Download earnings CSV
3. Use the CSV sync method in the API

---

## 📈 Dashboard Features

### Earnings Overview
- Total Revenue
- Total Commission
- Total Clicks
- Conversion Rate
- Ordered/Shipped/Returned Items

### Daily Earnings Trend
- Line chart showing revenue and commission over time
- Interactive tooltips with detailed metrics

### Earnings by Tracking ID
- Breakdown of earnings per affiliate tag
- EPC (earnings per click) comparison
- Conversion rate analysis

### Sync Status
- Last sync timestamp
- Sync success/failure status
- Records synced count
- Manual sync button

---

## 🚨 Important Notes

### ⚠️ Amazon Associates API Limitations

**Amazon does NOT provide a public earnings API.** This system uses:

1. **Cookie-based scraping** (requires your session cookies)
2. **CSV import** (manual download from dashboard)
3. **Manual entry** (for testing or backup)

### 🔒 Security

- **Never commit** `.env.local` with real cookies
- **Rotate** session cookies periodically (they expire)
- **Use** secure admin keys (generate with `openssl rand -hex 32`)

### 📊 Data Accuracy

- Earnings data is **delayed** (typically 24-48 hours)
- **Shipped items** may differ from **ordered items** (cancellations)
- **Returns** are tracked separately and reduce commission

---

## 🐛 Troubleshooting

### "Database not configured"
- Set `DATABASE_URL` in `.env.local`
- Verify PostgreSQL connection

### "Amazon session cookies not configured"
- Add `AMAZON_SESSION_COOKIES` or `AMAZON_SESSION_ID` to `.env.local`
- Or use CSV/manual sync methods instead

### "No earnings data available"
- Run a manual sync first
- Check that tracking IDs match your Amazon Associates tags
- Verify date ranges include days with actual earnings

### Sync fails silently
- Check browser console for errors
- Verify `ADMIN_SECRET` matches in API calls
- Check database connection and table existence

---

## 📚 Next Steps

1. **Set up automated daily sync** (cron job)
2. **Configure tracking IDs** for all your affiliate tags
3. **Monitor earnings dashboard** regularly
4. **Export reports** for tax/accounting purposes
5. **Integrate with analytics** (connect to your main dashboard)

---

## 🎯 Support

For issues or questions:
- Check database logs: `SELECT * FROM earnings_sync_log ORDER BY started_at DESC;`
- Review API responses in browser DevTools Network tab
- Verify environment variables are loaded correctly

---

**Built for DXM369 Marketplace - Turning clicks into cash. 💰**

