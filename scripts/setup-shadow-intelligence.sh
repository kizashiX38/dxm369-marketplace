#!/bin/bash
# setup-shadow-intelligence.sh
# DXMatrix Shadow Intelligence Setup Script

set -e

echo "🕵️  DXMatrix Shadow Intelligence Setup"
echo "======================================="
echo ""

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if Playwright is installed
if [ ! -d "node_modules/playwright" ]; then
    echo "📦 Installing Playwright..."
    npm install playwright@1.42.0
else
    echo "✅ Playwright already installed"
fi

# Install Chromium browser
echo "🌐 Installing Chromium browser..."
npx playwright install chromium

# Check if database exists
DB_NAME="dxm369"
DB_USER="postgres"

echo ""
read -p "Enter PostgreSQL database name (default: $DB_NAME): " input_db
DB_NAME=${input_db:-$DB_NAME}

read -p "Enter PostgreSQL username (default: $DB_USER): " input_user
DB_USER=${input_user:-$DB_USER}

echo ""
echo "🗄️  Setting up Shadow Intelligence database schema..."

# Run schema migration
if psql -U "$DB_USER" -d "$DB_NAME" -f database/shadow-intelligence-schema.sql; then
    echo "✅ Database schema created successfully"
else
    echo "⚠️  Database schema creation failed (may already exist)"
fi

echo ""
echo "✨ Shadow Intelligence setup complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000/admin/asin-manager"
echo "3. Enter ASINs in the Fetch tab"
echo "4. Click 'Fetch ASINs' to start scraping"
echo ""
echo "📖 Documentation: SHADOW_INTELLIGENCE.md"
echo ""
