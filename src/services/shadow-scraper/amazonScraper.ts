// src/services/shadow-scraper/amazonScraper.ts
// DXMatrix Shadow Intelligence — Amazon Full-Metadata Scraper
// Playwright-based scraper with anti-detection, JSON-LD extraction, DOM parsing

import { chromium, Browser, Page } from 'playwright';

export interface AmazonProductMetadata {
  asin: string;
  title: string;
  price: number;
  listPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  imageUrl: string;
  imageGallery: string[];
  availability: string;
  stockLevel?: string;
  buyboxSeller?: string;
  sellerCount?: number;
  attributes: Record<string, string>;
  technicalSpecs: Record<string, string>;
  variants?: Array<{ asin: string; title: string; price?: number }>;
  lastUpdated: string;
  source: 'shadow-scraper';
}

export class AmazonShadowScraper {
  private browser: Browser | null = null;

  // Launch browser with anti-detection fingerprinting
  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
  }

  // Close browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Scrape single ASIN
  async scrapeASIN(asin: string): Promise<AmazonProductMetadata | null> {
    if (!this.browser) await this.init();

    const context = await this.browser!.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    const page = await context.newPage();

    // Inject anti-detection scripts
    await this.injectStealthScripts(page);

    try {
      const url = `https://www.amazon.com/dp/${asin}`;
      console.log(`[Shadow Scraper] Fetching ${url}...`);

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for JS rendering

      // Check for captcha or error page
      const isCaptcha = await page.$('#captchacharacters');
      if (isCaptcha) {
        console.error(`[Shadow Scraper] CAPTCHA detected for ${asin}`);
        await context.close();
        return null;
      }

      const isNotFound = await page.$('#noResultsTitle');
      if (isNotFound) {
        console.error(`[Shadow Scraper] Product not found: ${asin}`);
        await context.close();
        return null;
      }

      // Extract metadata
      const metadata = await this.extractMetadata(page, asin);
      await context.close();

      return metadata;
    } catch (error) {
      console.error(`[Shadow Scraper] Error scraping ${asin}:`, error);
      await context.close();
      return null;
    }
  }

  // Batch scrape multiple ASINs
  async scrapeASINs(asins: string[]): Promise<AmazonProductMetadata[]> {
    const results: AmazonProductMetadata[] = [];

    for (const asin of asins) {
      const metadata = await this.scrapeASIN(asin);
      if (metadata) {
        results.push(metadata);
      }
      // Random delay between requests (2-5 seconds)
      await this.randomDelay(2000, 5000);
    }

    return results;
  }

  // Extract all metadata from page
  private async extractMetadata(page: Page, asin: string): Promise<AmazonProductMetadata | null> {
    try {
      // Extract JSON-LD structured data (Amazon's hidden metadata)
      const jsonLD = await this.extractJSONLD(page);

      // Extract price data
      const priceData = await this.extractPriceData(page);

      // Extract title
      const title = await page.$eval('#productTitle', (el) => el.textContent?.trim() || '').catch(() => '');

      // Extract rating and reviews
      const rating = await page
        .$eval('[data-hook="rating-out-of-text"]', (el) => {
          const text = el.textContent?.trim() || '0';
          return parseFloat(text.split(' ')[0]);
        })
        .catch(() => 0);

      const reviewCount = await page
        .$eval('[data-hook="total-review-count"]', (el) => {
          const text = el.textContent?.trim() || '0';
          return parseInt(text.replace(/,/g, ''), 10);
        })
        .catch(() => 0);

      // Extract category
      const category = await page
        .$eval('#wayfinding-breadcrumbs_feature_div', (el) => {
          const links = el.querySelectorAll('a');
          return links.length > 0 ? links[links.length - 1].textContent?.trim() || 'Unknown' : 'Unknown';
        })
        .catch(() => 'Unknown');

      // Extract brand
      const brand = await page
        .$eval('#bylineInfo', (el) => el.textContent?.replace('Visit the', '').replace('Store', '').trim() || 'Unknown')
        .catch(() => 'Unknown');

      // Extract images
      const imageUrl = await page.$eval('#landingImage', (el) => el.getAttribute('src') || '').catch(() => '');
      const imageGallery = await this.extractImageGallery(page);

      // Extract availability
      const availability = await page
        .$eval('#availability', (el) => el.textContent?.trim() || 'Unknown')
        .catch(() => 'Unknown');

      // Extract stock level hints
      const stockLevel = await this.extractStockLevel(page);

      // Extract buybox seller
      const buyboxSeller = await page
        .$eval('#merchant-info', (el) => el.textContent?.trim() || '')
        .catch(() => 'Amazon');

      // Extract attributes (bullet points)
      const attributes = await this.extractAttributes(page);

      // Extract technical specs
      const technicalSpecs = await this.extractTechnicalSpecs(page);

      // Extract variants
      const variants = await this.extractVariants(page);

      return {
        asin,
        title: title || jsonLD?.name || 'Unknown',
        price: priceData.price,
        listPrice: priceData.listPrice,
        discountPercent: priceData.discountPercent,
        rating,
        reviewCount,
        category,
        brand,
        imageUrl,
        imageGallery,
        availability,
        stockLevel,
        buyboxSeller,
        attributes,
        technicalSpecs,
        variants,
        lastUpdated: new Date().toISOString(),
        source: 'shadow-scraper',
      };
    } catch (error) {
      console.error(`[Shadow Scraper] Metadata extraction failed:`, error);
      return null;
    }
  }

  // Extract JSON-LD structured data
  private async extractJSONLD(page: Page): Promise<any> {
    return page
      .$$eval('script[type="application/ld+json"]', (scripts) => {
        for (const script of scripts) {
          try {
            const data = JSON.parse(script.textContent || '');
            if (data['@type'] === 'Product') return data;
          } catch {}
        }
        return null;
      })
      .catch(() => null);
  }

  // Extract price data with discount calculation
  private async extractPriceData(page: Page): Promise<{ price: number; listPrice?: number; discountPercent?: number }> {
    try {
      // Try main price element
      const priceText = await page
        .$eval('.a-price .a-offscreen', (el) => el.textContent?.trim() || '')
        .catch(() => '');

      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

      // Try list price (original price)
      const listPriceText = await page
        .$eval('.a-price.a-text-price .a-offscreen', (el) => el.textContent?.trim() || '')
        .catch(() => '');

      const listPrice = parseFloat(listPriceText.replace(/[^0-9.]/g, '')) || undefined;

      // Calculate discount
      const discountPercent = listPrice && price ? Math.round(((listPrice - price) / listPrice) * 100) : undefined;

      return { price, listPrice, discountPercent };
    } catch {
      return { price: 0 };
    }
  }

  // Extract stock level hints
  private async extractStockLevel(page: Page): Promise<string | undefined> {
    return page
      .$eval('#availability', (el) => {
        const text = el.textContent?.toLowerCase() || '';
        if (text.includes('only') && text.includes('left')) {
          return text.trim();
        }
        return undefined;
      })
      .catch(() => undefined);
  }

  // Extract image gallery
  private async extractImageGallery(page: Page): Promise<string[]> {
    return page
      .$$eval('#altImages img', (images) => images.map((img) => img.getAttribute('src') || '').filter(Boolean))
      .catch(() => []);
  }

  // Extract bullet point attributes
  private async extractAttributes(page: Page): Promise<Record<string, string>> {
    return page
      .$$eval('#feature-bullets ul li', (items) => {
        const attrs: Record<string, string> = {};
        items.forEach((item, i) => {
          const text = item.textContent?.trim() || '';
          if (text) attrs[`feature_${i + 1}`] = text;
        });
        return attrs;
      })
      .catch(() => ({}));
  }

  // Extract technical specifications table
  private async extractTechnicalSpecs(page: Page): Promise<Record<string, string>> {
    return page
      .$$eval('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr', (rows) => {
        const specs: Record<string, string> = {};
        rows.forEach((row) => {
          const th = row.querySelector('th')?.textContent?.trim() || '';
          const td = row.querySelector('td')?.textContent?.trim() || '';
          if (th && td) specs[th] = td;
        });
        return specs;
      })
      .catch(() => ({}));
  }

  // Extract product variants (colors, sizes, etc.)
  private async extractVariants(page: Page): Promise<Array<{ asin: string; title: string; price?: number }>> {
    return page
      .$$eval('#twister .a-button-text', (buttons) => {
        return buttons.map((btn) => {
          const asin = btn.getAttribute('data-defaultasin') || '';
          const title = btn.textContent?.trim() || '';
          return { asin, title };
        });
      })
      .catch(() => []);
  }

  // Anti-detection: Inject stealth scripts
  private async injectStealthScripts(page: Page) {
    await page.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

      // Mock languages
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

      // Add chrome object
      (window as any).chrome = { runtime: {} };

      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);
    });
  }

  // Random user agent rotation
  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Random delay helper
  private async randomDelay(min: number, max: number) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// Singleton instance
let scraperInstance: AmazonShadowScraper | null = null;

export async function getScraper(): Promise<AmazonShadowScraper> {
  if (!scraperInstance) {
    scraperInstance = new AmazonShadowScraper();
    await scraperInstance.init();
  }
  return scraperInstance;
}

export async function closeScraper() {
  if (scraperInstance) {
    await scraperInstance.close();
    scraperInstance = null;
  }
}
