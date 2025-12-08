// src/lib/categories/laptop.ts
// Laptop-specific scoring logic and performance indices for DXM v2
// Modular category support for laptops

import { DXMScoreInputs, calculateDXMScoreV2 } from '@/lib/dxmScoring';

// Laptop Performance Database with v2 precision
export const LAPTOP_PERFORMANCE_DATABASE = {
  // Gaming Laptops - High Performance
  'RTX 4090 Laptop': {
    perfIndex: 95.0,
    tdp: 175,
    segment: 'gaming',
    cpuTier: 'high-end',
    gpuTier: 'flagship',
    expectedPrice: 3500,
    batteryScore: 4.0,
    buildQuality: 8.5
  },
  'RTX 4080 Laptop': {
    perfIndex: 85.0,
    tdp: 150,
    segment: 'gaming',
    cpuTier: 'high-end',
    gpuTier: 'high-end',
    expectedPrice: 2800,
    batteryScore: 5.0,
    buildQuality: 8.0
  },
  'RTX 4070 Laptop': {
    perfIndex: 75.0,
    tdp: 140,
    segment: 'gaming',
    cpuTier: 'mainstream',
    gpuTier: 'high-end',
    expectedPrice: 2200,
    batteryScore: 6.0,
    buildQuality: 7.5
  },
  'RTX 4060 Laptop': {
    perfIndex: 65.0,
    tdp: 115,
    segment: 'gaming',
    cpuTier: 'mainstream',
    gpuTier: 'mainstream',
    expectedPrice: 1600,
    batteryScore: 7.0,
    buildQuality: 7.0
  },
  'RTX 4050 Laptop': {
    perfIndex: 55.0,
    tdp: 95,
    segment: 'mainstream',
    cpuTier: 'mainstream',
    gpuTier: 'budget',
    expectedPrice: 1200,
    batteryScore: 8.0,
    buildQuality: 6.5
  },

  // AMD Gaming Laptops
  'RX 7600M XT': {
    perfIndex: 70.0,
    tdp: 120,
    segment: 'gaming',
    cpuTier: 'mainstream',
    gpuTier: 'high-end',
    expectedPrice: 1800,
    batteryScore: 6.5,
    buildQuality: 7.0
  },
  'RX 7700S': {
    perfIndex: 68.0,
    tdp: 100,
    segment: 'gaming',
    cpuTier: 'mainstream',
    gpuTier: 'mainstream',
    expectedPrice: 1600,
    batteryScore: 7.5,
    buildQuality: 7.0
  },

  // Workstation Laptops
  'RTX A5000 Laptop': {
    perfIndex: 80.0,
    tdp: 165,
    segment: 'workstation',
    cpuTier: 'high-end',
    gpuTier: 'workstation',
    expectedPrice: 4000,
    batteryScore: 5.0,
    buildQuality: 9.0
  },
  'RTX A4000 Laptop': {
    perfIndex: 70.0,
    tdp: 140,
    segment: 'workstation',
    cpuTier: 'high-end',
    gpuTier: 'workstation',
    expectedPrice: 3200,
    batteryScore: 6.0,
    buildQuality: 8.5
  },

  // Integrated Graphics / Budget
  'Intel Iris Xe': {
    perfIndex: 35.0,
    tdp: 15,
    segment: 'budget',
    cpuTier: 'mainstream',
    gpuTier: 'integrated',
    expectedPrice: 800,
    batteryScore: 9.0,
    buildQuality: 6.0
  },
  'AMD Radeon 780M': {
    perfIndex: 40.0,
    tdp: 20,
    segment: 'mainstream',
    cpuTier: 'mainstream',
    gpuTier: 'integrated',
    expectedPrice: 900,
    batteryScore: 8.5,
    buildQuality: 6.5
  },
  'Intel Arc A370M': {
    perfIndex: 45.0,
    tdp: 50,
    segment: 'mainstream',
    cpuTier: 'mainstream',
    gpuTier: 'budget',
    expectedPrice: 1000,
    batteryScore: 7.5,
    buildQuality: 6.5
  }
};

// Laptop brand reputation with build quality focus
const LAPTOP_BRAND_REPUTATION: Record<string, number> = {
  'APPLE': 0.98,      // MacBooks - premium build quality
  'THINKPAD': 0.95,   // Business-grade reliability
  'LENOVO': 0.88,     // Good overall, varies by line
  'DELL': 0.85,       // XPS premium, others average
  'HP': 0.82,         // Spectre/Envy good, others average
  'ASUS': 0.90,       // ROG/ZenBook excellent
  'MSI': 0.87,        // Gaming focus, good build
  'ACER': 0.75,       // Budget-focused, mixed quality
  'RAZER': 0.88,      // Premium gaming, good build
  'ALIENWARE': 0.85,  // Gaming premium but heavy
  'GIGABYTE': 0.82,   // Gaming focus, decent build
  'FRAMEWORK': 0.92,  // Modular, excellent concept
  'SYSTEM76': 0.85,   // Linux-focused, good build
  'ORIGIN': 0.88,     // Custom gaming laptops
  'UNKNOWN': 0.70
};

/**
 * Extract laptop GPU from title
 */
export function extractLaptopGPU(title: string): string | null {
  const gpuModels = Object.keys(LAPTOP_PERFORMANCE_DATABASE);
  const normalizedTitle = title.toUpperCase();
  
  // Sort by specificity
  const sortedModels = gpuModels.sort((a, b) => b.length - a.length);
  
  for (const model of sortedModels) {
    if (normalizedTitle.includes(model.toUpperCase())) {
      return model;
    }
    
    // Handle variations like "RTX4070" vs "RTX 4070"
    const compactModel = model.replace(/\s+/g, '');
    if (normalizedTitle.replace(/\s+/g, '').includes(compactModel.toUpperCase())) {
      return model;
    }
  }
  
  return null;
}

/**
 * Extract laptop specifications from title
 */
export function extractLaptopSpecs(title: string): {
  screenSize?: number;
  resolution?: string;
  refreshRate?: number;
  ram?: number;
  storage?: number;
  storageType?: string;
} {
  const specs: any = {};
  
  // Screen size (e.g., "15.6", "17.3")
  const screenMatch = title.match(/(\d{2}\.?\d?)["\s]?inch|(\d{2}\.?\d?)"|\b(\d{2}\.?\d?)\s*inch/i);
  if (screenMatch) {
    specs.screenSize = parseFloat(screenMatch[1] || screenMatch[2] || screenMatch[3]);
  }
  
  // Resolution
  if (title.includes('4K') || title.includes('3840x2160')) {
    specs.resolution = '4K';
  } else if (title.includes('QHD') || title.includes('2560x1440')) {
    specs.resolution = 'QHD';
  } else if (title.includes('FHD') || title.includes('1920x1080')) {
    specs.resolution = 'FHD';
  }
  
  // Refresh rate
  const refreshMatch = title.match(/(\d{2,3})Hz/i);
  if (refreshMatch) {
    specs.refreshRate = parseInt(refreshMatch[1]);
  }
  
  // RAM (e.g., "16GB", "32GB")
  const ramMatch = title.match(/(\d{1,2})GB\s*RAM|(\d{1,2})GB\s*DDR/i);
  if (ramMatch) {
    specs.ram = parseInt(ramMatch[1] || ramMatch[2]);
  }
  
  // Storage
  const storageMatch = title.match(/(\d{1,4})GB\s*SSD|(\d{1,2})TB\s*SSD/i);
  if (storageMatch) {
    if (storageMatch[2]) {
      specs.storage = parseInt(storageMatch[2]) * 1000; // TB to GB
    } else {
      specs.storage = parseInt(storageMatch[1]);
    }
    specs.storageType = 'SSD';
  }
  
  return specs;
}

/**
 * Get comprehensive laptop data
 */
export function getLaptopData(title: string) {
  const gpu = extractLaptopGPU(title);
  const specs = extractLaptopSpecs(title);
  
  const defaultData = {
    gpu: null,
    perfIndex: 50.0,
    tdp: 65,
    segment: 'mainstream',
    expectedPrice: 1200,
    batteryScore: 7.0,
    buildQuality: 6.5,
    specs
  };
  
  if (!gpu) return defaultData;
  
  const gpuData = LAPTOP_PERFORMANCE_DATABASE[gpu as keyof typeof LAPTOP_PERFORMANCE_DATABASE];
  
  return {
    gpu,
    perfIndex: gpuData.perfIndex,
    tdp: gpuData.tdp,
    segment: gpuData.segment,
    expectedPrice: gpuData.expectedPrice,
    batteryScore: gpuData.batteryScore,
    buildQuality: gpuData.buildQuality,
    cpuTier: gpuData.cpuTier,
    gpuTier: gpuData.gpuTier,
    specs
  };
}

/**
 * Laptop segment classification
 */
export function classifyLaptopSegment(title: string, price: number): string {
  const laptopData = getLaptopData(title);
  
  // Use GPU-based segment if available
  if (laptopData.gpu) {
    return laptopData.segment;
  }
  
  // Fallback to price-based classification
  if (price < 600) return 'budget';
  if (price > 2500) return 'workstation';
  if (price > 1500) return 'gaming';
  return 'mainstream';
}

/**
 * Laptop-specific DXM scoring
 */
export function calculateLaptopScore(inputs: Omit<DXMScoreInputs, 'category' | 'perfIndex' | 'tdpWatts' | 'segment'>): number {
  const laptopData = getLaptopData(inputs.title);
  
  const enhancedInputs: DXMScoreInputs = {
    ...inputs,
    category: 'laptop',
    perfIndex: laptopData.perfIndex,
    tdpWatts: laptopData.tdp,
    segment: classifyLaptopSegment(inputs.title, inputs.currentPrice),
    brandReputation: getBrandReputation(inputs.brand),
  };
  
  const result = calculateDXMScoreV2(enhancedInputs);
  let adjustedScore = result.dxmValueScore;
  
  // Laptop-specific adjustments
  
  // Battery life bonus (important for laptops)
  const batteryBonus = (laptopData.batteryScore - 5.0) * 0.1; // -0.5 to +0.4
  adjustedScore += batteryBonus;
  
  // Build quality bonus
  const buildBonus = (laptopData.buildQuality - 6.0) * 0.15; // -0.3 to +0.45
  adjustedScore += buildBonus;
  
  // Screen quality bonus
  if (laptopData.specs.resolution === '4K') {
    adjustedScore += 0.20;
  } else if (laptopData.specs.resolution === 'QHD') {
    adjustedScore += 0.10;
  }
  
  // High refresh rate bonus for gaming laptops
  if (laptopData.segment === 'gaming' && laptopData.specs.refreshRate && laptopData.specs.refreshRate >= 144) {
    adjustedScore += 0.15;
  }
  
  // RAM adequacy check
  if (laptopData.specs.ram) {
    if (laptopData.specs.ram >= 32) {
      adjustedScore += 0.15; // Excellent RAM
    } else if (laptopData.specs.ram >= 16) {
      adjustedScore += 0.10; // Good RAM
    } else if (laptopData.specs.ram < 8) {
      adjustedScore -= 0.20; // Insufficient RAM penalty
    }
  }
  
  // SSD bonus
  if (laptopData.specs.storageType === 'SSD') {
    adjustedScore += 0.10;
  }
  
  return Math.min(Math.round(adjustedScore * 100) / 100, 10.00);
}

/**
 * Laptop brand reputation
 */
function getBrandReputation(brand: string): number {
  const brandUpper = brand?.toUpperCase() || '';
  
  // Check for specific laptop lines
  if (brandUpper.includes('THINKPAD')) return 0.95;
  if (brandUpper.includes('MACBOOK')) return 0.98;
  if (brandUpper.includes('XPS')) return 0.92;
  if (brandUpper.includes('SPECTRE')) return 0.88;
  if (brandUpper.includes('ZENBOOK')) return 0.90;
  if (brandUpper.includes('ROG')) return 0.92;
  if (brandUpper.includes('ALIENWARE')) return 0.85;
  
  return LAPTOP_BRAND_REPUTATION[brandUpper] || 0.70;
}

/**
 * Laptop use case recommendations
 */
export function getLaptopRecommendations(
  budget: number,
  useCase: 'budget' | 'productivity' | 'gaming' | 'workstation' | 'ultrabook'
): string[] {
  const useCaseToSegment = {
    'budget': 'budget',
    'productivity': 'mainstream',
    'gaming': 'gaming',
    'workstation': 'workstation',
    'ultrabook': 'mainstream'
  };
  
  const targetSegment = useCaseToSegment[useCase];
  
  let candidates = Object.entries(LAPTOP_PERFORMANCE_DATABASE)
    .filter(([_, data]) => 
      data.segment === targetSegment && 
      data.expectedPrice <= budget * 1.3
    );
  
  // Use case specific filtering
  if (useCase === 'ultrabook') {
    // Prefer integrated graphics and good battery life
    candidates = candidates.filter(([_, data]) => 
      data.batteryScore >= 8.0 && data.gpuTier === 'integrated'
    );
  } else if (useCase === 'gaming') {
    // Prefer dedicated graphics
    candidates = candidates.filter(([_, data]) => 
      data.gpuTier !== 'integrated'
    );
  }
  
  return candidates
    .sort((a, b) => {
      // Sort by value (performance per dollar)
      const aValue = a[1].perfIndex / a[1].expectedPrice;
      const bValue = b[1].perfIndex / b[1].expectedPrice;
      return bValue - aValue;
    })
    .slice(0, 5)
    .map(([model]) => model);
}

/**
 * Laptop market analysis
 */
export function getLaptopMarketPosition(gpu: string): {
  tier: string;
  competitorsInTier: string[];
  priceRange: { min: number; max: number };
} {
  const data = LAPTOP_PERFORMANCE_DATABASE[gpu as keyof typeof LAPTOP_PERFORMANCE_DATABASE];
  if (!data) {
    return {
      tier: 'unknown',
      competitorsInTier: [],
      priceRange: { min: 0, max: 0 }
    };
  }
  
  const perfIndex = data.perfIndex;
  const segment = data.segment;
  
  const competitors = Object.entries(LAPTOP_PERFORMANCE_DATABASE)
    .filter(([key, value]) => 
      key !== gpu && 
      Math.abs(value.perfIndex - perfIndex) <= 10 &&
      value.segment === segment
    )
    .map(([key]) => key);
  
  const priceRanges = {
    'budget': { min: 400, max: 800 },
    'mainstream': { min: 700, max: 1500 },
    'gaming': { min: 1200, max: 3000 },
    'workstation': { min: 2000, max: 5000 }
  };
  
  return {
    tier: segment,
    competitorsInTier: competitors,
    priceRange: priceRanges[segment as keyof typeof priceRanges] || { min: 0, max: 0 }
  };
}

export default {
  LAPTOP_PERFORMANCE_DATABASE,
  extractLaptopGPU,
  extractLaptopSpecs,
  getLaptopData,
  classifyLaptopSegment,
  calculateLaptopScore,
  getLaptopRecommendations,
  getLaptopMarketPosition
};
