# DXM369 Phase 3 — Cloudflare Pages Deployment

**Status:** Ready for production deployment
**Domain:** dxm369.com
**Hosting:** Cloudflare Pages (free tier)
**Build:** Next.js 14 standalone

---

## Pre-Deployment Checklist

### 1. Production Environment Variables

Create a `.env.production` or configure in Cloudflare Pages dashboard:

```bash
# Required for production
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SITE_URL=https://dxm369.com
NEXT_PUBLIC_BASE_URL=https://dxm369.com
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=dxm369-20

# Optional (leave blank if not configured)
AMAZON_ACCESS_KEY_ID=""
AMAZON_SECRET_ACCESS_KEY=""
AMAZON_ASSOCIATE_TAG=dxm369-20

# Security (generate unique values for production)
APP_SECRET=<generate-random-32-char-string>
JWT_SECRET=<generate-random-32-char-string>
RATE_LIMIT_SECRET=<generate-random-32-char-string>
ADMIN_SECRET=<generate-random-32-char-string>
CRON_SECRET=<generate-random-32-char-string>

# Analytics (optional)
SENTRY_DSN=""
```

### 2. Cloudflare Pages Setup

#### Option A: Deploy via Git (Recommended)

1. **Push to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Phase 3: Production deployment"
   git remote add origin https://github.com/YOUR_USERNAME/dxm369.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Visit: https://pages.cloudflare.com
   - Click "Create project" → "Connect to Git"
   - Select repository: `dxm369`
   - Build command: `npm run build`
   - Build output directory: `.next/standalone`
   - Environment variables: Paste all from step 1

3. **Configure Custom Domain**
   - Go to project settings
   - Custom domain → Add custom domain
   - Enter: `dxm369.com`
   - Update DNS records (Cloudflare will guide you)

#### Option B: Manual Deployment (Wrangler CLI)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy .next/standalone
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://dxm369.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "data": {
    "status": "ok",
    "name": "dxm369-gear-nexus",
    "version": "2.0.0",
    "environment": "production"
  }
}
```

### 2. SEO Pages Live

Verify these pages are indexed:
- https://dxm369.com/best-gpu-deals
- https://dxm369.com/best-laptop-deals
- https://dxm369.com/gpus
- https://dxm369.com/cpus
- https://dxm369.com/storage

### 3. Affiliate Links Working

Click a product card → should redirect to Amazon with your tracking tag (`dxm369-20`).

### 4. Analytics Tracking

Visit `/admin/earnings` to verify click tracking is working.

---

## SEO Activation (Post-Deployment)

### 1. Submit Sitemap to Google

1. Go to: https://search.google.com/search-console
2. Add property: `dxm369.com`
3. Submit sitemap: `https://dxm369.com/sitemap.xml`

### 2. Submit to Bing

1. Go to: https://www.bing.com/webmasters
2. Add site: `dxm369.com`
3. Submit sitemap

### 3. Verify DNS & SSL

- SSL certificate auto-provisioned by Cloudflare (free)
- Check: https://www.ssllabs.com/ssltest/analyze.html?d=dxm369.com

---

## Traffic Generation (Day 1-14)

### Social Media Push

#### TikTok (@DXM369Hardware)
- "Best GPU under $300" (target: gamers)
- "This laptop is crazy value" (target: students)
- "RTX 4070 vs RX 7800 XT in 30 seconds"

#### Reddit
- r/buildapc: Link to `/gpus` page
- r/BuiltaPC: Share best deals
- r/GameDeals: Monitor and share relevant products

#### X (Twitter) (@DXM369)
- Daily deal picks
- Hardware hot takes
- Link back to category pages

#### Discord/Telegram
- Join hardware communities
- Share DXM369 deal alerts
- Build organic following

### Content Calendar (Example)

**Week 1:**
- Day 1-2: Domain verification, SEO submission
- Day 3-4: First social media posts (5-10 posts across platforms)
- Day 5-7: Engagement push (reply, engage, build community)

**Week 2:**
- Monitor click-through rate
- Analyze which products convert
- Double down on winning categories
- Target: 3-10 qualified sales

---

## Monetization Dashboard

### Track Everything

- **Clicks:** `/api/dxm/click` logs every affiliate click
- **Revenue:** `/admin/earnings` (once Amazon validates sales)
- **Best Performers:** `/admin/earnings?action=epc-leaderboard`
- **Conversion Rate:** Monitor in analytics

### Success Metrics

✅ **Week 1:** 50+ clicks
✅ **Week 2:** 200+ clicks, 3-5 sales
✅ **Week 3:** 500+ clicks, 5-10 sales
✅ **Week 4:** 1000+ clicks, 10+ sales → **PA-API UNLOCK**

---

## Troubleshooting

### Build Fails on Cloudflare
- **Error:** `npm ERR! code ENOENT`
- **Fix:** Ensure `package-lock.json` is committed. Use `npm ci` instead of `npm install`.

### Pages Not Loading
- **Error:** `503 Service Unavailable`
- **Fix:** Check Cloudflare Pages build logs. Verify environment variables are set.

### Affiliate Links Not Working
- **Error:** Redirect to Amazon fails
- **Fix:** Verify `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` is set correctly in production.

### Tracking Not Recording
- **Error:** Clicks not appearing in `/admin/earnings`
- **Fix:** Verify `ADMIN_SECRET` is set. Check browser console for errors.

---

## Next Steps (Phase 4)

Once you hit 10+ sales:

1. **Unlock PA-API** → Real-time pricing activates automatically
2. **Enable Amazon earnings sync** → Cron job tracks your revenue
3. **Scale traffic** → Double down on winning channels
4. **Expand categories** → Add more high-EPC products
5. **Optimize funnel** → A/B test product cards, descriptions, CTAs

---

## Support & Monitoring

**Cloudflare Pages Dashboard:**
- https://dash.cloudflare.com → Pages → dxm369

**Monitor Build Logs:**
- Automatic deploys on every git push
- Check deployment history in Pages dashboard

**Real-time Analytics:**
- Cloudflare Analytics (free, basic)
- Google Analytics (setup next step)
- DXM custom tracking: `/admin/earnings`

---

## Go Live Checklist

- [ ] Environment variables configured in Cloudflare
- [ ] Git repository connected to Cloudflare Pages
- [ ] Build successful (`npm run build` locally verified)
- [ ] Custom domain (dxm369.com) DNS pointing to Cloudflare
- [ ] SSL certificate auto-provisioned
- [ ] Health check passing: `/api/health`
- [ ] Affiliate links redirect to Amazon correctly
- [ ] Tracking working: clicks recorded in `/admin/earnings`
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Social media accounts created (TikTok, X, Reddit)
- [ ] First wave of content scheduled

✅ **All systems ready. Deploy when you're ready.**
