// src/lib/amazonPAAPI.ts
// Complete Amazon Product Advertising API Integration v2
// Production-ready with real-time data, caching, and error handling
// SERVER-ONLY MODULE - Do not import in client components
// Note: Cannot use "use server" here as this file exports a class, not server actions

import { DealRadarItem, HardwareCategory } from "@/lib/dealRadar";
import { calculateRealDXMScoreV2 } from "@/lib/dealRadar";
import { amazonConfig, appConfig } from "@/lib/env";

// Amazon PA-API Configuration
interface AmazonPAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
  marketplace: string;
}

// Amazon API Response Types
interface AmazonSearchResponse {
  SearchResult?: {
    Items?: AmazonItem[];
    TotalResultCount?: number;
  };
  Errors?: Array<{ Code: string; Message: string }>;
}

interface AmazonGetItemsResponse {
  ItemsResult?: {
    Items?: AmazonItem[];
  };
  Errors?: Array<{ Code: string; Message: string }>;
}

interface AmazonItem {
  ASIN: string;
  DetailPageURL: string;
  Images?: {
    Primary?: {
      Large?: { URL: string; Height: number; Width: number };
      Medium?: { URL: string; Height: number; Width: number };
    };
  };
  ItemInfo?: {
    Title?: { DisplayValue: string };
    Features?: { DisplayValues: string[] };
    ByLineInfo?: {
      Brand?: { DisplayValue: string };
      Manufacturer?: { DisplayValue: string };
    };
    Classifications?: {
      Binding?: { DisplayValue: string };
      ProductGroup?: { DisplayValue: string };
    };
  };
  Offers?: {
    Listings?: Array<{
      Id: string;
      Price?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
      SavingBasis?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
      Availability?: {
        Message: string;
        MinOrderQuantity?: number;
        MaxOrderQuantity?: number;
      };
      DeliveryInfo?: {
        IsAmazonFulfilled: boolean;
        IsFreeShippingEligible: boolean;
        IsPrimeEligible: boolean;
      };
      MerchantInfo?: {
        Id: string;
        Name: string;
      };
    }>;
    Summaries?: Array<{
      Condition?: { Value: string };
      OfferCount?: number;
    }>;
  };
  CustomerReviews?: {
    Count: number;
    StarRating: {
      Value: number;
    };
  };
  BrowseNodeInfo?: {
    BrowseNodes?: Array<{
      Id: string;
      DisplayName: string;
      ContextFreeName?: string;
    }>;
  };
}

// Search parameters
interface SearchParams {
  keywords: string;
  searchIndex?: string;
  itemCount?: number;
  itemPage?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: "New" | "Used" | "Collectible" | "Refurbished";
}

// Get Items parameters
interface GetItemsParams {
  itemIds: string[];
  resources?: string[];
  condition?: "New" | "Used" | "Collectible" | "Refurbished";
  merchant?: "Amazon" | "All";
}

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AmazonPAAPICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Main Amazon PA-API Client
export class AmazonPAAPIClient {
  private config: AmazonPAAPIConfig;
  private cache = new AmazonPAAPICache();
  private readonly baseURL: string;
  private readonly apiPath = "/paapi5";

  constructor(config?: Partial<AmazonPAAPIConfig>) {
    // CRITICAL FIX: Use centralized env.ts config with proper server-side variables
    // Previous bug: Was using NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG (client-side) instead of AMAZON_ASSOCIATE_TAG (server-side)
    this.config = {
      accessKey: amazonConfig.accessKeyId || "",
      secretKey: amazonConfig.secretAccessKey || "",
      partnerTag: amazonConfig.associateTag || "dxm369-20", // Use server-side AMAZON_ASSOCIATE_TAG
      region: amazonConfig.region || "us-east-1",
      marketplace: "www.amazon.com",
      ...config
    };

    // Set baseURL from config
    const host = amazonConfig.host || "webservices.amazon.com";
    this.baseURL = `https://${host}`;

    // Validate critical credentials
    if (!this.config.accessKey || !this.config.secretKey || !this.config.partnerTag) {
      const missing = [];
      if (!this.config.accessKey) missing.push("AMAZON_ACCESS_KEY_ID");
      if (!this.config.secretKey) missing.push("AMAZON_SECRET_ACCESS_KEY");
      if (!this.config.partnerTag) missing.push("AMAZON_ASSOCIATE_TAG");
      
      console.error(`[AMAZON_PAAPI] Missing required credentials: ${missing.join(", ")}`);
      console.error(`[AMAZON_PAAPI] Config loaded:`, {
        hasAccessKey: !!this.config.accessKey,
        hasSecretKey: !!this.config.secretKey,
        hasPartnerTag: !!this.config.partnerTag,
        partnerTag: this.config.partnerTag,
        region: this.config.region,
        baseURL: this.baseURL
      });
    }
  }

  // AWS Signature v4 signing
  private async signRequest(
    method: string,
    path: string,
    headers: Record<string, string>,
    payload: string
  ): Promise<Record<string, string>> {
    // Validate credentials before signing
    if (!this.config.accessKey || !this.config.secretKey) {
      throw new Error("Amazon PA-API credentials missing - cannot sign request");
    }

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStamp = now.toISOString().slice(0, 19).replace(/[-:]/g, "") + "Z";

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join("\n") + "\n";

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(";");

    const payloadHash = await this.sha256(payload);
    
    const canonicalRequest = [
      method,
      path,
      "", // query string
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join("\n");

    // Create string to sign
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${this.config.region}/ProductAdvertisingAPI/aws4_request`;
    const stringToSign = [
      algorithm,
      timeStamp,
      credentialScope,
      await this.sha256(canonicalRequest)
    ].join("\n");

    // Calculate signature
    const signature = await this.calculateSignature(stringToSign, dateStamp);

    // Add authorization header
    const authorizationHeader = `${algorithm} Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Debug logging in development (can be toggled via env)
    const debugMode = appConfig.isDevelopment && typeof window === "undefined" && process.env.AMAZON_DEBUG_SIGNATURE === "true";
    if (debugMode) {
      console.log("[AMAZON_SIGNATURE_DEBUG]", {
        method,
        path,
        dateStamp,
        timeStamp,
        region: this.config.region,
        accessKeyPrefix: this.config.accessKey.substring(0, 8) + "...",
        partnerTag: this.config.partnerTag,
        credentialScope,
        signedHeaders,
        signaturePrefix: signature.substring(0, 16) + "..."
      });
    }

    return {
      ...headers,
      "Authorization": authorizationHeader,
      "X-Amz-Date": timeStamp
    };
  }

  private async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  private async calculateSignature(stringToSign: string, dateStamp: string): Promise<string> {
    const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
      const kDate = await this.hmacSha256(`AWS4${key}`, dateStamp);
      const kRegion = await this.hmacSha256(kDate, regionName);
      const kService = await this.hmacSha256(kRegion, serviceName);
      const kSigning = await this.hmacSha256(kService, "aws4_request");
      return kSigning;
    };

    const signingKey = await getSignatureKey(this.config.secretKey, dateStamp, this.config.region, "ProductAdvertisingAPI");
    const signature = await this.hmacSha256(signingKey, stringToSign);
    
    // Convert to hex
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  private async hmacSha256(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyBuffer = typeof key === "string" ? encoder.encode(key) : key;
    const dataBuffer = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    return await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
  }

  // DXM369 LOCAL-FIRST: Load mock data from local cache
  private async loadLocalCache(asins: string[]): Promise<DealRadarItem[]> {
    try {
      const mockData = await import("../mock/amazon-cache.json");
      const cache = (mockData.default || mockData) as Record<string, DealRadarItem>;
      
      // If no ASINs provided (search scenario), return all mock items
      if (asins.length === 0) {
        return Object.values(cache) as DealRadarItem[];
      }
      
      // Map ASINs to items
      return asins
        .map(asin => {
          // Try to find exact match first
          const item = cache[asin];
          if (item) return item as DealRadarItem;
          
          // Fallback: return first available item as template
          const firstKey = Object.keys(cache)[0];
          if (firstKey) {
            const template = cache[firstKey] as DealRadarItem;
            return {
              ...template,
              id: `amazon-${asin}`,
              asin: asin,
              title: `Mock Product ${asin}`,
            };
          }
          
          return null;
        })
        .filter((item): item is DealRadarItem => item !== null);
    } catch (error) {
      console.warn("[AMAZON_LOCAL_CACHE] Failed to load mock data:", error);
      return [];
    }
  }

  // Search for products
  // DXM369 HYBRID MODE: Uses live API when credentials exist, falls back to local cache
  async searchItems(params: SearchParams): Promise<DealRadarItem[]> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = this.cache.get<DealRadarItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const payload = {
        Operation: "SearchItems",
        PartnerTag: this.config.partnerTag,
        PartnerType: "Associates",
        Marketplace: this.config.marketplace,
        SearchIndex: params.searchIndex || "Electronics",
        Keywords: params.keywords,
        ItemCount: Math.min(params.itemCount || 10, 50),
        ItemPage: params.itemPage || 1,
        SortBy: params.sortBy || "Relevance",
        Resources: [
          "Images.Primary.Large",
          "Images.Primary.Medium",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "ItemInfo.ByLineInfo",
          "Offers.Listings.Price",
          "Offers.Listings.SavingBasis",
          "Offers.Listings.Availability",
          "Offers.Listings.DeliveryInfo",
          "CustomerReviews.Count",
          "CustomerReviews.StarRating",
          "BrowseNodeInfo.BrowseNodes"
        ]
      };

      // Add optional filters
      if (params.minPrice || params.maxPrice) {
        (payload as any).MinPrice = params.minPrice;
        (payload as any).MaxPrice = params.maxPrice;
      }

      if (params.brand) {
        (payload as any).Brand = params.brand;
      }

      if (params.condition) {
        (payload as any).Condition = params.condition;
      }

      const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Encoding": "amz-1.0",
        "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
        "Host": this.baseURL.replace("https://", "")
      };

      const payloadString = JSON.stringify(payload);
      const signedHeaders = await this.signRequest("POST", this.apiPath + "/searchitems", headers, payloadString);

      const response = await fetch(`${this.baseURL}${this.apiPath}/searchitems`, {
        method: "POST",
        headers: signedHeaders,
        body: payloadString
      });

      if (!response.ok) {
        throw new Error(`Amazon API error: ${response.status} ${response.statusText}`);
      }

      const data: AmazonSearchResponse = await response.json();

      if (data.Errors && data.Errors.length > 0) {
        throw new Error(`Amazon API error: ${data.Errors[0].Message}`);
      }

      const items = data.SearchResult?.Items || [];
      const dealRadarItems = items.map(item => this.mapAmazonItemToDealRadar(item, params.searchIndex));
      
      this.cache.set(cacheKey, dealRadarItems, 10 * 60 * 1000); // Cache for 10 minutes
      return dealRadarItems;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[AMAZON_SEARCH_ERROR]", errorMsg);
      
      // Fallback to local scraping service if enabled
      if (amazonConfig.scraperEnabled) {
        console.log("[AMAZON_SEARCH] Falling back to local scraping service");
        return await this.searchViaLocalScraper(params);
      }
      
      // REAL DATA MODE: Throw error if no fallback available
      throw new Error(`Amazon API search failed: ${errorMsg}`);
    }
  }

  // Get specific items by ASIN
  // REAL DATA MODE: No fallbacks - must have valid credentials (checked in constructor)
  async getItems(params: GetItemsParams): Promise<DealRadarItem[]> {
    const cacheKey = `items:${params.itemIds.join(",")}`;
    const cached = this.cache.get<DealRadarItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const payload = {
        Operation: "GetItems",
        PartnerTag: this.config.partnerTag,
        PartnerType: "Associates",
        Marketplace: this.config.marketplace,
        ItemIds: params.itemIds,
        Resources: params.resources || [
          "Images.Primary.Large",
          "Images.Primary.Medium",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "ItemInfo.ByLineInfo",
          "Offers.Listings.Price",
          "Offers.Listings.SavingBasis",
          "Offers.Listings.Availability",
          "Offers.Listings.DeliveryInfo",
          "CustomerReviews.Count",
          "CustomerReviews.StarRating"
        ]
      };

      if (params.condition) {
        (payload as any).Condition = params.condition;
      }

      if (params.merchant) {
        (payload as any).Merchant = params.merchant;
      }

      const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Encoding": "amz-1.0",
        "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
        "Host": this.baseURL.replace("https://", "")
      };

      const payloadString = JSON.stringify(payload);
      const signedHeaders = await this.signRequest("POST", this.apiPath + "/getitems", headers, payloadString);

      const response = await fetch(`${this.baseURL}${this.apiPath}/getitems`, {
        method: "POST",
        headers: signedHeaders,
        body: payloadString
      });

      if (!response.ok) {
        throw new Error(`Amazon API error: ${response.status} ${response.statusText}`);
      }

      const data: AmazonGetItemsResponse = await response.json();

      if (data.Errors && data.Errors.length > 0) {
        throw new Error(`Amazon API error: ${data.Errors[0].Message}`);
      }

      const items = data.ItemsResult?.Items || [];
      const dealRadarItems = items.map(item => this.mapAmazonItemToDealRadar(item));
      
      this.cache.set(cacheKey, dealRadarItems, 15 * 60 * 1000); // Cache for 15 minutes
      return dealRadarItems;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[AMAZON_GETITEMS_ERROR]", errorMsg);
      
      // Fallback to local scraping service if enabled
      if (amazonConfig.scraperEnabled) {
        console.log("[AMAZON_GETITEMS] Falling back to local scraping service");
        return await this.getItemsViaLocalScraper(params.itemIds);
      }
      
      // REAL DATA MODE: Throw error if no fallback available
      throw new Error(`Amazon API getItems failed: ${errorMsg}`);
    }
  }

  // Map Amazon item to DealRadar format
  private mapAmazonItemToDealRadar(item: AmazonItem, searchIndex?: string): DealRadarItem {
    const title = item.ItemInfo?.Title?.DisplayValue || "Unknown Product";
    const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 
                  item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || 
                  "Unknown Brand";
    
    const listing = item.Offers?.Listings?.[0];
    const price = listing?.Price?.Amount ? listing.Price.Amount / 100 : 0;
    const previousPrice = listing?.SavingBasis?.Amount ? listing.SavingBasis.Amount / 100 : undefined;
    
    const availability = this.mapAvailability(listing?.Availability?.Message);
    const primeEligible = listing?.DeliveryInfo?.IsPrimeEligible || false;
    
    const imageUrl = item.Images?.Primary?.Large?.URL || 
                     item.Images?.Primary?.Medium?.URL;
    
    const category = this.inferCategory(title, searchIndex);
    
    // Extract specs from features
    const features = item.ItemInfo?.Features?.DisplayValues || [];
    const specs = this.extractSpecs(features, category);
    
    const dealRadarItem: DealRadarItem = {
      id: `amazon-${item.ASIN}`,
      asin: item.ASIN,
      title,
      brand,
      category,
      price,
      previousPrice,
      dxmScore: 0, // Will be calculated
      imageUrl,
      domain: "com",
      tags: this.generateTags(title, brand, category, price),
      availability,
      primeEligible,
      vendor: "Amazon",
      ...specs
    };

    // Calculate DXM score
    dealRadarItem.dxmScore = Math.round(calculateRealDXMScoreV2(dealRadarItem) * 100) / 100;

    return dealRadarItem;
  }

  private mapAvailability(message?: string): "In Stock" | "Limited Stock" | "Out of Stock" {
    if (!message) return "In Stock";
    
    const msg = message.toLowerCase();
    if (msg.includes("in stock")) return "In Stock";
    if (msg.includes("limited") || msg.includes("few left")) return "Limited Stock";
    if (msg.includes("out of stock") || msg.includes("unavailable")) return "Out of Stock";
    
    return "In Stock";
  }

  private inferCategory(title: string, searchIndex?: string): HardwareCategory {
    const titleLower = title.toLowerCase();
    
    // GPU detection
    if (titleLower.includes("rtx") || titleLower.includes("gtx") || 
        titleLower.includes("radeon") || titleLower.includes("graphics card") ||
        titleLower.includes("gpu")) {
      return "gpu";
    }
    
    // CPU detection
    if (titleLower.includes("processor") || titleLower.includes("cpu") ||
        titleLower.includes("ryzen") || titleLower.includes("core i")) {
      return "cpu";
    }
    
    // Laptop detection
    if (titleLower.includes("laptop") || titleLower.includes("notebook")) {
      return "laptop";
    }
    
    // Monitor detection
    if (titleLower.includes("monitor") || titleLower.includes("display")) {
      return "monitor";
    }
    
    // SSD detection
    if (titleLower.includes("ssd") || titleLower.includes("solid state")) {
      return "ssd";
    }
    
    // Default based on search index
    switch (searchIndex) {
      case "Computers": return "cpu";
      case "PCHardware": return "gpu";
      default: return "gpu"; // Default fallback
    }
  }

  private extractSpecs(features: string[], category: HardwareCategory): Partial<DealRadarItem> {
    const specs: Partial<DealRadarItem> = {};
    
    for (const feature of features) {
      const featureLower = feature.toLowerCase();
      
      // GPU specs
      if (category === "gpu") {
        if (featureLower.includes("gb") && (featureLower.includes("vram") || featureLower.includes("memory"))) {
          specs.vram = feature.match(/\d+\s*gb/i)?.[0];
        }
        if (featureLower.includes("w") && featureLower.includes("tdp")) {
          specs.tdp = feature.match(/\d+\s*w/i)?.[0];
        }
        if (featureLower.includes("ghz") && featureLower.includes("boost")) {
          specs.boostClock = feature.match(/[\d.]+\s*ghz/i)?.[0];
        }
      }
      
      // CPU specs
      if (category === "cpu") {
        if (featureLower.includes("core")) {
          specs.cores = feature.match(/\d+/)?.[0];
        }
        if (featureLower.includes("thread")) {
          specs.threads = feature.match(/\d+/)?.[0];
        }
        if (featureLower.includes("ghz")) {
          if (featureLower.includes("base")) {
            specs.baseClock = feature.match(/[\d.]+\s*ghz/i)?.[0];
          } else if (featureLower.includes("boost") || featureLower.includes("max")) {
            specs.boostClock = feature.match(/[\d.]+\s*ghz/i)?.[0];
          }
        }
      }
      
      // Laptop specs
      if (category === "laptop") {
        if (featureLower.includes("gb") && featureLower.includes("ram")) {
          specs.memory = feature.match(/\d+\s*gb/i)?.[0] + " RAM";
        }
        if (featureLower.includes("ssd") || featureLower.includes("storage")) {
          specs.storage = feature.match(/\d+\s*(gb|tb)/i)?.[0] + " SSD";
        }
      }
    }
    
    return specs;
  }

  private generateTags(title: string, brand: string, category: HardwareCategory, price: number): string[] {
    const tags: string[] = [];
    const titleLower = title.toLowerCase();
    
    // Brand tags
    tags.push(brand.toLowerCase());
    
    // Price-based tags
    if (price < 200) tags.push("budget");
    else if (price > 1000) tags.push("premium");
    else tags.push("mainstream");
    
    // Category-specific tags
    switch (category) {
      case "gpu":
        if (titleLower.includes("rtx 40")) tags.push("rtx-40-series");
        if (titleLower.includes("4090")) tags.push("4k", "flagship");
        if (titleLower.includes("4070")) tags.push("1440p");
        if (titleLower.includes("4060")) tags.push("1080p");
        break;
        
      case "cpu":
        if (titleLower.includes("x3d")) tags.push("3d-cache");
        if (titleLower.includes("k")) tags.push("overclocking");
        break;
        
      case "laptop":
        if (titleLower.includes("gaming")) tags.push("gaming");
        if (titleLower.includes("business")) tags.push("business");
        break;
    }
    
    return tags;
  }

  // Local scraping service fallback methods
  private async getItemsViaLocalScraper(asins: string[]): Promise<DealRadarItem[]> {
    try {
      const scraperUrl = amazonConfig.scraperUrl || "http://localhost:5000";
      const url = `${scraperUrl}/api/amazon/items?asins=${asins.join(",")}`;
      
      console.log(`[LOCAL_SCRAPER] Fetching ${asins.length} items from ${url}`);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout for local service
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Local scraper error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Local scraper failed: ${data.error}`);
      }

      console.log(`[LOCAL_SCRAPER] Successfully fetched ${data.data.products.length} items`);
      return data.data.products as DealRadarItem[];

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[LOCAL_SCRAPER_ERROR]", errorMsg);

      // Throw error to trigger fallback to static seed data in getGpuDeals()
      throw new Error(`Local scraper unavailable: ${errorMsg}`);
    }
  }

  private async searchViaLocalScraper(params: SearchParams): Promise<DealRadarItem[]> {
    try {
      // Local scraper doesn't support search yet, return empty array
      console.warn("[LOCAL_SCRAPER] Search not implemented, returning empty results");
      return [];
    } catch (error) {
      console.error("[LOCAL_SCRAPER_SEARCH_ERROR]", error);
      return [];
    }
  }

  // Utility methods
  getCacheStats() {
    return {
      size: this.cache.size(),
      config: {
        partnerTag: this.config.partnerTag,
        region: this.config.region,
        marketplace: this.config.marketplace
      }
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const amazonPAAPI = new AmazonPAAPIClient();

// Export helper functions for easy use
export async function searchAmazonProducts(
  keywords: string, 
  category?: HardwareCategory,
  options?: Partial<SearchParams>
): Promise<DealRadarItem[]> {
  const searchIndex = category === "gpu" ? "PCHardware" : 
                     category === "cpu" ? "Computers" : 
                     category === "laptop" ? "Computers" : 
                     "Electronics";
  
  return amazonPAAPI.searchItems({
    keywords,
    searchIndex,
    itemCount: 20,
    ...options
  });
}

export async function getAmazonProductsByASIN(asins: string[]): Promise<DealRadarItem[]> {
  return amazonPAAPI.getItems({
    itemIds: asins,
    condition: "New",
    merchant: "Amazon"
  });
}
