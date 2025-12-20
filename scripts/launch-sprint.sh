#!/bin/bash
# DXM369 Sprint Launcher - Comprehensive execution with monitoring
# Performs pre-flight checks and launches sprint with full debug monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                        DXM369 SPRINT LAUNCHER v1.0                          ║
║                     Full Debug Monitoring & Execution                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Pre-flight checks
log "🔍 Starting pre-flight checks..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    error "❌ package.json not found. Please run from project root."
    exit 1
fi

if [[ ! -f "src/app/layout.tsx" ]]; then
    error "❌ Next.js app structure not found. Please run from DXM369 project root."
    exit 1
fi

success "✅ Project structure validated"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    error "❌ Node.js 18+ required. Current version: $(node --version)"
    exit 1
fi

success "✅ Node.js version: $(node --version)"

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    warn "⚠️  tsx not found globally. Installing locally..."
    npm install -g tsx || {
        error "❌ Failed to install tsx. Please install manually: npm install -g tsx"
        exit 1
    }
fi

success "✅ tsx available"

# Check if server is running
log "🔍 Checking if development server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    success "✅ Development server is running on port 3000"
else {
    warn "⚠️  Development server not running. Starting..."
    
    # Kill any existing processes
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # Start server in background
    log "🚀 Starting development server..."
    nohup npm run dev > dev-server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    log "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            success "✅ Development server started (PID: $SERVER_PID)"
            break
        fi
        sleep 2
        if [[ $i -eq 30 ]]; then
            error "❌ Server failed to start within 60 seconds"
            exit 1
        fi
    done
}
fi

# Check environment file
if [[ ! -f ".env.local" ]]; then
    warn "⚠️  .env.local not found. Creating from template..."
    if [[ -f ".env.local.example" ]]; then
        cp .env.local.example .env.local
        warn "⚠️  Please edit .env.local with your actual values before running sprint"
    else
        error "❌ .env.local.example not found"
        exit 1
    fi
fi

success "✅ Environment file exists"

# Check dependencies
log "🔍 Checking dependencies..."
if [[ ! -d "node_modules" ]]; then
    warn "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

success "✅ Dependencies ready"

# Create monitoring setup
log "🔧 Setting up monitoring..."

# Create logs directory
mkdir -p logs

# Function to start monitoring in background
start_monitoring() {
    log "📊 Starting sprint monitor..."
    tsx scripts/sprint-monitor.ts watch > logs/monitor.log 2>&1 &
    MONITOR_PID=$!
    echo $MONITOR_PID > logs/monitor.pid
    success "✅ Monitor started (PID: $MONITOR_PID)"
}

# Function to cleanup on exit
cleanup() {
    log "🧹 Cleaning up..."
    
    # Kill monitor if running
    if [[ -f logs/monitor.pid ]]; then
        MONITOR_PID=$(cat logs/monitor.pid)
        kill $MONITOR_PID 2>/dev/null || true
        rm -f logs/monitor.pid
    fi
    
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    log "👋 Sprint launcher cleanup complete"
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Ask user for confirmation
echo
log "🎯 Ready to launch DXM369 Code Sprint!"
echo
echo -e "${YELLOW}This will execute the following blocks:${NC}"
echo "  • Block A: Emergency Triage (foundation)"
echo "  • Block B: Build Stabilization (TypeScript fixes)"
echo "  • Block C: Environment Configuration"
echo "  • Block D: Database Setup"
echo "  • Block E: Static Generation Fix"
echo "  • Block F: Dead Links Fix"
echo "  • Block G: Data Pipeline Integration"
echo "  • Block H: Testing & Validation"
echo

read -p "$(echo -e ${CYAN}Continue with sprint execution? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "❌ Sprint execution cancelled"
    exit 0
fi

# Launch sprint execution
log "🚀 Launching sprint execution..."

# Start monitoring in background
start_monitoring

# Give monitor time to start
sleep 2

# Execute sprint
log "⚡ Starting sprint orchestrator..."
tsx scripts/sprint-orchestrator.ts execute

# Wait for completion
wait

# Show final results
log "📊 Sprint execution completed!"

if [[ -f "sprint-report.json" ]]; then
    log "📄 Sprint report generated: sprint-report.json"
    
    # Show summary
    echo
    echo -e "${CYAN}📈 SPRINT SUMMARY:${NC}"
    if command -v jq &> /dev/null; then
        jq -r '.sprintSummary | "Completed Blocks: \(.completedBlocks)/\(.totalBlocks)\nFailed Blocks: \(.failedBlocks)"' sprint-report.json
    else
        log "📄 Full report available in sprint-report.json"
    fi
fi

# Show next steps
echo
echo -e "${GREEN}🎉 Sprint execution finished!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review sprint-report.json for detailed results"
echo "2. Check logs/ directory for execution logs"
echo "3. Test the application: http://localhost:3000"
echo "4. Review any failed tasks and fix manually if needed"
echo

success "✅ DXM369 Sprint Launcher completed successfully!"
