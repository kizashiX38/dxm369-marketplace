#!/bin/bash

# DXM ASIN Sourcing Engine - Complete Execution Pipeline
# Orchestrates all phases of the multi-source ETL pipeline
# Usage: bash scripts/dxm-full-pipeline.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$HOME/Documents/DXM_ASIN_Sourcing/data"
OUTPUT_DIR="/tmp/dxm-asin-engine"
API_ENDPOINT="http://localhost:3002/api/admin/products/bulkImport"
ADMIN_SECRET="${ADMIN_SECRET:-ak3693}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    DXM ASIN SOURCING ENGINE - FULL PIPELINE                 ║${NC}"
echo -e "${BLUE}║    Multi-Source ETL → Bulk Ingestion → Marketplace Scale   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ===== PHASE 0: PREREQUISITES =====

echo -e "${YELLOW}🔍 PHASE 0: VERIFYING PREREQUISITES${NC}"
echo ""

# Check Kaggle config
if [ ! -f "$HOME/.kaggle/kaggle.json" ]; then
    echo -e "${RED}❌ CRITICAL: Kaggle not configured${NC}"
    echo "   Run: https://www.kaggle.com/account → Generate API Token"
    exit 1
fi
echo -e "${GREEN}✓${NC} Kaggle configured"

# Check data directory
if [ ! -d "$DATA_DIR" ]; then
    echo -e "${RED}❌ Data directory not found: $DATA_DIR${NC}"
    echo "   Create with: mkdir -p $DATA_DIR"
    exit 1
fi
echo -e "${GREEN}✓${NC} Data directory exists"

# Check for datasets
if [ ! -f "$DATA_DIR"/*electronics*.csv ] && [ ! -f "$DATA_DIR"/*amazon*.csv ]; then
    echo -e "${YELLOW}⚠️  WARNING: No datasets found in $DATA_DIR${NC}"
    echo "   Download with:"
    echo "   kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items -p $DATA_DIR"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check dev server
echo -n "Checking dev server at $API_ENDPOINT... "
if curl -s -o /dev/null -w "%{http_code}" "$API_ENDPOINT" | grep -q "405\|403\|401"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠️  Server may not be running${NC}"
    echo "Start with: npm run dev"
fi

echo ""
echo -e "${GREEN}✅ Prerequisites verified${NC}"
echo ""

# ===== PHASE 1: RUN PREREQUISITE CHECKER =====

echo -e "${YELLOW}🧪 PHASE 1: RUNNING DIAGNOSTIC CHECKS${NC}"
echo ""

if command -v npx &> /dev/null; then
    npx ts-node "$PROJECT_ROOT/scripts/dxm-prereq-check.ts" || {
        echo -e "${RED}❌ Prerequisite check failed${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}⚠️  npx not found, skipping detailed checks${NC}"
fi

echo ""

# ===== PHASE 2: RUN SOURCING ENGINE =====

echo -e "${YELLOW}📦 PHASE 2: RUNNING ASIN SOURCING ENGINE${NC}"
echo ""

if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
    echo -e "${GREEN}✓${NC} Created output directory: $OUTPUT_DIR"
fi

echo "Executing: npx ts-node $PROJECT_ROOT/scripts/dxm-asin-sourcing-engine.ts"
echo ""

ADMIN_SECRET="$ADMIN_SECRET" npx ts-node "$PROJECT_ROOT/scripts/dxm-asin-sourcing-engine.ts" || {
    echo ""
    echo -e "${RED}❌ Sourcing engine failed${NC}"
    exit 1
}

echo ""

# ===== PHASE 3: VERIFY OUTPUT =====

echo -e "${YELLOW}🔍 PHASE 3: VERIFYING OUTPUT${NC}"
echo ""

PAYLOAD_FILE="$OUTPUT_DIR/dxm_clean_products.json"

if [ ! -f "$PAYLOAD_FILE" ]; then
    echo -e "${RED}❌ Output payload not found: $PAYLOAD_FILE${NC}"
    exit 1
fi

PRODUCT_COUNT=$(jq '.products | length' "$PAYLOAD_FILE" 2>/dev/null || echo "0")
echo -e "${GREEN}✓${NC} Payload generated with ${BLUE}$PRODUCT_COUNT${NC} products"

# Count by category
echo ""
echo "Category breakdown:"
jq '.products | group_by(.category) | map({category: .[0].category, count: length})' "$PAYLOAD_FILE" 2>/dev/null || true

echo ""
echo "File size: $(du -h "$PAYLOAD_FILE" | cut -f1)"

echo ""

# ===== PHASE 4: BULK INGESTION =====

read -p "Ready to ingest to marketplace? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping ingestion. Resume later with:"
    echo "curl -X POST $API_ENDPOINT \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -H \"x-admin-key: $ADMIN_SECRET\" \\"
    echo "  --data @$PAYLOAD_FILE"
    exit 0
fi

echo -e "${YELLOW}🚀 PHASE 4: BULK INGESTION TO MARKETPLACE${NC}"
echo ""
echo "Endpoint: $API_ENDPOINT"
echo "Ingesting $PRODUCT_COUNT products..."
echo ""

INGEST_START=$(date +%s)

curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "x-admin-key: $ADMIN_SECRET" \
    --data "@$PAYLOAD_FILE" > "$OUTPUT_DIR/ingest-response.json"

INGEST_END=$(date +%s)
INGEST_DURATION=$((INGEST_END - INGEST_START))

echo -e "${GREEN}✓${NC} Ingestion completed in ${BLUE}${INGEST_DURATION}s${NC}"
echo ""

# ===== PHASE 5: ANALYZE RESULTS =====

echo -e "${YELLOW}📊 PHASE 5: ANALYZING RESULTS${NC}"
echo ""

if command -v jq &> /dev/null; then
    RESPONSE=$(cat "$OUTPUT_DIR/ingest-response.json")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.data.success // .success // 0')
    FAILED=$(echo "$RESPONSE" | jq -r '.data.failed // .failed // 0')

    echo "Results:"
    echo -e "  ${GREEN}✓ Success: $SUCCESS${NC}"
    echo -e "  ${RED}✗ Failed: $FAILED${NC}"
    echo "  Response saved: $OUTPUT_DIR/ingest-response.json"

    if [ "$SUCCESS" -gt 0 ]; then
        echo ""
        echo -e "${GREEN}✅ INGESTION SUCCESSFUL${NC}"
        echo "Marketplace expanded by ${BLUE}$SUCCESS${NC} products"
    fi

    if [ "$FAILED" -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  $FAILED products failed validation${NC}"
        echo "Check: $OUTPUT_DIR/ingest-response.json for details"
    fi
else
    echo "Response saved to: $OUTPUT_DIR/ingest-response.json"
    cat "$OUTPUT_DIR/ingest-response.json" | head -20
fi

echo ""

# ===== PHASE 6: VERIFY MARKETPLACE =====

echo -e "${YELLOW}✨ PHASE 6: MARKETPLACE VERIFICATION${NC}"
echo ""

echo "Verification endpoints:"
echo "  GPU products:  curl 'http://localhost:3002/api/dxm/products/gpu?limit=5'"
echo "  CPU products:  curl 'http://localhost:3002/api/dxm/products/cpu?limit=5'"
echo "  All products:  curl 'http://localhost:3002/api/dxm/products/marketplace/all?limit=10'"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ ✅ PIPELINE COMPLETE                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Review results in: $OUTPUT_DIR/ingest-response.json"
echo "  2. Verify marketplace: npm run dev → http://localhost:3002"
echo "  3. Deploy: npm run build && vercel --prod"
echo ""
