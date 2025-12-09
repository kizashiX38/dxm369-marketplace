#!/bin/bash
# DXM369 Post-Deploy Route Verification
# Run after Vercel deployment to verify critical routes return 200

set -e

BASE_URL="${1:-https://dxm369.com}"
FAILED=0

# Critical routes to verify
ROUTES=(
  "/"
  "/gpus"
  "/cpus"
  "/laptops"
  "/monitors"
  "/keyboards"
  "/drops"
  "/new"
  "/bestsellers"
  "/deals"
  "/api/health"
)

echo "=== DXM369 Post-Deploy Route Check ==="
echo "Base URL: $BASE_URL"
echo ""

for route in "${ROUTES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  if [ "$code" = "200" ]; then
    echo "[OK] $route ($code)"
  else
    echo "[FAIL] $route ($code)"
    FAILED=1
  fi
done

echo ""
if [ "$FAILED" -eq 1 ]; then
  echo "ERROR: One or more routes failed verification!"
  exit 1
else
  echo "SUCCESS: All routes verified!"
  exit 0
fi
