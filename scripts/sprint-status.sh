#!/bin/bash
# Quick Sprint Status Checker
# Shows current sprint progress without full monitoring

cd /home/dxm/Documents/Cursor_Dev/DXM369_Marketplace_CLEAN

echo "🎯 DXM369 Sprint Status Check"
echo "================================"

# Check if sprint is running
if [[ -f "sprint-status.json" ]]; then
    echo "📊 Sprint Status Found"
    
    if command -v jq &> /dev/null; then
        echo
        echo "📈 Block Progress:"
        jq -r '.blocks[] | "  \(.status | if . == "completed" then "✅" elif . == "running" then "🔄" elif . == "failed" then "❌" else "⏳" end) \(.name): \(.progress)%"' sprint-status.json
        
        echo
        echo "📊 Overall Summary:"
        TOTAL=$(jq '.blocks | length' sprint-status.json)
        COMPLETED=$(jq '[.blocks[] | select(.status == "completed")] | length' sprint-status.json)
        RUNNING=$(jq '[.blocks[] | select(.status == "running")] | length' sprint-status.json)
        FAILED=$(jq '[.blocks[] | select(.status == "failed")] | length' sprint-status.json)
        
        echo "  Total Blocks: $TOTAL"
        echo "  ✅ Completed: $COMPLETED"
        echo "  🔄 Running: $RUNNING"
        echo "  ❌ Failed: $FAILED"
        echo "  ⏳ Pending: $((TOTAL - COMPLETED - RUNNING - FAILED))"
        
        echo
        LAST_UPDATE=$(jq -r '.timestamp' sprint-status.json)
        echo "🕒 Last Updated: $LAST_UPDATE"
    else
        echo "⚠️  jq not available. Raw status:"
        cat sprint-status.json
    fi
else
    echo "❌ No sprint status found"
    echo "   Sprint may not be running or hasn't started yet"
fi

echo
echo "💡 Commands:"
echo "  ./scripts/launch-sprint.sh     - Start sprint execution"
echo "  tsx scripts/sprint-monitor.ts watch - Start live monitoring"
echo "  tsx scripts/sprint-monitor.ts status - Quick status check"
