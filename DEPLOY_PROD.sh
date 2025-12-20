#!/bin/bash
# 🚀 DEPLOY TO PRODUCTION - Get Live on Vercel

set -e

echo "🚀 DEPLOYING DXM369 TO PRODUCTION"
echo "================================="
echo ""

# Build check
echo "🔨 Building for production..."
npm run build

if [[ $? -ne 0 ]]; then
    echo "❌ Build failed. Fix errors first."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "Your site is now live at:"
echo "https://dxm369-marketplace.vercel.app"
echo ""
echo "💰 Start earning immediately:"
echo "  - All affiliate links use dxm369-20"
echo "  - 106 products ready for traffic"
echo "  - Commission on every purchase"
echo ""
echo "📈 Next steps:"
echo "  1. Share your site URL"
echo "  2. Drive traffic to product pages"
echo "  3. Monitor Amazon affiliate dashboard"
echo "  4. Scale with more products"
