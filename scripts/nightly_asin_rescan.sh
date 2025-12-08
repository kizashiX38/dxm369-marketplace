#!/bin/bash
# This script runs the ASIN verification and logs any failures.

FAILURES_LOG="/home/dxm/.gemini/tmp/04de21f22da8b61186778d463b31a27ac5920d7c1791070957518250a782f42e/asin_verification_failures.log"
VERIFY_SCRIPT="/home/dxm/Documents/Cursor_Dev/Project_DXM369_Marketplace/verify_all.sh"
PROJECT_DIR="/home/dxm/Documents/Cursor_Dev/Project_DXM369_Marketplace"

echo "Starting nightly ASIN verification at $(date)" >> "$FAILURES_LOG"
echo "--------------------------------------------------" >> "$FAILURES_LOG"

# Navigate to the project directory to ensure script runs in the correct context
cd "$PROJECT_DIR" || { echo "Failed to change directory to $PROJECT_DIR"; exit 1; }

# Run the verification script and capture output
# We grep for lines starting with '❌' to identify failures
"$VERIFY_SCRIPT" 2>> "$FAILURES_LOG" | grep '^❌' >> "$FAILURES_LOG"

echo "ASIN verification complete. Failures logged to $FAILURES_LOG"
echo "" >> "$FAILURES_LOG"
