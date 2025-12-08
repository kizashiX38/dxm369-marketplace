// src/lib/categories/cpu.ts
// CPU-specific scoring logic and performance indices for DXM v2
// Modular category support for processors

import { DXMScoreInputs, calculateDXMScoreV2 } from '@/lib/dxmScoring';

// CPU Performance Database with v2 precision
export const CPU_PERFORMANCE_DATABASE = {
  // Intel 13th Gen (Raptor Lake)
  'i9-13900K': {
    perfIndex: 100.0,
    tdp: 125,
    cores: 24,
    threads: 32,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'enthusiast',
    msrp: 589,
    releaseDate: '2022-10-20'
  },
  'i9-13900KF': {
    perfIndex: 99.0,
    tdp: 125,
    cores: 24,
    threads: 32,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'enthusiast',
    msrp: 564,
    releaseDate: '2022-10-20'
  },
  'i7-13700K': {
    perfIndex: 85.0,
    tdp: 125,
    cores: 16,
    threads: 24,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'high-end',
    msrp: 409,
    releaseDate: '2022-10-20'
  },
  'i7-13700KF': {
    perfIndex: 84.0,
    tdp: 125,
    cores: 16,
    threads: 24,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'high-end',
    msrp: 384,
    releaseDate: '2022-10-20'
  },
  'i5-13600K': {
    perfIndex: 75.0,
    tdp: 125,
    cores: 14,
    threads: 20,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'mainstream',
    msrp: 319,
    releaseDate: '2022-10-20'
  },
  'i5-13600KF': {
    perfIndex: 74.0,
    tdp: 125,
    cores: 14,
    threads: 20,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'mainstream',
    msrp: 294,
    releaseDate: '2022-10-20'
  },
  'i5-13400': {
    perfIndex: 65.0,
    tdp: 65,
    cores: 10,
    threads: 16,
    architecture: 'Raptor Lake',
    socket: 'LGA1700',
    segment: 'mainstream',
    msrp: 221,
    releaseDate: '2023-01-03'
  },

  // AMD Ryzen 7000 Series (Zen 4)
  'Ryzen 9 7950X': {
    perfIndex: 98.0,
    tdp: 170,
    cores: 16,
    threads: 32,
    architecture: 'Zen 4',
    socket: 'AM5',
    segment: 'enthusiast',
    msrp: 699,
    releaseDate: '2022-09-27'
  },
  'Ryzen 9 7900X': {
    perfIndex: 90.0,
    tdp: 170,
    cores: 12,
    threads: 24,
    architecture: 'Zen 4',
    socket: 'AM5',
    segment: 'enthusiast',
    msrp: 549,
    releaseDate: '2022-09-27'
  },
  'Ryzen 7 7800X3D': {
    perfIndex: 88.0,
    tdp: 120,
    cores: 8,
    threads: 16,
    architecture: 'Zen 4',
    socket: 'AM5',
    segment: 'high-end',
    msrp: 449,
    releaseDate: '2023-04-06'
  },
  'Ryzen 7 7700X': {
    perfIndex: 80.0,
    tdp: 105,
    cores: 8,
    threads: 16,
    architecture: 'Zen 4',
    socket: 'AM5',
    segment: 'high-end',
    msrp: 399,
    releaseDate: '2022-09-27'
  },
  'Ryzen 5 7600X': {
    perfIndex: 70.0,
    tdp: 105,
    cores: 6,
    threads: 12,
    architecture: 'Zen 4',
    socket: 'AM5',
    segment: 'mainstream',
    msrp: 299,
    releaseDate: '2022-09-27'
  },
  'Ryzen 5 7600': {
    perfIndex: 68.0,
    tdp: 65,
    cores: 6,
    threads: 12,
    architecture: 'Zen 4',
    socket: 'AM5',
    segment: 'mainstream',
    msrp: 229,
    releaseDate: '2023-01-10'
  },

  // Intel 12th Gen (Alder Lake) - Still relevant
  'i9-12900K': {
    perfIndex: 92.0,
    tdp: 125,
    cores: 16,
    threads: 24,
    architecture: 'Alder Lake',
    socket: 'LGA1700',
    segment: 'enthusiast',
    msrp: 589,
    releaseDate: '2021-11-04'
  },
  'i7-12700K': {
    perfIndex: 78.0,
    tdp: 125,
    cores: 12,
    threads: 20,
    architecture: 'Alder Lake',
    socket: 'LGA1700',
    segment: 'high-end',
    msrp: 409,
    releaseDate: '2021-11-04'
  },
  'i5-12600K': {
    perfIndex: 68.0,
    tdp: 125,
    cores: 10,
    threads: 16,
    architecture: 'Alder Lake',
    socket: 'LGA1700',
    segment: 'mainstream',
    msrp: 289,
    releaseDate: '2021-11-04'
  },
  'i5-12400': {
    perfIndex: 58.0,
    tdp: 65,
    cores: 6,
    threads: 12,
    architecture: 'Alder Lake',
    socket: 'LGA1700',
    segment: 'mainstream',
    msrp: 192,
    releaseDate: '2022-01-04'
  },

  // AMD Ryzen 5000 Series (Zen 3) - Legacy but still competitive
  'Ryzen 9 5950X': {
    perfIndex: 88.0,
    tdp: 105,
    cores: 16,
    threads: 32,
    architecture: 'Zen 3',
    socket: 'AM4',
    segment: 'enthusiast',
    msrp: 799,
    releaseDate: '2020-11-05'
  },
  'Ryzen 9 5900X': {
    perfIndex: 82.0,
    tdp: 105,
    cores: 12,
    threads: 24,
    architecture: 'Zen 3',
    socket: 'AM4',
    segment: 'high-end',
    msrp: 549,
    releaseDate: '2020-11-05'
  },
  'Ryzen 7 5800X3D': {
    perfIndex: 78.0,
    tdp: 105,
    cores: 8,
    threads: 16,
    architecture: 'Zen 3',
    socket: 'AM4',
    segment: 'high-end',
    msrp: 449,
    releaseDate: '2022-04-20'
  },
  'Ryzen 7 5700X': {
    perfIndex: 72.0,
    tdp: 65,
    cores: 8,
    threads: 16,
    architecture: 'Zen 3',
    socket: 'AM4',
    segment: 'mainstream',
    msrp: 299,
    releaseDate: '2022-04-04'
  },
  'Ryzen 5 5600X': {
    perfIndex: 62.0,
    tdp: 65,
    cores: 6,
    threads: 12,
    architecture: 'Zen 3',
    socket: 'AM4',
    segment: 'mainstream',
    msrp: 299,
    releaseDate: '2020-11-05'
  },
  'Ryzen 5 5600': {
    perfIndex: 60.0,
    tdp: 65,
    cores: 6,
    threads: 12,
    architecture: 'Zen 3',
    socket: 'AM4',
    segment: 'mainstream',
    msrp: 199,
    releaseDate: '2022-04-04'
  },

  // Budget Options
  'Ryzen 5 4500': {
    perfIndex: 45.0,
    tdp: 65,
    cores: 6,
    threads: 12,
    architecture: 'Zen 2',
    socket: 'AM4',
    segment: 'budget',
    msrp: 129,
    releaseDate: '2022-04-04'
  },
  'i3-12100': {
    perfIndex: 42.0,
    tdp: 60,
    cores: 4,
    threads: 8,
    architecture: 'Alder Lake',
    socket: 'LGA1700',
    segment: 'budget',
    msrp: 122,
    releaseDate: '2022-01-04'
  }
};

/**
 * Enhanced CPU model extraction
 */
export function extractCPUModel(title: string): string | null {
  const models = Object.keys(CPU_PERFORMANCE_DATABASE);
  const normalizedTitle = title.toUpperCase();
  
  // Sort by specificity (longer names first)
  const sortedModels = models.sort((a, b) => b.length - a.length);
  
  for (const model of sortedModels) {
    // Direct match
    if (normalizedTitle.includes(model.toUpperCase())) {
      return model;
    }
    
    // Handle variations like "i9-13900K" vs "i913900K"
    const compactModel = model.replace(/[-\s]/g, '');
    if (normalizedTitle.replace(/[-\s]/g, '').includes(compactModel.toUpperCase())) {
      return model;
    }
    
    // Handle "Intel Core i9-13900K" variations
    if (model.startsWith('i') && normalizedTitle.includes('CORE ' + model.toUpperCase())) {
      return model;
    }
    
    // Handle "AMD Ryzen 9 7950X" variations
    if (model.startsWith('Ryzen') && normalizedTitle.includes(model.toUpperCase())) {
      return model;
    }
  }
  
  return null;
}

/**
 * Get comprehensive CPU data from title
 */
export function getCPUData(title: string) {
  const model = extractCPUModel(title);
  if (!model) {
    return {
      model: null,
      perfIndex: 50.0,
      tdp: 65,
      cores: 6,
      threads: 12,
      segment: 'mainstream',
      msrp: 300,
      socket: 'unknown'
    };
  }
  
  const data = CPU_PERFORMANCE_DATABASE[model as keyof typeof CPU_PERFORMANCE_DATABASE];
  return {
    model,
    perfIndex: data.perfIndex,
    tdp: data.tdp,
    cores: data.cores,
    threads: data.threads,
    segment: data.segment,
    msrp: data.msrp,
    architecture: data.architecture,
    socket: data.socket,
    releaseDate: data.releaseDate
  };
}

/**
 * CPU segment classification
 */
export function classifyCPUSegment(title: string, price: number): string {
  const cpuData = getCPUData(title);
  
  // Use model-specific segment if available
  if (cpuData.model) {
    return cpuData.segment;
  }
  
  // Fallback to price-based classification
  if (price < 150) return 'budget';
  if (price > 500) return 'enthusiast';
  if (price > 350) return 'high-end';
  return 'mainstream';
}

/**
 * CPU-specific DXM scoring with category optimizations
 */
export function calculateCPUScore(inputs: Omit<DXMScoreInputs, 'category' | 'perfIndex' | 'tdpWatts' | 'segment'>): number {
  const cpuData = getCPUData(inputs.title);
  
  const enhancedInputs: DXMScoreInputs = {
    ...inputs,
    category: 'cpu',
    perfIndex: cpuData.perfIndex,
    tdpWatts: cpuData.tdp,
    segment: classifyCPUSegment(inputs.title, inputs.currentPrice),
    brandReputation: getBrandReputation(inputs.brand),
  };
  
  const result = calculateDXMScoreV2(enhancedInputs);
  let adjustedScore = result.dxmValueScore;
  
  // CPU-specific score adjustments
  
  // Multi-core bonus for productivity workloads
  if (cpuData.cores >= 12) {
    adjustedScore += 0.20; // High core count bonus
  } else if (cpuData.cores >= 8) {
    adjustedScore += 0.10; // Good core count bonus
  }
  
  // Architecture bonus for latest generation
  if (cpuData.architecture === 'Zen 4' || cpuData.architecture === 'Raptor Lake') {
    adjustedScore += 0.15; // Latest architecture bonus
  }
  
  // Efficiency bonus for low TDP high performance
  const perfPerWatt = cpuData.perfIndex / cpuData.tdp;
  if (perfPerWatt > 0.8) {
    adjustedScore += 0.15; // Excellent efficiency bonus
  } else if (perfPerWatt > 0.6) {
    adjustedScore += 0.10; // Good efficiency bonus
  }
  
  // Socket longevity bonus
  if (cpuData.socket === 'AM5' || cpuData.socket === 'LGA1700') {
    adjustedScore += 0.05; // Modern socket bonus
  }
  
  return Math.min(Math.round(adjustedScore * 100) / 100, 10.00);
}

/**
 * CPU brand reputation scoring
 */
function getBrandReputation(brand: string): number {
  const brandUpper = brand?.toUpperCase() || '';
  
  const cpuBrandReputation: Record<string, number> = {
    'INTEL': 0.98,
    'AMD': 0.95,
    'UNKNOWN': 0.70
  };
  
  return cpuBrandReputation[brandUpper] || 0.70;
}

/**
 * CPU use case recommendations
 */
export function getCPURecommendations(
  budget: number, 
  useCase: 'gaming' | 'productivity' | 'budget' | 'workstation'
): string[] {
  const useCaseToSegment = {
    'budget': 'budget',
    'gaming': 'mainstream',
    'productivity': 'high-end',
    'workstation': 'enthusiast'
  };
  
  const targetSegment = useCaseToSegment[useCase];
  
  let candidates = Object.entries(CPU_PERFORMANCE_DATABASE)
    .filter(([_, data]) => 
      data.segment === targetSegment && 
      data.msrp <= budget * 1.2
    );
  
  // Use case specific filtering
  if (useCase === 'gaming') {
    // Prefer higher single-thread performance for gaming
    candidates = candidates.filter(([_, data]) => data.cores <= 16);
  } else if (useCase === 'productivity' || useCase === 'workstation') {
    // Prefer higher core counts for productivity
    candidates = candidates.filter(([_, data]) => data.cores >= 8);
  }
  
  return candidates
    .sort((a, b) => b[1].perfIndex - a[1].perfIndex)
    .slice(0, 5)
    .map(([model]) => model);
}

/**
 * CPU market analysis
 */
export function getCPUMarketPosition(model: string): {
  tier: string;
  competitorsInTier: string[];
  priceRange: { min: number; max: number };
} {
  const data = CPU_PERFORMANCE_DATABASE[model as keyof typeof CPU_PERFORMANCE_DATABASE];
  if (!data) {
    return {
      tier: 'unknown',
      competitorsInTier: [],
      priceRange: { min: 0, max: 0 }
    };
  }
  
  const perfIndex = data.perfIndex;
  const segment = data.segment;
  
  // Find competitors in similar performance range
  const competitors = Object.entries(CPU_PERFORMANCE_DATABASE)
    .filter(([key, value]) => 
      key !== model && 
      Math.abs(value.perfIndex - perfIndex) <= 8 &&
      value.segment === segment
    )
    .map(([key]) => key);
  
  const priceRanges = {
    'budget': { min: 100, max: 200 },
    'mainstream': { min: 200, max: 400 },
    'high-end': { min: 350, max: 600 },
    'enthusiast': { min: 500, max: 800 }
  };
  
  return {
    tier: segment,
    competitorsInTier: competitors,
    priceRange: priceRanges[segment as keyof typeof priceRanges] || { min: 0, max: 0 }
  };
}

export default {
  CPU_PERFORMANCE_DATABASE,
  extractCPUModel,
  getCPUData,
  classifyCPUSegment,
  calculateCPUScore,
  getCPURecommendations,
  getCPUMarketPosition
};
