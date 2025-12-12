#!/bin/bash
# DXM369 Full Stack Startup Script
# Starts both Next.js marketplace and Python ASIN bridge server

set -e

echo "🚀 DXM369 Full Stack Startup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3 first.${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BRIDGE_DIR="$SCRIPT_DIR/../../DXM_ASIN_Console"

echo -e "${YELLOW}1. Starting Python ASIN Bridge Server...${NC}"
cd "$BRIDGE_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}   Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and start bridge
source venv/bin/activate
python3 asin_bridge_server.py > asin_bridge.log 2>&1 &
BRIDGE_PID=$!

echo -e "${GREEN}   ✅ Bridge server started (PID: $BRIDGE_PID)${NC}"

# Wait for bridge to be ready
echo "   Waiting for bridge to be ready..."
sleep 2

# Check if bridge is responsive
BRIDGE_HEALTH=$(curl -s http://localhost:5000/health || echo "error")
if [[ $BRIDGE_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}   ✅ Bridge server is responsive${NC}"
else
    echo -e "${YELLOW}   ⚠️  Bridge server may not be ready yet (will retry in marketplace)${NC}"
fi

echo ""
echo -e "${YELLOW}2. Starting Next.js Marketplace...${NC}"
cd "$SCRIPT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Installing dependencies...${NC}"
    npm install
fi

# Start Next.js dev server in background
npm run dev > nextjs.log 2>&1 &
NEXTJS_PID=$!

echo -e "${GREEN}   ✅ Next.js server started (PID: $NEXTJS_PID)${NC}"

# Wait for Next.js to be ready
echo "   Waiting for marketplace to be ready..."
sleep 5

# Check if marketplace is responsive
MARKETPLACE_HEALTH=$(curl -s http://localhost:3000/api/health || echo "error")
if [[ $MARKETPLACE_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}   ✅ Marketplace is responsive${NC}"
else
    echo -e "${YELLOW}   ⚠️  Marketplace may not be ready yet, check nextjs.log${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ DXM369 Full Stack Ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "URLs:"
echo -e "  📱 Marketplace:      ${GREEN}http://localhost:3000${NC}"
echo -e "  🔧 Admin Dashboard:  ${GREEN}http://localhost:3000/admin${NC}"
echo -e "  ⚙️  ASIN Manager:      ${GREEN}http://localhost:3000/admin/asin-manager${NC}"
echo -e "  🌉 Bridge API:       ${GREEN}http://localhost:5000${NC}"
echo ""
echo "Quick Tests:"
echo "  curl http://localhost:3000/api/health"
echo "  curl http://localhost:5000/health"
echo "  curl \"http://localhost:5000/api/amazon/items?asins=B0BJQRXJZD\""
echo ""
echo "Logs:"
echo "  Marketplace: $SCRIPT_DIR/nextjs.log"
echo "  Bridge:      $BRIDGE_DIR/asin_bridge.log"
echo ""
echo "To stop all services:"
echo "  kill $NEXTJS_PID  # Next.js"
echo "  kill $BRIDGE_PID  # Bridge server"
echo ""
echo "Or run: ./stop-full-stack.sh"

# Save PIDs for stopping later
echo $NEXTJS_PID > .nextjs.pid
echo $BRIDGE_PID > .bridge.pid

# Keep script running so services don't stop
wait
