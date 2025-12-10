#!/bin/bash

# DXM Kaggle Token Configuration - SECURE SETUP
# Sets up Kaggle API token securely using environment variable method

set -e

echo "🔐 DXM Kaggle Token Configuration"
echo ""
echo "⚠️  SECURITY WARNING: Never paste tokens in chat or commit to git!"
echo ""

# Check if token is provided as argument
if [ -z "$1" ]; then
    echo "Usage: ./scripts/configure-kaggle-token.sh <KAGGLE_API_TOKEN>"
    echo ""
    echo "Or set it manually:"
    echo "  export KAGGLE_API_TOKEN=your_token_here"
    echo "  echo 'export KAGGLE_API_TOKEN=your_token_here' >> ~/.bashrc"
    echo ""
    exit 1
fi

TOKEN=$1

# Validate token format (starts with KGAT_)
if [[ ! $TOKEN =~ ^KGAT_ ]]; then
    echo "❌ Invalid token format. Kaggle tokens start with 'KGAT_'"
    exit 1
fi

# Method 1: Add to .env.local (recommended for project)
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    # Remove old token if exists
    sed -i '/^KAGGLE_API_TOKEN=/d' "$ENV_FILE"
    # Add new token
    echo "KAGGLE_API_TOKEN=$TOKEN" >> "$ENV_FILE"
    echo "✅ Added to $ENV_FILE"
else
    echo "KAGGLE_API_TOKEN=$TOKEN" > "$ENV_FILE"
    echo "✅ Created $ENV_FILE with token"
fi

# Method 2: Add to shell profile (for global use)
SHELL_RC=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.config/fish/config.fish" ]; then
    SHELL_RC="$HOME/.config/fish/config.fish"
fi

if [ -n "$SHELL_RC" ]; then
    # Remove old token if exists
    if [ -f "$SHELL_RC" ]; then
        sed -i '/^export KAGGLE_API_TOKEN=/d' "$SHELL_RC"
    fi
    
    # Add new token
    echo "" >> "$SHELL_RC"
    echo "# Kaggle API Token (added by DXM setup)" >> "$SHELL_RC"
    echo "export KAGGLE_API_TOKEN=$TOKEN" >> "$SHELL_RC"
    echo "✅ Added to $SHELL_RC"
    
    echo ""
    echo "📝 To use immediately, run:"
    echo "  source $SHELL_RC"
    echo "  OR"
    echo "  export KAGGLE_API_TOKEN=$TOKEN"
fi

# Verify .env.local is in .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.env\.local$" .gitignore; then
        echo ".env.local" >> .gitignore
        echo "✅ Added .env.local to .gitignore"
    fi
else
    echo ".env.local" > .gitignore
    echo "✅ Created .gitignore with .env.local"
fi

echo ""
echo "✅ Token configured securely!"
echo ""
echo "🧪 Test it:"
echo "  export KAGGLE_API_TOKEN=$TOKEN"
echo "  kaggle datasets list -s 'electronics' | head -5"
echo ""
echo "⚠️  REMEMBER:"
echo "  - Never paste tokens in chat"
echo "  - Never commit .env.local to git"
echo "  - Rotate token if exposed"
echo ""

