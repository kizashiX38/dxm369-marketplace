// src/lib/categories/gpu.ts
// GPU-specific scoring logic and performance indices for DXM v2
// Modular category support for the quantitative trading engine

import { DXMScoreInputs, calculateDXMScoreV2 } from '@/lib/dxmScoring';

// Enhanced GPU Performance Index Database with v2 precision
export const GPU_PERFORMANCE_DATABASE = {
  // RTX 40 Series - Latest Generation
  'RTX 4090': {
    perfIndex: 100.0,
    tdp: 450,
    vram: 24,
    architecture: 'Ada Lovelace',
    segment: 'enthusiast',
    msrp: 1599,
    releaseDate: '2022-10-12'
  },
  'RTX 4080 SUPER': {
    perfIndex: 76.3, // Recalibrated based on 4K benchmarks vs 4090
    tdp: 320,
    vram: 16,
    architecture: 'Ada Lovelace',
    segment: '4k-flagship',
    msrp: 999,
    releaseDate: '2024-01-31'
  },
  'RTX 4080': {
    perfIndex: 82.0,
    tdp: 320,
    vram: 16,
    architecture: 'Ada Lovelace',
    segment: '4k-flagship',
    msrp: 1199,
    releaseDate: '2022-11-16'
  },
  'RTX 4070 Ti SUPER': {
    perfIndex: 75.0,
    tdp: 285,
    vram: 16,
    architecture: 'Ada Lovelace',
    segment: '1440p-high',
    msrp: 799,
    releaseDate: '2024-01-24'
  },
  'RTX 4070 Ti': {
    perfIndex: 72.0,
    tdp: 285,
    vram: 12,
    architecture: 'Ada Lovelace',
    segment: '1440p-high',
    msrp: 799,
    releaseDate: '2023-01-05'
  },
  'RTX 4070 SUPER': {
    perfIndex: 66.9, // Recalibrated based on 4K benchmarks vs 4080S
    tdp: 220,
    vram: 12,
    architecture: 'Ada Lovelace',
    segment: '1440p-high',
    msrp: 599,
    releaseDate: '2024-01-17'
  },
  'RTX 4070': {
    perfIndex: 65.0,
    tdp: 200,
    vram: 12,
    architecture: 'Ada Lovelace',
    segment: '1440p-high',
    msrp: 599,
    releaseDate: '2023-04-13'
  },
  'RTX 4060 Ti 16GB': {
    perfIndex: 58.0,
    tdp: 165,
    vram: 16,
    architecture: 'Ada Lovelace',
    segment: '1080p-mainstream',
    msrp: 499,
    releaseDate: '2023-07-18'
  },
  'RTX 4060 Ti': {
    perfIndex: 55.0,
    tdp: 165,
    vram: 8,
    architecture: 'Ada Lovelace',
    segment: '1080p-mainstream',
    msrp: 399,
    releaseDate: '2023-05-24'
  },
  'RTX 4060': {
    perfIndex: 48.0,
    tdp: 115,
    vram: 8,
    architecture: 'Ada Lovelace',
    segment: '1080p-mainstream',
    msrp: 299,
    releaseDate: '2023-06-29'
  },

  // RX 7000 Series - RDNA 3
  'RX 7900 XTX': {
    perfIndex: 78.4, // Recalibrated based on 4K benchmarks vs 4090
    tdp: 355,
    vram: 24,
    architecture: 'RDNA 3',
    segment: '4k-flagship',
    msrp: 999,
    releaseDate: '2022-12-13'
  },
  'RX 7900 XT': {
    perfIndex: 80.0,
    tdp: 315,
    vram: 20,
    architecture: 'RDNA 3',
    segment: '1440p-high',
    msrp: 899,
    releaseDate: '2022-12-13'
  },
  'RX 7800 XT': {
    perfIndex: 70.0,
    tdp: 263,
    vram: 16,
    architecture: 'RDNA 3',
    segment: '1440p-high',
    msrp: 499,
    releaseDate: '2023-09-06'
  },
  'RX 7700 XT': {
    perfIndex: 62.0,
    tdp: 245,
    vram: 12,
    architecture: 'RDNA 3',
    segment: '1440p-high',
    msrp: 449,
    releaseDate: '2023-09-06'
  },
  'RX 7600 XT': {
    perfIndex: 52.0,
    tdp: 190,
    vram: 16,
    architecture: 'RDNA 3',
    segment: '1080p-mainstream',
    msrp: 329,
    releaseDate: '2024-01-24'
  },
  'RX 7600': {
    perfIndex: 45.0,
    tdp: 165,
    vram: 8,
    architecture: 'RDNA 3',
    segment: '1080p-mainstream',
    msrp: 269,
    releaseDate: '2023-05-25'
  },

  // RTX 30 Series - Legacy but still relevant
  'RTX 3090 Ti': {
    perfIndex: 92.0,
    tdp: 450,
    vram: 24,
    architecture: 'Ampere',
    segment: 'enthusiast',
    msrp: 1999,
    releaseDate: '2022-03-29'
  },
  'RTX 3090': {
    perfIndex: 90.0,
    tdp: 350,
    vram: 24,
    architecture: 'Ampere',
    segment: 'enthusiast',
    msrp: 1499,
    releaseDate: '2020-09-24'
  },
  'RTX 3080 Ti': {
    perfIndex: 78.0,
    tdp: 350,
    vram: 12,
    architecture: 'Ampere',
    segment: '4k-flagship',
    msrp: 1199,
    releaseDate: '2021-06-03'
  },
  'RTX 3080': {
    perfIndex: 75.0,
    tdp: 320,
    vram: 10,
    architecture: 'Ampere',
    segment: '4k-flagship',
    msrp: 699,
    releaseDate: '2020-09-17'
  },
  'RTX 3070 Ti': {
    perfIndex: 65.0,
    tdp: 290,
    vram: 8,
    architecture: 'Ampere',
    segment: '1440p-high',
    msrp: 599,
    releaseDate: '2021-06-10'
  },
  'RTX 3070': {
    perfIndex: 62.0,
    tdp: 220,
    vram: 8,
    architecture: 'Ampere',
    segment: '1440p-high',
    msrp: 499,
    releaseDate: '2020-10-29'
  },
  'RTX 3060 Ti': {
    perfIndex: 55.0,
    tdp: 200,
    vram: 8,
    architecture: 'Ampere',
    segment: '1080p-mainstream',
    msrp: 399,
    releaseDate: '2020-12-02'
  },
  'RTX 3060': {
    perfIndex: 45.0,
    tdp: 170,
    vram: 12,
    architecture: 'Ampere',
    segment: '1080p-mainstream',
    msrp: 329,
    releaseDate: '2021-02-25'
  },
  'RTX 3050': {
    perfIndex: 35.0,
    tdp: 130,
    vram: 8,
    architecture: 'Ampere',
    segment: 'budget',
    msrp: 249,
    releaseDate: '2022-01-27'
  },

  // RX 6000 Series - RDNA 2 Legacy
  'RX 6950 XT': {
    perfIndex: 76.0,
    tdp: 335,
    vram: 16,
    architecture: 'RDNA 2',
    segment: '1440p-high',
    msrp: 1099,
    releaseDate: '2022-05-10'
  },
  'RX 6900 XT': {
    perfIndex: 74.0,
    tdp: 300,
    vram: 16,
    architecture: 'RDNA 2',
    segment: '1440p-high',
    msrp: 999,
    releaseDate: '2020-12-08'
  },
  'RX 6800 XT': {
    perfIndex: 70.0,
    tdp: 300,
    vram: 16,
    architecture: 'RDNA 2',
    segment: '1440p-high',
    msrp: 649,
    releaseDate: '2020-11-18'
  },
  'RX 6800': {
    perfIndex: 66.0,
    tdp: 250,
    vram: 16,
    architecture: 'RDNA 2',
    segment: '1440p-high',
    msrp: 579,
    releaseDate: '2020-11-18'
  },
  'RX 6700 XT': {
    perfIndex: 58.0,
    tdp: 230,
    vram: 12,
    architecture: 'RDNA 2',
    segment: '1080p-mainstream',
    msrp: 479,
    releaseDate: '2021-03-18'
  },
  'RX 6600 XT': {
    perfIndex: 50.0,
    tdp: 160,
    vram: 8,
    architecture: 'RDNA 2',
    segment: '1080p-mainstream',
    msrp: 379,
    releaseDate: '2021-08-11'
  },
  'RX 6600': {
    perfIndex: 44.0,
    tdp: 132,
    vram: 8,
    architecture: 'RDNA 2',
    segment: '1080p-mainstream',
    msrp: 329,
    releaseDate: '2021-10-13'
  },
  'RX 6500 XT': {
    perfIndex: 30.0,
    tdp: 107,
    vram: 4,
    architecture: 'RDNA 2',
    segment: 'budget',
    msrp: 199,
    releaseDate: '2022-01-19'
  }
};

/**
 * Enhanced GPU model extraction with comprehensive pattern matching
 */
export function extractGPUModel(title: string): string | null {
  const models = Object.keys(GPU_PERFORMANCE_DATABASE);
  
  // Sort by specificity (longer names first to match RTX 4070 Ti SUPER before RTX 4070)
  const sortedModels = models.sort((a, b) => b.length - a.length);
  
  const normalizedTitle = title.toUpperCase();
  
  for (const model of sortedModels) {
    // Direct match
    if (normalizedTitle.includes(model)) {
      return model;
    }
    
    // Handle variations like "RTX4070" vs "RTX 4070"
    const compactModel = model.replace(/\s+/g, '');
    if (normalizedTitle.replace(/\s+/g, '').includes(compactModel)) {
      return model;
    }
  }
  
  return null;
}

/**
 * Get comprehensive GPU data from title
 */
export function getGPUData(title: string) {
  const model = extractGPUModel(title);
  if (!model) {
    return {
      model: null,
      perfIndex: 50.0,
      tdp: 200,
      vram: 8,
      segment: '1080p-mainstream',
      msrp: 400
    };
  }
  
  const data = GPU_PERFORMANCE_DATABASE[model as keyof typeof GPU_PERFORMANCE_DATABASE];
  return {
    model,
    perfIndex: data.perfIndex,
    tdp: data.tdp,
    vram: data.vram,
    segment: data.segment,
    msrp: data.msrp,
    architecture: data.architecture,
    releaseDate: data.releaseDate
  };
}

/**
 * Enhanced GPU segment classification with model awareness
 */
export function classifyGPUSegment(title: string, price: number): string {
  const gpuData = getGPUData(title);
  
  // Use model-specific segment if available
  if (gpuData.model) {
    return gpuData.segment;
  }
  
  // Fallback to price-based classification
  if (price < 250) return 'budget';
  if (price > 1400) return 'enthusiast';
  if (price > 1000) return '4k-flagship';
  if (price > 600) return '1440p-high';
  if (price > 350) return '1080p-mainstream';
  return 'budget';
}

/**
 * GPU-specific DXM scoring with category optimizations
 */
export function calculateGPUScore(inputs: Omit<DXMScoreInputs, 'category' | 'perfIndex' | 'tdpWatts' | 'segment'>): number {
  const gpuData = getGPUData(inputs.title);
  
  const enhancedInputs: DXMScoreInputs = {
    ...inputs,
    category: 'gpu',
    perfIndex: gpuData.perfIndex,
    tdpWatts: gpuData.tdp,
    segment: classifyGPUSegment(inputs.title, inputs.currentPrice),
    // GPU-specific enhancements
    brandReputation: getBrandReputation(inputs.brand),
  };
  
  const result = calculateDXMScoreV2(enhancedInputs);
  
  // GPU-specific score adjustments
  let adjustedScore = result.dxmValueScore;
  
  // VRAM bonus for high-resolution gaming
  if (gpuData.vram >= 16 && gpuData.segment.includes('1440p') || gpuData.segment.includes('4k')) {
    adjustedScore += 0.25; // VRAM future-proofing bonus
  }
  
  // Architecture bonus for latest generation
  if (gpuData.architecture === 'Ada Lovelace' || gpuData.architecture === 'RDNA 3') {
    adjustedScore += 0.15; // Latest architecture bonus
  }
  
  // Ray tracing capability bonus
  if (inputs.title.includes('RTX') || inputs.title.includes('RX 7')) {
    adjustedScore += 0.10; // RT capability bonus
  }
  
  return Math.min(Math.round(adjustedScore * 100) / 100, 10.00);
}

/**
 * GPU brand reputation scoring
 */
function getBrandReputation(brand: string): number {
  const brandUpper = brand?.toUpperCase() || '';
  
  // GPU-specific brand reputation
  const gpuBrandReputation: Record<string, number> = {
    'NVIDIA': 1.00,
    'AMD': 0.95,
    'ASUS': 0.92,
    'MSI': 0.90,
    'GIGABYTE': 0.88,
    'EVGA': 0.88, // Legacy but still trusted
    'ZOTAC': 0.80,
    'PNY': 0.75,
    'POWERCOLOR': 0.78,
    'XFX': 0.76,
    'SAPPHIRE': 0.82,
    'ASROCK': 0.79,
    'PALIT': 0.74,
    'GAINWARD': 0.76,
    'INNO3D': 0.73,
  };
  
  return gpuBrandReputation[brandUpper] || 0.70;
}

/**
 * GPU market analysis helpers
 */
export function getGPUMarketPosition(model: string): {
  tier: string;
  competitorsInTier: string[];
  priceRange: { min: number; max: number };
} {
  const data = GPU_PERFORMANCE_DATABASE[model as keyof typeof GPU_PERFORMANCE_DATABASE];
  if (!data) {
    return {
      tier: 'unknown',
      competitorsInTier: [],
      priceRange: { min: 0, max: 0 }
    };
  }
  
  const perfIndex = data.perfIndex;
  const segment = data.segment;
  
  // Find competitors in similar performance range (±5 points)
  const competitors = Object.entries(GPU_PERFORMANCE_DATABASE)
    .filter(([key, value]) => 
      key !== model && 
      Math.abs(value.perfIndex - perfIndex) <= 5 &&
      value.segment === segment
    )
    .map(([key]) => key);
  
  // Price range based on segment
  const priceRanges = {
    'budget': { min: 150, max: 300 },
    '1080p-mainstream': { min: 250, max: 500 },
    '1440p-high': { min: 450, max: 900 },
    '4k-flagship': { min: 800, max: 1400 },
    'enthusiast': { min: 1200, max: 2000 }
  };
  
  return {
    tier: segment,
    competitorsInTier: competitors,
    priceRange: priceRanges[segment as keyof typeof priceRanges] || { min: 0, max: 0 }
  };
}

/**
 * GPU recommendation engine
 */
export function getGPURecommendations(budget: number, useCase: '1080p' | '1440p' | '4k' | 'budget'): string[] {
  const useCaseToSegment = {
    'budget': 'budget',
    '1080p': '1080p-mainstream',
    '1440p': '1440p-high',
    '4k': '4k-flagship'
  };
  
  const targetSegment = useCaseToSegment[useCase];
  
  return Object.entries(GPU_PERFORMANCE_DATABASE)
    .filter(([_, data]) => 
      data.segment === targetSegment && 
      data.msrp <= budget * 1.2 // Allow 20% over budget for good deals
    )
    .sort((a, b) => b[1].perfIndex - a[1].perfIndex) // Sort by performance
    .slice(0, 5) // Top 5 recommendations
    .map(([model]) => model);
}

export default {
  GPU_PERFORMANCE_DATABASE,
  extractGPUModel,
  getGPUData,
  classifyGPUSegment,
  calculateGPUScore,
  getGPUMarketPosition,
  getGPURecommendations
};
