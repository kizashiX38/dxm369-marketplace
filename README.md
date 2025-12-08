# DXM369 Gear Nexus

**Hardware. Signals. Smart Deals.**

A curated hardware discovery hub that aggregates deals and product listings from leading marketplaces. We don't hold inventory—we help you find value through affiliate links.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: use nvm or fnm)
- pnpm (install via `npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Project_DXM369_Marketplace
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Amazon Associate credentials (when ready)
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Project_DXM369_Marketplace/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with header/footer
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── deals/              # Deals page
│   │   ├── trending/           # Trending page
│   │   ├── gpus/               # GPUs page
│   │   ├── cpus/               # CPUs page
│   │   ├── laptops/            # Laptops page
│   │   ├── builds/             # PC builds page
│   │   ├── about/              # About page
│   │   ├── api/health/         # Health check API
│   │   ├── sitemap.ts          # SEO sitemap
│   │   └── robots.ts           # SEO robots.txt
│   ├── components/             # React components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── lib/                    # Utilities and data
│       ├── mockDeals.ts        # Mock deals data
│       ├── mockGpus.ts         # Mock GPU data
│       ├── mockCpus.ts         # Mock CPU data
│       ├── mockLaptops.ts      # Mock laptop data
│       ├── mockBuilds.ts       # Mock PC build data
│       └── affiliate.ts       # Affiliate link helper
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

## 🛣️ Routes

- `/` - Home/Landing page
- `/deals` - DXM369 Deals Radar (live deals sorted by Value Score)
- `/trending` - Trending Hardware
- `/gpus` - GPU rankings and comparisons
- `/cpus` - CPU rankings and comparisons
- `/laptops` - Laptop recommendations
- `/builds` - Curated PC builds
- `/about` - About page
- `/api/health` - Health check endpoint (returns JSON)

## 🔧 Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm

## 🔌 Future Integration: Amazon Product Advertising API

The codebase is structured to easily integrate with the Amazon Product Advertising API. Key integration points:

1. **Affiliate Links:** `src/lib/affiliate.ts` contains placeholder functions for generating affiliate links. Replace with real API calls.

2. **Mock Data:** All mock data files (`src/lib/mock*.ts`) should be replaced with API calls or database queries:
   - `mockDeals.ts` → Amazon Product Search API
   - `mockGpus.ts` → Database or API aggregation
   - `mockCpus.ts` → Database or API aggregation
   - `mockLaptops.ts` → Amazon Product Search API
   - `mockBuilds.ts` → Curated data source

3. **Environment Variables:** Set up `.env.local` with:
   - `AMAZON_ASSOCIATE_TAG`
   - `AMAZON_ACCESS_KEY_ID`
   - `AMAZON_SECRET_ACCESS_KEY`
   - `AMAZON_PARTNER_TAG`

## 🎨 Design Philosophy

- **Dark Theme:** Modern, clean dark UI optimized for readability
- **Performance:** Optimized for Cloudflare deployment with caching strategies
- **SEO:** Sitemap and robots.txt configured for search engine optimization
- **Accessibility:** Semantic HTML and proper contrast ratios

## 📝 Development Notes

- All pages are React Server Components by default
- Mock data is used for MVP demonstration
- TypeScript strict mode enabled
- Path alias `@/*` configured for imports
- No external UI libraries—pure Tailwind CSS

## 🚢 Deployment

The project is configured for Cloudflare deployment:

1. Build the project: `pnpm build`
2. Deploy to Cloudflare Pages or Workers
3. Ensure environment variables are set in Cloudflare dashboard
4. Configure custom domain (dxm369.com) in Cloudflare

## 📄 License

Private project - DXM369 Gear Nexus

## 🤝 Contributing

This is a private MVP project. For questions or suggestions, contact the project maintainer.

---

**Built with Next.js, TypeScript, and Tailwind CSS**

