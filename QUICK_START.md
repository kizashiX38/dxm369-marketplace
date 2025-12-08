# 🚀 DXM369 Quick Start Guide

**Time to launch:** 2 minutes
**Status:** ✅ Everything is ready to go

---

## Start Everything (1 command)

```bash
cd /home/dxm/Documents/Cursor_Dev/Project_DXM369_Marketplace
./start-full-stack.sh
```

Wait for output:
```
✅ Bridge server started (PID: xxxx)
✅ Bridge server is responsive
✅ Next.js server started (PID: xxxx)
✅ Marketplace is responsive
```

---

## Access Your Marketplace

### Public Pages
- 🏠 **Home:** http://localhost:3000
- 🎮 **GPUs:** http://localhost:3000/gpus
- 💾 **Storage:** http://localhost:3000/storage
- 💻 **CPUs:** http://localhost:3000/cpus
- 📱 **Laptops:** http://localhost:3000/laptops

### Admin Dashboard
- 📊 **Admin Panel:** http://localhost:3000/admin
- 🔧 **ASIN Manager:** http://localhost:3000/admin/asin-manager

### API Health
- Bridge: `curl http://localhost:5000/health`
- Marketplace: `curl http://localhost:3000/api/health`

---

## Manage Products (ASIN Manager)

### Visit Dashboard
```
http://localhost:3000/admin/asin-manager
```

### Fetch Products
1. Enter ASINs: `B0BJQRXJZD B0CCLPW7LQ B0DVCBDJBJ`
2. Click "🔍 Fetch ASINs"
3. Wait 3-5 seconds for data
4. See table with products

### Sync to Marketplace
1. Click "🔄 Sync X Products"
2. Products stored in database
3. Visit `/gpus` to see live products

### Cache Management
1. Click "💾 Cache Management" tab
2. "📊 View Cache Stats" → See hit rate
3. "🗑️ Clear Cache" → Reset cache

---

## What's Happening Behind the Scenes

```
Your Browser
    ↓
Next.js Marketplace (port 3000)
    ↓
Admin Dashboard (/admin/asin-manager)
    ↓
Bridge API (port 5000)
    ↓
Amazon.com (Web Scraping)
    ↓
Database (PostgreSQL)
    ↓
Live Products on Marketplace
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/admin/asin-manager/page.tsx` | Web dashboard |
| `src/app/api/admin/asin-sync/route.ts` | Sync endpoint |
| `DXM_ASIN_Console/asin_bridge_server.py` | Scraping service |
| `HYBRID_ARCHITECTURE_FINAL.md` | System design |
| `start-full-stack.sh` | Startup script |

---

## Troubleshooting

### Bridge won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill it if needed
kill -9 <PID>

# Start manually
cd DXM_ASIN_Console
source venv/bin/activate
python3 asin_bridge_server.py
```

### Marketplace won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill it if needed
kill -9 <PID>

# Start manually
npm run dev
```

### Products not syncing
- Verify bridge health: `curl http://localhost:5000/health`
- Check database connection in `.env`
- View logs: `tail -f nextjs.log`

### ASIN fetch timing out
- Amazon is rate-limiting
- Wait 5 minutes and try again
- Check bridge logs: `tail -f DXM_ASIN_Console/asin_bridge.log`

---

## Next Steps

### Today
1. ✅ Start everything with `./start-full-stack.sh`
2. ✅ Visit ASIN Manager at http://localhost:3000/admin/asin-manager
3. ✅ Fetch some ASINs (test the system)
4. ✅ View products on marketplace

### This Week
1. 🔄 Read `HYBRID_ARCHITECTURE_FINAL.md` (understand system)
2. 🔄 Review `DEPLOYMENT.md` (prepare for production)
3. 🔄 Test all features (fetch, sync, browse)

### Next Week
1. 🚀 Deploy to Cloudflare Pages (Next.js)
2. 🚀 Deploy to VPS (Bridge server)
3. 🚀 Point domain to Cloudflare
4. 🚀 Start traffic campaign

---

## Production Checklist

Before deploying to production:

- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] Bridge health check passes: `curl http://localhost:5000/health`
- [ ] ASIN manager works locally
- [ ] Products sync to database
- [ ] Affiliate links generate correctly
- [ ] Click tracking records events

---

## Support

### Documentation
- `HYBRID_ARCHITECTURE_FINAL.md` — Full system design
- `PHASE-3-COMPLETE.md` — What we built
- `DEPLOYMENT.md` — How to deploy
- `CLAUDE.md` — Project context

### Testing
```bash
# Bridge API test
curl "http://localhost:5000/api/amazon/items?asins=B0BJQRXJZD"

# Sync test
curl -X POST http://localhost:3000/api/admin/asin-sync \
  -H "Content-Type: application/json" \
  -d '{"products":[],"action":"sync"}'

# Marketplace test
curl http://localhost:3000/api/health
```

---

**You're ready. Go build something amazing.** 🚀

