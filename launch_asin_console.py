#!/usr/bin/env python3
"""
DXM369 Marketplace - ASIN Console Launcher
Launches the ASIN Intelligence Console with marketplace integration
"""

import sys
import os
from pathlib import Path

# Add the ASIN console tools directory to Python path
console_path = Path(__file__).parent / "tools" / "asin_console"
sys.path.insert(0, str(console_path))

# Change working directory to the console directory
os.chdir(console_path)

# Import and run the main application
try:
    from main import main
    print("🚀 Launching DXM ASIN Intelligence Console with Marketplace Integration...")
    print(f"📁 Console Location: {console_path}")
    print(f"🌱 Marketplace Seed: {console_path.parent.parent / 'data' / 'asin-seed.json'}")
    print("=" * 80)
    main()
except ImportError as e:
    print(f"❌ Error importing ASIN console: {e}")
    print("Make sure all dependencies are installed:")
    print("pip install -r tools/asin_console/requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error launching ASIN console: {e}")
    sys.exit(1)