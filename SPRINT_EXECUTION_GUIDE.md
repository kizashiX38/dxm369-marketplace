# DXM369 Sprint Execution System

**Full Debug Monitoring & Logical Progression System**

## Overview

This sprint execution system provides comprehensive monitoring and debugging capabilities for the DXM369 marketplace code sprint. It executes all blocks in logical order with full visibility into progress, errors, and system state.

## System Components

### 1. Sprint Orchestrator (`scripts/sprint-orchestrator.ts`)
- **Purpose:** Core execution engine that runs all sprint blocks
- **Features:**
  - Dependency-aware block execution
  - Real-time task monitoring
  - Comprehensive error logging
  - JSON status output
  - Automatic report generation

### 2. Sprint Monitor (`scripts/sprint-monitor.ts`)
- **Purpose:** Real-time visual monitoring dashboard
- **Features:**
  - Live progress bars
  - Color-coded status indicators
  - Task-level detail view
  - Auto-refreshing display
  - Duration tracking

### 3. Sprint Launcher (`scripts/launch-sprint.sh`)
- **Purpose:** Pre-flight checks and coordinated launch
- **Features:**
  - Environment validation
  - Dependency checks
  - Server startup management
  - Background monitoring setup
  - Graceful cleanup

### 4. Status Checker (`scripts/sprint-status.sh`)
- **Purpose:** Quick status overview without full monitoring
- **Features:**
  - Summary statistics
  - Block progress overview
  - Last update timestamp

## Sprint Blocks (Execution Order)

### Block A: Emergency Triage
**Dependencies:** None  
**Purpose:** Establish stable baseline
- Build status check
- Database connectivity test
- Environment variables audit
- API endpoints test

### Block B: Build Stabilization
**Dependencies:** Block A  
**Purpose:** Fix TypeScript errors
- TypeScript error analysis
- Fix calculateRealDXMScoreV2 export
- Fix union type error
- Build verification

### Block C: Environment Configuration
**Dependencies:** Block B  
**Purpose:** Configure all required variables
- Copy environment template
- Generate secrets
- Validate environment

### Block D: Database Setup
**Dependencies:** Block C  
**Purpose:** Establish working database
- Database connection test
- Schema migration
- Seed data load

### Block E: Static Generation Fix
**Dependencies:** Block B  
**Purpose:** Fix relative URL errors
- Find relative URLs
- Fix category pages
- Static generation test

### Block F: Dead Links Fix
**Dependencies:** Block D, Block E  
**Purpose:** Ensure working affiliate links
- Test all category APIs
- Database product count
- Test category pages

### Block G: Data Pipeline Integration
**Dependencies:** Block F  
**Purpose:** Connect Amazon → Database → UI
- Test Amazon API credentials
- Product service test
- End-to-end pipeline test

### Block H: Testing & Validation
**Dependencies:** Block G  
**Purpose:** Verify entire system
- Full build test
- All pages load test
- Affiliate links test

## Usage Instructions

### Quick Start
```bash
# Navigate to project directory
cd /home/dxm/Documents/Cursor_Dev/DXM369_Marketplace_CLEAN

# Launch complete sprint with monitoring
./scripts/launch-sprint.sh
```

### Manual Execution
```bash
# Start sprint orchestrator only
tsx scripts/sprint-orchestrator.ts execute

# Start monitoring in separate terminal
tsx scripts/sprint-monitor.ts watch

# Check status without monitoring
tsx scripts/sprint-monitor.ts status
```

### Monitoring Options

#### Full Dashboard Monitoring
```bash
tsx scripts/sprint-monitor.ts watch
```
- Real-time visual dashboard
- Progress bars and status icons
- Task-level details
- Duration tracking

#### Simple Status Monitoring
```bash
tsx scripts/sprint-monitor.ts simple
```
- Lightweight text output
- Basic progress information
- Suitable for logging

#### Quick Status Check
```bash
./scripts/sprint-status.sh
# or
tsx scripts/sprint-monitor.ts status
```
- One-time status snapshot
- Summary statistics
- No continuous monitoring

## Debug Information

### Log Files Generated
- `sprint-log-[timestamp].json` - Detailed execution log
- `sprint-status.json` - Real-time status updates
- `sprint-report.json` - Final execution report
- `logs/monitor.log` - Monitor output log
- `dev-server.log` - Development server log

### Status File Format
```json
{
  "timestamp": "2025-12-19T14:23:00.000Z",
  "blocks": [
    {
      "id": "block-a",
      "name": "Emergency Triage",
      "status": "running",
      "progress": 75,
      "startTime": "2025-12-19T14:20:00.000Z",
      "tasks": [
        {
          "id": "a1",
          "name": "Build Status Check",
          "status": "completed"
        }
      ]
    }
  ]
}
```

### Task Status Values
- `pending` - Not yet started
- `running` - Currently executing
- `completed` - Successfully finished
- `failed` - Encountered error

### Block Status Values
- `pending` - Waiting for dependencies
- `running` - Tasks in progress
- `completed` - All tasks successful
- `failed` - One or more tasks failed

## Troubleshooting

### Common Issues

#### Sprint Won't Start
```bash
# Check if in correct directory
ls package.json src/app/layout.tsx

# Check Node.js version
node --version  # Should be 18+

# Install tsx if missing
npm install -g tsx
```

#### Server Not Running
```bash
# Kill existing processes
pkill -f "next dev"

# Start server manually
npm run dev

# Check if running
curl http://localhost:3000
```

#### Environment Issues
```bash
# Check environment file
ls -la .env.local

# Copy from template if missing
cp .env.local.example .env.local

# Edit with actual values
nano .env.local
```

#### Dependencies Missing
```bash
# Install dependencies
npm install

# Check for tsx
which tsx || npm install -g tsx
```

### Debug Commands

#### Check Sprint Status
```bash
# Quick status
./scripts/sprint-status.sh

# Detailed status
cat sprint-status.json | jq '.'

# View logs
tail -f sprint-log-*.json
```

#### Manual Task Execution
```bash
# Test individual commands from blocks
npm run build
curl -s http://localhost:3000/api/dxm/products/gpus | jq '.'
node -e "console.log(process.env.DATABASE_URL ? 'SET' : 'MISSING')"
```

#### Monitor System Resources
```bash
# Check processes
ps aux | grep -E "(node|npm|tsx)"

# Check ports
netstat -tlnp | grep :3000

# Check disk space
df -h
```

## Expected Output

### Successful Execution
```
🎯 Starting DXM369 Code Sprint Execution
📋 Total blocks: 8
🚀 Starting block: Emergency Triage
✅ Task completed: Build Status Check
✅ Task completed: Database Connectivity Test
✅ Task completed: Environment Variables Audit
✅ Task completed: API Endpoints Test
📊 Block Emergency Triage finished: 4/4 tasks completed
...
🏁 Sprint execution finished!
📈 Results: 8 completed, 0 failed
📄 Sprint report saved to: sprint-report.json
```

### Monitor Dashboard
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        DXM369 SPRINT EXECUTION MONITOR                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 OVERALL PROGRESS
████████████████████████████████████████ 100% (8/8 blocks)

📈 STATUS SUMMARY
✅ Completed: 8
🔄 Running: 0
❌ Failed: 0
⏳ Pending: 0

🔍 BLOCK DETAILS
────────────────────────────────────────────────────────────────────────────────
✅ Emergency Triage [block-a]
   Progress: ████████████████ 100% | Duration: 2m 15s
   Tasks: 4 done, 0 running, 0 failed
```

## Integration with Existing Systems

### Environment Variables
The sprint system respects all existing environment variables and will validate them during execution.

### Database Integration
Connects to existing database configuration and runs migrations/seeding as needed.

### Development Server
Automatically manages the Next.js development server, starting it if not running.

### Build System
Uses existing npm scripts and build configuration.

## Post-Sprint Actions

After successful sprint execution:

1. **Review Results**
   ```bash
   cat sprint-report.json | jq '.sprintSummary'
   ```

2. **Test Application**
   ```bash
   open http://localhost:3000
   ```

3. **Verify All Categories**
   ```bash
   for cat in gpus cpus memory storage laptops; do
     echo "Testing $cat:"
     curl -s "http://localhost:3000/$cat" | grep -o "<title>[^<]*"
   done
   ```

4. **Check Affiliate Links**
   ```bash
   curl -s "http://localhost:3000/gpus" | grep -o "dxm369-20" | wc -l
   ```

5. **Production Build Test**
   ```bash
   npm run build
   ```

## System Requirements

- Node.js 18+
- npm or pnpm
- tsx (installed automatically)
- curl (for API testing)
- jq (optional, for JSON parsing)
- PostgreSQL database (configured in .env.local)

## Security Considerations

- Environment variables are validated but not logged
- Database credentials are handled securely
- API keys are not exposed in logs
- All temporary files are cleaned up on exit

---

**Ready to execute the sprint with full debug monitoring!**

Use `./scripts/launch-sprint.sh` to start the complete system.
