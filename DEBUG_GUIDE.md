# Debugging Guide for DXM369 Gear Nexus

## Current Debug Setup

The Next.js development server is running with full debug logging enabled.

### Active Debug Ports

- **Port 9229**: Main Node.js process (pnpm)
- **Port 9230**: Next.js Router Server (main application)

### How to Connect to the Debugger

#### Option 1: Chrome DevTools (Easiest)

1. Open Chrome or Edge browser
2. Navigate to: `chrome://inspect` or `edge://inspect`
3. You should see your Node.js processes listed
4. Click **"inspect"** next to the process you want to debug
5. The DevTools will open with full debugging capabilities

#### Option 2: Direct DevTools URL

Copy and paste this URL into Chrome/Edge:
```
devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=localhost:9230/35be2dbb-2299-41d2-8dd2-dde541156c7b
```

#### Option 3: VS Code Debugger

1. Open VS Code in this project
2. Go to Run and Debug (Cmd+Shift+D)
3. Select **"Attach to Next.js"** from the dropdown
4. Click the green play button

The `.vscode/launch.json` file has been configured for you.

#### Option 4: Command Line Inspector

You can also use `node inspect` command, but the easiest way is Chrome DevTools.

### Important Notes

⚠️ **The `ws://` URL is a WebSocket endpoint, NOT an HTTP URL**

- ❌ Don't try to open `ws://127.0.0.1:9230` in a browser directly
- ✅ Use Chrome DevTools (`chrome://inspect`) or VS Code debugger instead
- ✅ The WebSocket connection is handled automatically by the debugger tools

### Debug Logs

All debug output is being logged to: `dev-debug.log`

To view real-time logs:
```bash
tail -f dev-debug.log
```

### Environment Variables Used

- `DEBUG=next:*` - Enables Next.js debug logging
- `NODE_OPTIONS='--inspect'` - Enables Node.js inspector

### Stopping the Debug Server

To stop the debug server:
```bash
pkill -f "next dev"
# or
lsof -ti:3000 | xargs kill
```

### Restarting with Debug

```bash
cd /Users/dxm/Cursor_Dev/Project_DXM369_Marketplace
DEBUG=next:* NODE_OPTIONS='--inspect' pnpm dev
```

