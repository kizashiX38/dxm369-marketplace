// src/lib/buyingGuideGenerator.ts
// DXM369 Buying Guide Generator
// Creates category-specific buying guides with educational content and affiliate links

export interface BuyingGuideSection {
  id: string;
  title: string;
  content: string;
  tips?: string[];
}

export interface BuyingGuideConfig {
  category: string;
  categoryDisplayName: string;
  introduction: string;
  keyConsiderations: Array<{
    title: string;
    description: string;
    tip: string;
  }>;
  budgetTiers: Array<{
    name: string;
    priceRange: string;
    useCase: string;
    expectations: string[];
  }>;
  commonMistakes: string[];
  bestPractices: string[];
  relatedGuides?: Array<{
    title: string;
    url: string;
  }>;
}

// Buying guide templates for each category
export const BUYING_GUIDE_TEMPLATES: Record<string, BuyingGuideConfig> = {
  gpu: {
    category: "gpu",
    categoryDisplayName: "Graphics Card",
    introduction: "Choosing the right GPU depends on your gaming resolution, refresh rate targets, and budget. This guide helps you understand key specifications and make an informed decision.",
    keyConsiderations: [
      {
        title: "Target Resolution & FPS",
        description: "Your gaming resolution (1080p, 1440p, 4K) and desired frame rates (60, 120, 144 FPS) determine GPU requirements.",
        tip: "1080p: RTX 4060 / RTX 4070 | 1440p: RTX 4070 / 4070 Super | 4K: RTX 4080 / 4090"
      },
      {
        title: "VRAM Amount",
        description: "VRAM capacity affects texture quality and multitasking. Modern games need 8GB minimum, 12GB+ recommended.",
        tip: "8GB for 1080p, 12GB for 1440p, 16GB+ for 4K or content creation"
      },
      {
        title: "Power Requirements",
        description: "Ensure your PSU has enough wattage and connectors. Check the GPU's TDP and total system power draw.",
        tip: "Add 200W headroom. RTX 4070 (~200W) needs 650W PSU minimum"
      },
      {
        title: "Heat & Cooling",
        description: "GPUs generate significant heat. Monitor temperatures during gaming and ensure adequate case airflow.",
        tip: "Optimal temps: 60-75°C while gaming. Above 80°C indicates cooling issues"
      }
    ],
    budgetTiers: [
      {
        name: "Budget ($150-300)",
        priceRange: "$150-300",
        useCase: "Esports gaming, 1080p, budget builds",
        expectations: ["RTX 4060 / RX 7600", "60+ FPS 1080p High", "Newer titles at reduced settings"]
      },
      {
        name: "Mid-Range ($400-700)",
        priceRange: "$400-700",
        useCase: "1440p gaming, general gaming",
        expectations: ["RTX 4070 / RTX 4070 Super", "100+ FPS 1440p High", "Future-proof for 2-3 years"]
      },
      {
        name: "High-End ($800-1200)",
        priceRange: "$800-1200",
        useCase: "4K gaming, streaming, content creation",
        expectations: ["RTX 4080 / 4090", "60+ FPS 4K Ultra", "Content creation workloads"]
      },
      {
        name: "Professional ($1200+)",
        priceRange: "$1200+",
        useCase: "Professional rendering, AI, workstations",
        expectations: ["RTX 4090 / Professional cards", "Maximum performance", "VRAM for large datasets"]
      }
    ],
    commonMistakes: [
      "Buying more VRAM than needed for gaming performance",
      "Ignoring power supply capacity requirements",
      "Choosing based on raw specs without considering driver quality",
      "Not accounting for monitor refresh rate compatibility",
      "Upgrading GPU when CPU is actually the bottleneck"
    ],
    bestPractices: [
      "Match GPU to your monitor's capabilities (refresh rate, resolution)",
      "Check driver stability reviews before purchasing",
      "Leave 20-30% PSU headroom for stability",
      "Use benchmarks for your specific resolution and games",
      "Consider future-proofing for games 2-3 years ahead"
    ],
    relatedGuides: [
      { title: "CPU Buying Guide", url: "/cpus" },
      { title: "PSU Sizing Calculator", url: "/power-supplies" },
      { title: "PC Building Guide", url: "/builds" }
    ]
  },

  cpu: {
    category: "cpu",
    categoryDisplayName: "Processor",
    introduction: "CPU selection depends on whether you prioritize gaming, productivity, or both. Learn what specs matter and how to choose between Intel and AMD.",
    keyConsiderations: [
      {
        title: "Gaming vs Productivity",
        description: "Gaming favors single-thread performance; productivity workloads benefit from more cores.",
        tip: "Gaming: Focus on single-thread speed | Streaming: Need 12+ cores"
      },
      {
        title: "Core & Thread Count",
        description: "More cores help multitasking and content creation. Gaming needs 6-8 cores; streaming/4K needs 12+.",
        tip: "8-core CPUs are the sweet spot for balanced gaming in 2025"
      },
      {
        title: "Clock Speed (GHz)",
        description: "Higher clock speeds improve single-thread performance and gaming frame rates.",
        tip: "Look for boost clocks 4.8GHz+. Base clock less important than boost"
      },
      {
        title: "Socket & Compatibility",
        description: "CPU socket must match motherboard. Verify compatibility before purchasing.",
        tip: "Intel LGA1700, AMD AM5 most common in 2025"
      }
    ],
    budgetTiers: [
      {
        name: "Budget ($150-250)",
        priceRange: "$150-250",
        useCase: "Esports gaming, light work",
        expectations: ["i5-14600K / Ryzen 5 7600", "High FPS at 1080p", "Entry-level workloads"]
      },
      {
        name: "Mid-Range ($300-500)",
        priceRange: "$300-500",
        useCase: "1440p gaming, content creation",
        expectations: ["i7-14700K / Ryzen 7 7700X", "High FPS 1440p", "Streaming capable"]
      },
      {
        name: "High-End ($600+)",
        priceRange: "$600+",
        useCase: "Professional workflows, 4K streaming",
        expectations: ["i9-14900K / Ryzen 9 7950X", "Maximum multitasking", "Professional workloads"]
      }
    ],
    commonMistakes: [
      "Buying a CPU that bottlenecks with your GPU",
      "Overemphasizing core count for gaming-only use",
      "Ignoring integrated graphics quality (important for troubleshooting)",
      "Not considering upgrade path for future generations",
      "Focusing on base clock instead of boost clock"
    ],
    bestPractices: [
      "Match CPU tier with your GPU for balanced performance",
      "Check single-thread benchmarks for gaming performance",
      "Verify motherboard compatibility before purchasing",
      "Consider thermal design - higher-end CPUs run hotter",
      "Plan for cooling solution upfront (stock coolers often insufficient)"
    ],
    relatedGuides: [
      { title: "GPU Buying Guide", url: "/gpus" },
      { title: "Motherboard Selection", url: "/motherboards" },
      { title: "CPU Comparison Tool", url: "/ryzen-7-7700x-vs-i7-14700k" }
    ]
  },

  laptop: {
    category: "laptop",
    categoryDisplayName: "Laptop",
    introduction: "Gaming laptop selection involves balancing performance, portability, and price. This guide helps you find the right balance for your needs.",
    keyConsiderations: [
      {
        title: "GPU & Gaming Performance",
        description: "Discrete GPU (RTX 4060+) is essential for gaming. Integrated graphics struggle with modern titles.",
        tip: "RTX 4070 minimum for 1440p gaming; RTX 4080 for 4K on laptops"
      },
      {
        title: "Display Quality",
        description: "Refresh rate (144Hz+), panel type (IPS for color, TN for speed), and resolution impact gaming experience.",
        tip: "15.6\" 1440p 144Hz or 16\" 1440p 165Hz optimal for gaming"
      },
      {
        title: "Processor & RAM",
        description: "Modern gaming laptops should have 16GB+ RAM and current-generation CPUs (Intel 14th, AMD Ryzen 9000).",
        tip: "16GB DDR5 standard; 32GB for content creation and streaming"
      },
      {
        title: "Thermals & Noise",
        description: "Gaming laptops generate heat. Check reviews for thermal throttling and fan noise.",
        tip: "Sustained gaming temps should stay below 85°C"
      }
    ],
    budgetTiers: [
      {
        name: "Budget ($900-1200)",
        priceRange: "$900-1200",
        useCase: "Entry gaming, casual multiplayer",
        expectations: ["RTX 4050 / RTX 4060", "Esports titles 100+ FPS", "1080p high settings"]
      },
      {
        name: "Mid-Range ($1300-1800)",
        priceRange: "$1300-1800",
        useCase: "1440p gaming, everyday productivity",
        expectations: ["RTX 4070 / RTX 4070 Super", "AAA titles 60-80 FPS 1440p", "14-15.6\" form factor"]
      },
      {
        name: "Premium ($1900-2500)",
        priceRange: "$1900-2500",
        useCase: "High-refresh 1440p, content creation",
        expectations: ["RTX 4080 / RTX 4090", "High FPS 1440p 165Hz", "Professional workloads"]
      }
    ],
    commonMistakes: [
      "Choosing CPU or RAM without considering GPU limitations",
      "Ignoring thermal reviews - many gaming laptops throttle under load",
      "Selecting 60Hz displays for gaming laptops",
      "Not checking port selection (Thunderbolt, USB-C important)",
      "Underestimating weight/portability compromises"
    ],
    bestPractices: [
      "Always prioritize GPU tier for gaming laptops",
      "Look for 144Hz+ displays minimum for gaming",
      "Check professional reviews for thermals and sustained performance",
      "Verify upgrade paths (RAM, storage accessibility)",
      "Consider external cooling pad if moving between locations"
    ],
    relatedGuides: [
      { title: "Desktop vs Laptop", url: "/builds" },
      { title: "Best Gaming Laptops", url: "/best-laptop-deals" },
      { title: "Laptop Comparison", url: "/corsair-vengeance-vs-gskill-trident-z5" }
    ]
  },

  ssd: {
    category: "ssd",
    categoryDisplayName: "SSD / Storage",
    introduction: "SSDs are essential for fast boot times and game loading. Learn which speed class you need and top brands to trust.",
    keyConsiderations: [
      {
        title: "NVMe vs SATA",
        description: "NVMe (M.2) is significantly faster than SATA. NVMe is now standard for gaming and new builds.",
        tip: "Choose NVMe for any new build; SATA only for budget or secondary drives"
      },
      {
        title: "PCIe Generation (3.0 vs 4.0 vs 5.0)",
        description: "PCIe 4.0 (5,000+ MB/s) is ideal for gaming. PCIe 3.0 adequate but aging. PCIe 5.0 future-proofing.",
        tip: "PCIe 4.0 3,500+ MB/s sufficient for gaming; PCIe 5.0 for future-proofing"
      },
      {
        title: "Capacity Planning",
        description: "OS takes ~30GB. Modern AAA games 50-150GB each. Plan for future growth.",
        tip: "1TB minimum; 2TB recommended for gaming; 4TB+ for heavy gamers"
      },
      {
        title: "Cache & DRAM",
        description: "DRAM cache improves sustained performance. SLC cache helps during thermal throttling.",
        tip: "DRAM-based caches preferred over DRAMless for consistent performance"
      }
    ],
    budgetTiers: [
      {
        name: "Budget ($40-80)",
        priceRange: "$40-80 (1TB)",
        useCase: "OS + light gaming, secondary drive",
        expectations: ["PCIe 3.0 NVMe", "3,500 MB/s reads", "QLC or DRAMless"]
      },
      {
        name: "Mid-Range ($80-150)",
        priceRange: "$80-150 (1TB)",
        useCase: "Gaming library, everyday use",
        expectations: ["PCIe 4.0 NVMe", "5,000+ MB/s", "TLC with DRAM cache"]
      },
      {
        name: "Premium ($150-250)",
        priceRange: "$150-250 (1TB)",
        useCase: "Content creation, fastest speeds",
        expectations: ["PCIe 5.0 NVMe", "7,000+ MB/s", "Professional-grade reliability"]
      }
    ],
    commonMistakes: [
      "Buying PCIe 5.0 for gaming-only use (no performance benefit yet)",
      "Ignoring capacity - games fill drives faster than expected",
      "Not checking compatibility with motherboard (some boards limited to PCIe 4.0)",
      "Choosing budget SSDs without DRAM cache",
      "Overlooking thermal throttling issues in dense enclosures"
    ],
    bestPractices: [
      "Start with 1TB minimum; add 2TB if budget allows",
      "PCIe 4.0 optimal performance-to-cost ratio for 2025",
      "Check motherboard specs - not all support PCIe 5.0",
      "Install heatsinks for M.2 slots in PS5, consoles if applicable",
      "Keep 20% capacity free to maintain performance"
    ],
    relatedGuides: [
      { title: "Gaming PC Builds", url: "/builds" },
      { title: "Best SSD Deals", url: "/best-ssd-deals" },
      { title: "Storage Comparison", url: "/samsung-990-pro-vs-wd-black-sn850x" }
    ]
  },

  ram: {
    category: "ram",
    categoryDisplayName: "Memory / RAM",
    introduction: "RAM speed and capacity significantly impact gaming and multitasking performance. Learn what specs matter for your use case.",
    keyConsiderations: [
      {
        title: "DDR4 vs DDR5",
        description: "DDR5 is faster but more expensive. DDR4 remains excellent for gaming. Choose based on motherboard generation.",
        tip: "Intel 13th+ / AMD Ryzen 7000+ use DDR5; older platforms use DDR4"
      },
      {
        title: "Capacity (GB)",
        description: "16GB is standard for 2025 gaming. 32GB for streaming, content creation, or heavy multitasking.",
        tip: "16GB perfect for gaming; 32GB if streaming or rendering; 64GB+ for professional work"
      },
      {
        title: "Speed (MHz)",
        description: "DDR4: 3200-3600MHz optimal. DDR5: 5600MHz+ recommended. Higher speeds improve gaming FPS.",
        tip: "Speed impact on gaming: 2-8 FPS difference between slow and fast RAM"
      },
      {
        title: "Latency (CAS)",
        description: "Lower latency (CAS 18 vs CAS 22) = better responsive feel. Gaming: CAS 20 or lower.",
        tip: "Latency matters less than speed for most games; only noticeable to enthusiasts"
      }
    ],
    budgetTiers: [
      {
        name: "Budget ($50-100)",
        priceRange: "$50-100 (16GB)",
        useCase: "Gaming, budget builds",
        expectations: ["DDR4 3200MHz / DDR5 5600MHz", "Standard latency", "Reliable brands"]
      },
      {
        name: "Mid-Range ($100-180)",
        priceRange: "$100-180 (16GB)",
        useCase: "Gaming + streaming, content creation",
        expectations: ["DDR4 3600MHz / DDR5 6000MHz", "CAS 18", "RGB lighting optional"]
      },
      {
        name: "Premium ($180+)",
        priceRange: "$180+ (16GB)",
        useCase: "Overclocking, professional workloads",
        expectations: ["DDR5 6400MHz+", "CAS 16-18", "Tight timings"]
      }
    ],
    commonMistakes: [
      "Buying DDR5 when DDR4 platform available (wasting money)",
      "Getting high-speed RAM with mismatched CPU/MB capabilities",
      "Assuming more MHz = significantly better gaming performance",
      "Not checking XMP/DOCP compatibility before purchasing",
      "Buying single-channel (8GB) when dual-channel (2×8GB) available"
    ],
    bestPractices: [
      "Buy dual-channel (2 sticks) always for performance",
      "Verify XMP/DOCP support on motherboard",
      "DDR4 3600MHz CAS 18 or DDR5 5600MHz CAS 20 sweet spot for price",
      "RGB lighting is cosmetic - don't pay premium for it",
      "Same brand and model for dual-channel reliability"
    ],
    relatedGuides: [
      { title: "CPU Buying Guide", url: "/cpus" },
      { title: "PC Building Guide", url: "/builds" },
      { title: "RAM Comparison", url: "/corsair-vengeance-vs-gskill-trident-z5" }
    ]
  }
};

export function generateBuyingGuideContent(config: BuyingGuideConfig) {
  return {
    introduction: config.introduction,
    keyConsiderations: config.keyConsiderations,
    budgetTiers: config.budgetTiers,
    commonMistakes: config.commonMistakes,
    bestPractices: config.bestPractices,
    relatedGuides: config.relatedGuides || []
  };
}

export function getBuyingGuideByCategory(category: string): BuyingGuideConfig | null {
  const normalizedCategory = category.toLowerCase().replace(/s$/, ''); // Remove trailing 's'
  return BUYING_GUIDE_TEMPLATES[normalizedCategory] || null;
}
