#!/bin/bash

# DXM ASIN Sourcing Engine - Quick Setup Script
# Sets up Kaggle CLI and directory structure for ASIN sourcing

set -e

echo "🚀 DXM ASIN Sourcing Engine - Setup"
echo ""

# Check Python/pip
if ! command -v pip &> /dev/null; then
    echo "❌ pip not found. Install Python first."
    exit 1
fi

# Install Kaggle CLI
echo "📦 Installing Kaggle CLI..."
pip install kaggle --user

# Create config directory
echo "📁 Creating Kaggle config directory..."
mkdir -p ~/.config/kaggle

# Create data directories
echo "📁 Creating data directories..."
mkdir -p ~/Documents/DXM_ASIN_Sourcing/data
mkdir -p ~/Documents/DXM_ASIN_Sourcing/output

# Check if kaggle.json exists
if [ -f ~/.config/kaggle/kaggle.json ]; then
    echo "✅ Kaggle token found: ~/.config/kaggle/kaggle.json"
    chmod 600 ~/.config/kaggle/kaggle.json
    echo "✅ Permissions set to 600"
else
    echo "⚠️  Kaggle token not found!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://www.kaggle.com/settings"
    echo "2. Click 'Create New Token'"
    echo "3. Download kaggle.json"
    echo "4. Copy to: ~/.config/kaggle/kaggle.json"
    echo "5. Run: chmod 600 ~/.config/kaggle/kaggle.json"
    echo ""
fi

# Test Kaggle CLI
if command -v kaggle &> /dev/null; then
    echo "🧪 Testing Kaggle CLI..."
    if kaggle datasets list -s "electronics" 2>&1 | head -3 &> /dev/null; then
        echo "✅ Kaggle CLI working!"
    else
        echo "⚠️  Kaggle CLI installed but authentication may be missing"
    fi
else
    echo "⚠️  Kaggle CLI not in PATH (may need to add ~/.local/bin to PATH)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next: Run the sourcing engine:"
echo "  npx ts-node scripts/dxm-asin-sourcing-engine-v1.ts"
echo ""

