#!/bin/bash
# Module Classification Script for PATCH 2
# Classifies files as Server | Client | Shared

set -e

echo "🔍 DXM369 Module Classification Scan"
echo "===================================="
echo ""

# Output files
CLIENT_FILE=".patch2-client-modules.txt"
SERVER_FILE=".patch2-server-modules.txt"
SHARED_FILE=".patch2-shared-modules.txt"
PROCESS_ENV_FILE=".patch2-process-env-usage.txt"
NODE_IMPORTS_FILE=".patch2-node-imports.txt"
BROWSER_APIS_FILE=".patch2-browser-apis.txt"

# Clean previous runs
rm -f "$CLIENT_FILE" "$SERVER_FILE" "$SHARED_FILE" "$PROCESS_ENV_FILE" "$NODE_IMPORTS_FILE" "$BROWSER_APIS_FILE"

echo "📋 Step 1: Identifying Client Modules..."
echo "----------------------------------------"

# Files with "use client"
rg '^"use client"' --files app src 2>/dev/null | sort | uniq > "$CLIENT_FILE" || true

# Files using browser APIs
rg 'window\.|document\.|localStorage|sessionStorage' --files app src 2>/dev/null | sort | uniq >> "$CLIENT_FILE" || true

# Remove duplicates
sort "$CLIENT_FILE" | uniq > "${CLIENT_FILE}.tmp" && mv "${CLIENT_FILE}.tmp" "$CLIENT_FILE"

CLIENT_COUNT=$(wc -l < "$CLIENT_FILE" | tr -d ' ')
echo "✅ Found $CLIENT_COUNT client module candidates"

echo ""
echo "📋 Step 2: Identifying Server Modules..."
echo "----------------------------------------"

# Files using Node APIs
rg 'from ["\']fs["\']|from ["\']path["\']|from ["\']crypto["\']|from ["\']@aws-sdk|from ["\']prisma|from ["\']pg["\']' --files app src 2>/dev/null | sort | uniq > "$SERVER_FILE" || true

# API routes (always server)
find app src -path "*/api/*/route.ts" -o -path "*/api/*/route.js" 2>/dev/null | sort | uniq >> "$SERVER_FILE" || true

# Files with "use server"
rg '^"use server"' --files app src 2>/dev/null | sort | uniq >> "$SERVER_FILE" || true

# Remove duplicates
sort "$SERVER_FILE" | uniq > "${SERVER_FILE}.tmp" && mv "${SERVER_FILE}.tmp" "$SERVER_FILE"

SERVER_COUNT=$(wc -l < "$SERVER_FILE" | tr -d ' ')
echo "✅ Found $SERVER_COUNT server module candidates"

echo ""
echo "📋 Step 3: Finding process.env Usage..."
echo "----------------------------------------"

rg 'process\.env' --files app src 2>/dev/null | sort | uniq > "$PROCESS_ENV_FILE" || true

PROCESS_ENV_COUNT=$(wc -l < "$PROCESS_ENV_FILE" | tr -d ' ')
echo "✅ Found $PROCESS_ENV_COUNT files using process.env"

echo ""
echo "📋 Step 4: Finding Node API Imports..."
echo "----------------------------------------"

rg 'from ["\']fs["\']|from ["\']path["\']|from ["\']crypto["\']|from ["\']stream["\']|from ["\']util["\']' --files app src 2>/dev/null | sort | uniq > "$NODE_IMPORTS_FILE" || true

NODE_IMPORTS_COUNT=$(wc -l < "$NODE_IMPORTS_FILE" | tr -d ' ')
echo "✅ Found $NODE_IMPORTS_COUNT files importing Node APIs"

echo ""
echo "📋 Step 5: Finding Browser API Usage..."
echo "----------------------------------------"

rg 'window\.|document\.|localStorage|sessionStorage|navigator\.' --files app src 2>/dev/null | sort | uniq > "$BROWSER_APIS_FILE" || true

BROWSER_APIS_COUNT=$(wc -l < "$BROWSER_APIS_FILE" | tr -d ' ')
echo "✅ Found $BROWSER_APIS_COUNT files using browser APIs"

echo ""
echo "===================================="
echo "📊 Summary"
echo "===================================="
echo "Client modules: $CLIENT_COUNT"
echo "Server modules: $SERVER_COUNT"
echo "Files using process.env: $PROCESS_ENV_COUNT"
echo "Files importing Node APIs: $NODE_IMPORTS_COUNT"
echo "Files using browser APIs: $BROWSER_APIS_COUNT"
echo ""
echo "✅ Classification files created:"
echo "  - $CLIENT_FILE"
echo "  - $SERVER_FILE"
echo "  - $PROCESS_ENV_FILE"
echo "  - $NODE_IMPORTS_FILE"
echo "  - $BROWSER_APIS_FILE"
echo ""

