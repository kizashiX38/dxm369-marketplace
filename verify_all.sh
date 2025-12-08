#!/bin/bash
ASINS=$(jq -r '.products.gpu[].asin, .products.cpu[].asin' data/asin-seed.json)
for asin in $ASINS; do
    URL="https://www.amazon.com/dp/$asin"
    STATUS=$(curl -s -o /dev/null -w '%{http_code}' --user-agent 'Mozilla/5.0' "$URL")
    if [ "$STATUS" -eq 200 ]; then
        echo "✅ $asin - OK"
    else
        echo "❌ $asin - FAILED (Status: $STATUS)"
    fi
done
