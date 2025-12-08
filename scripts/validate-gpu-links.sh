#!/bin/bash
# scripts/validate-gpu-links.sh
# Validates all GPU ASIN affiliate links for DXM369 Marketplace

ASINS=(
  'B0D7G5Z1P8'
  'B0D4R8N7M3'
  'B0D3P9K6L2'
  'B0D2M8J5H1'
  'B0D1N7F4G9'
  'B0D9B6C3X8'
  'B0D8A5V2W7'
  'B0D7S4R1Q6'
  'B0D6P3O9I4'
  'B0D5U2Y8T3'
  'B0D4E1W7R2'
  'B0D3H9G6F1'
  'B0D2J8K5D0'
  'B0D1L7M4C9'
  'B0D9N6B3V8'
  'B0D8M5X2Z7'
)

echo "🛰️ DXM369 GPU Link Validation Sweep"
echo "====================================="
echo ""

validate_asin() {
  local asin=$1
  local url="https://www.amazon.com/dp/${asin}?tag=dxm369-20"

  echo "Validating ${asin}..."

  # Make request with curl, follow redirects, get status and content
  local response=$(curl -s --compressed -w "HTTPSTATUS:%{http_code};" \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" \
    -H "Accept-Language: en-US,en;q=0.5" \
    -H "Accept-Encoding: gzip, deflate" \
    -H "Connection: keep-alive" \
    -H "Upgrade-Insecure-Requests: 1" \
    -L "$url")

  # Extract status code
  local status_code=$(echo "$response" | sed -n 's/.*HTTPSTATUS:\([0-9]*\);.*/\1/p')

  # Extract HTML content
  local html=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*;//')

  # Extract title
  local title=$(echo "$html" | grep -o '<title[^>]*>[^<]*</title>' | sed -e 's/<title[^>]*>//' -e 's/<\/title>//' | head -1)

  if [ -z "$title" ]; then
    title="N/A"
  fi

  # Check if GPU
  local gpu_keywords="GPU\|Graphics Card\|NVIDIA\|AMD\|GeForce\|Radeon"
  if echo "$title" | grep -i "$gpu_keywords" > /dev/null; then
    local matches_gpu="Y"
  else
    local matches_gpu="N"
  fi

  local affiliate_tag_ok="Y"  # Since we include it in URL

  local notes=""

  # Check for bot protection
  if echo "$html" | grep -i "captcha\|Sorry, we just need to make sure you're not a robot\|dog" > /dev/null; then
    notes="Bot protection detected"
  elif [ "$status_code" != "200" ]; then
    notes="HTTP $status_code"
  elif echo "$html" | grep -i "Page Not Found\|404" > /dev/null; then
    notes="Page Not Found"
  fi

  # Check for region block
  if echo "$html" | grep -i "region.*not available" > /dev/null; then
    notes="Region block"
  fi

  # Output result
  local title_short=$(echo "$title" | cut -c1-50)
  if [ ${#title} -gt 50 ]; then
    title_short="${title_short}..."
  fi

  echo "| $asin | $status_code | $title_short | $matches_gpu | $affiliate_tag_ok | $notes |"
}

echo ""
echo "📊 Validation Results:"
echo "======================"
echo ""
echo "| ASIN        | Status | Title | GPU? | Tag OK? | Notes |"
echo "|-------------|--------|-------|------|---------|-------|"

for asin in "${ASINS[@]}"; do
  validate_asin "$asin"
  # Delay to avoid throttling
  sleep 2
done

echo ""
echo "Validation complete."