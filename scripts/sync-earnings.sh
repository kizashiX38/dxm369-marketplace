#!/bin/bash
# DXM369 Earnings Sync Script
# Automated daily sync of Amazon Associates earnings data
# Usage: ./scripts/sync-earnings.sh [startDate] [endDate]

set -e

# Configuration
ADMIN_KEY="${ADMIN_SECRET:-your_admin_secret_here}"
API_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
TRACKING_IDS="${AMAZON_TRACKING_IDS:-dxm369-20}"

# Date range (defaults to yesterday to today)
if [ -z "$1" ]; then
  START_DATE=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)
else
  START_DATE="$1"
fi

if [ -z "$2" ]; then
  END_DATE=$(date +%Y-%m-%d)
else
  END_DATE="$2"
fi

# Convert comma-separated tracking IDs to JSON array
TRACKING_IDS_JSON=$(echo "$TRACKING_IDS" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | tr '\n' ',' | sed 's/,$//' | sed 's/^/[/;s/$/]/')

echo "🔄 DXM369 Earnings Sync"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API URL: $API_URL"
echo "Date Range: $START_DATE to $END_DATE"
echo "Tracking IDs: $TRACKING_IDS"
echo ""

# Make API request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/admin/earnings/sync" \
  -H "x-admin-key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"method\": \"api\",
    \"trackingIds\": $TRACKING_IDS_JSON,
    \"startDate\": \"$START_DATE\",
    \"endDate\": \"$END_DATE\"
  }")

# Extract HTTP status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Check response
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Sync successful!"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 0
else
  echo "❌ Sync failed (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 1
fi

