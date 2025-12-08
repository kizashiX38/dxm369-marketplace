#!/bin/bash
# Smoke Test Script for Admin Routes (Batch 1)
# Tests response format, error handling, and logging

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_SECRET="${ADMIN_SECRET:-test-secret}"

echo "🧪 DXM369 Admin Routes Smoke Test"
echo "=================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_route() {
  local method=$1
  local endpoint=$2
  local description=$3
  local expected_status=$4
  local data=$5
  local headers=$6
  
  echo -n "Testing: $description ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -H "$headers" "$BASE_URL$endpoint" 2>/dev/null || echo "000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "$headers" -d "$data" "$BASE_URL$endpoint" 2>/dev/null || echo "000")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # Check HTTP status
  if [ "$http_code" != "$expected_status" ]; then
    echo -e "${RED}FAIL${NC} (Expected $expected_status, got $http_code)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
    return 1
  fi
  
  # Check response format (must have 'ok' field)
  if ! echo "$body" | grep -q '"ok"'; then
    echo -e "${RED}FAIL${NC} (Missing 'ok' field in response)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
    return 1
  fi
  
  echo -e "${GREEN}PASS${NC}"
  PASSED=$((PASSED + 1))
  return 0
}

# Test 1: GET /api/admin/products/list (Success)
test_route "GET" "/api/admin/products/list" \
  "GET /api/admin/products/list (no auth - should work in dev)" \
  "200" "" ""

# Test 2: GET /api/admin/products/list?category=gpu
test_route "GET" "/api/admin/products/list?category=gpu" \
  "GET /api/admin/products/list?category=gpu" \
  "200" "" ""

# Test 3: GET /api/admin/env/validate (Success - dev mode)
test_route "GET" "/api/admin/env/validate" \
  "GET /api/admin/env/validate (dev mode)" \
  "200" "" ""

# Test 4: GET /api/admin/env/validate (Unauthorized - bad key)
test_route "GET" "/api/admin/env/validate" \
  "GET /api/admin/env/validate (bad admin key - should be 403 in prod)" \
  "200" "" "x-admin-key: invalid-key"

# Test 5: POST /api/admin/products/add (Bad Request - missing fields)
test_route "POST" "/api/admin/products/add" \
  "POST /api/admin/products/add (missing fields - 400)" \
  "400" '{}' ""

# Test 6: POST /api/admin/products/add (Bad Request - invalid ASIN)
test_route "POST" "/api/admin/products/add" \
  "POST /api/admin/products/add (invalid ASIN - 400)" \
  "400" '{"asin":"INVALID","category":"gpu"}' ""

# Test 7: GET /api/admin/analytics (Success)
test_route "GET" "/api/admin/analytics" \
  "GET /api/admin/analytics" \
  "200" "" "x-admin-key: $ADMIN_SECRET"

# Test 8: GET /api/admin/analytics (Unauthorized)
test_route "GET" "/api/admin/analytics" \
  "GET /api/admin/analytics (unauthorized - 403)" \
  "403" "" "x-admin-key: wrong-secret"

# Test 9: GET /api/admin/newsletter
test_route "GET" "/api/admin/newsletter" \
  "GET /api/admin/newsletter (unauthorized - 403)" \
  "403" "" "x-admin-key: wrong-secret"

# Test 10: GET /api/admin/earnings
test_route "GET" "/api/admin/earnings" \
  "GET /api/admin/earnings (unauthorized - 403)" \
  "403" "" "x-admin-key: wrong-secret"

echo ""
echo "=================================="
echo "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi

