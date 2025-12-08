#!/bin/bash
# DXM369 Operational Validation Script
# Validates environment, database, and API endpoints

set -e

echo "🚀 DXM369 Operational Validation"
echo "════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"
INFO="${BLUE}ℹ${NC}"

ERRORS=0

# Check if .env.local exists
echo "1. Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "   ${PASS} .env.local exists"
else
    echo "   ${FAIL} .env.local not found"
    echo "      ${INFO} Copy .env.local.example to .env.local and fill in values"
    ERRORS=$((ERRORS + 1))
fi

# Check required env vars (if .env.local exists)
if [ -f ".env.local" ]; then
    source .env.local 2>/dev/null || true
    
    required_vars=(
        "AMAZON_ACCESS_KEY_ID"
        "AMAZON_SECRET_ACCESS_KEY"
        "AMAZON_ASSOCIATE_TAG"
        "DATABASE_URL"
        "NEXT_PUBLIC_SITE_URL"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "   ${PASS} All required environment variables set"
    else
        echo "   ${WARN} Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "      - $var"
        done
    fi
fi

echo ""
echo "2. Checking database connectivity..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ] && [ -f ".env.local" ]; then
    source .env.local 2>/dev/null || true
fi

if [ -z "$DATABASE_URL" ]; then
    echo "   ${WARN} DATABASE_URL not set - skipping database checks"
else
    # Test PostgreSQL connection
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            echo "   ${PASS} PostgreSQL connection successful"
            
            # Check if tables exist
            tables=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
            if [ "$tables" -gt 0 ]; then
                echo "   ${PASS} Database contains $tables tables"
            else
                echo "   ${WARN} Database is empty - run database/schema-v2.sql"
            fi
            
            # Check for newsletter_subscribers table
            if psql "$DATABASE_URL" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscribers';" > /dev/null 2>&1; then
                echo "   ${PASS} newsletter_subscribers table exists"
            else
                echo "   ${WARN} newsletter_subscribers table missing"
            fi
        else
            echo "   ${FAIL} PostgreSQL connection failed"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "   ${WARN} psql not found - cannot test database connection"
    fi
fi

echo ""
echo "3. Checking Node.js dependencies..."
if [ -d "node_modules" ]; then
    echo "   ${PASS} node_modules exists"
    
    # Check for pg package
    if [ -d "node_modules/pg" ]; then
        echo "   ${PASS} pg package installed"
    else
        echo "   ${FAIL} pg package not found - run: npm install"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   ${FAIL} node_modules not found - run: npm install"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "4. Checking build artifacts..."
if [ -d ".next" ]; then
    echo "   ${PASS} .next directory exists (project has been built)"
else
    echo "   ${INFO} .next directory not found - run: npm run build"
fi

echo ""
echo "5. Testing API health endpoint..."
if [ -d ".next" ]; then
    # Start dev server in background if not running
    PORT=${PORT:-3000}
    HEALTH_URL="http://localhost:$PORT/api/health"
    
    # Try to curl the health endpoint (if server is running)
    if curl -s "$HEALTH_URL" > /dev/null 2>&1; then
        health_response=$(curl -s "$HEALTH_URL")
        if echo "$health_response" | grep -q '"status"'; then
            echo "   ${PASS} Health endpoint responding"
            echo "$health_response" | jq '.' 2>/dev/null || echo "$health_response"
        else
            echo "   ${WARN} Health endpoint returned unexpected response"
        fi
    else
        echo "   ${INFO} Dev server not running - start with: npm run dev"
        echo "   ${INFO} Then test manually: curl http://localhost:$PORT/api/health"
    fi
else
    echo "   ${INFO} Build required before testing API"
fi

echo ""
echo "════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo "${GREEN}✓ Validation complete - No critical errors${NC}"
    exit 0
else
    echo "${RED}✗ Validation complete - $ERRORS critical error(s) found${NC}"
    exit 1
fi

