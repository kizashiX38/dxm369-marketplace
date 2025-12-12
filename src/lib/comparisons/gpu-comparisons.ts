// src/lib/comparisons/gpu-comparisons.ts
// GPU comparison templates - pure config objects
// No logic, no side effects, no dependencies

import { ComparisonConfig } from "@/lib/comparisonPageGenerator";

export const gpuComparisons: Record<string, ComparisonConfig> = {
  // High-End Gaming (Flagship tier)
  rtx4070Super_vs_4070: {
    productA: "RTX 4070 Super",
    productB: "RTX 4070",
    category: "gpu",
    slug: "rtx-4070-super-vs-rtx-4070",
    winner: "productA",
    winnerReason: "RTX 4070 Super offers ~15% better performance at only $50 more.",
    keyDifferences: [
      { aspect: "CUDA Cores", productAValue: "5,888", productBValue: "5,888" },
      { aspect: "Price", productAValue: "$599", productBValue: "$549" },
      { aspect: "1440p Gaming", productAValue: "120+ FPS", productBValue: "110+ FPS" },
    ],
    faqEntries: [
      {
        question: "Is RTX 4070 Super worth the extra cost?",
        answer: "Yes—12-15% better performance for just $50 more is worthwhile for 1440p gaming.",
      },
      {
        question: "What's the real-world performance difference?",
        answer: "Expect 8-15% higher frame rates in modern games at 1440p.",
      },
      {
        question: "Should I buy RTX 4070 if Super is available?",
        answer: "Only if you find significant savings. At similar pricing, the Super is better.",
      },
      {
        question: "Best use case for regular RTX 4070?",
        answer: "Budget-conscious 1440p gamers or esports players.",
      },
    ],
    relatedComparisons: [
      "rtx-4070-super-vs-rtx-4090",
      "rtx-4070-vs-rx-7800-xt",
      "rtx-4060-ti-vs-rx-6700-xt",
    ],
  },

  // High-End vs Ultra-High-End
  rtx4070_vs_4090: {
    productA: "RTX 4070 Super",
    productB: "RTX 4090",
    category: "gpu",
    slug: "rtx-4070-super-vs-rtx-4090",
    winner: "different-use-cases",
    winnerReason: "4070 Super is best value for 1440p; 4090 wins for 4K and professional work.",
    keyDifferences: [
      { aspect: "VRAM", productAValue: "12 GB", productBValue: "24 GB" },
      { aspect: "4K Gaming", productAValue: "60-90 FPS", productBValue: "120+ FPS" },
      { aspect: "Price", productAValue: "$599", productBValue: "$1,599" },
      { aspect: "Professional Workloads", productAValue: "Capable", productBValue: "Best-in-class" },
    ],
    faqEntries: [
      {
        question: "Is RTX 4090 worth 2.7x the price of 4070 Super?",
        answer: "Only if you need 4K gaming or professional rendering. For 1440p, 4070 Super is better ROI.",
      },
      {
        question: "Can RTX 4070 Super handle 4K gaming?",
        answer: "Yes, but expect 60-90 FPS depending on settings. RTX 4090 is more comfortable at 4K.",
      },
      {
        question: "Which is better for content creation?",
        answer: "RTX 4090 with 24GB VRAM is significantly faster for video/3D rendering.",
      },
      {
        question: "What about 1440p high refresh gaming?",
        answer: "RTX 4070 Super crushes 1440p at 144+ FPS. 4090 is overkill for this use case.",
      },
    ],
    relatedComparisons: [
      "rtx-4070-super-vs-rtx-4070",
      "rtx-4070-vs-rx-7800-xt",
      "rtx-4090-vs-rx-7900-xtx",
    ],
  },

  // Mid-Range comparison
  rtx4070_vs_rx7800xt: {
    productA: "RTX 4070",
    productB: "RX 7800 XT",
    category: "gpu",
    slug: "rtx-4070-vs-rx-7800-xt",
    winner: "productA",
    winnerReason: "RTX 4070 edges out with better driver support and ray tracing performance.",
    keyDifferences: [
      { aspect: "Architecture", productAValue: "Ada (NVIDIA)", productBValue: "RDNA 3 (AMD)" },
      { aspect: "Ray Tracing", productAValue: "Superior", productBValue: "Competitive" },
      { aspect: "Price", productAValue: "$549", productBValue: "$499" },
      { aspect: "Power Efficiency", productAValue: "200W", productBValue: "310W" },
    ],
    faqEntries: [
      {
        question: "Is RTX 4070 better than RX 7800 XT for gaming?",
        answer: "Marginally—RTX 4070 has better ray tracing and DLSS support. RX 7800 XT is still excellent value.",
      },
      {
        question: "Which has better driver support?",
        answer: "RTX 4070 benefits from NVIDIA's mature driver ecosystem. AMD drivers are solid but historically lag.",
      },
      {
        question: "Does power consumption matter?",
        answer: "RTX 4070 is 55% more efficient. If running on a tight PSU, RTX 4070 is safer.",
      },
      {
        question: "What about VRAM—12GB vs 16GB?",
        answer: "16GB on RX 7800 XT is future-proof, but 12GB on RTX 4070 is sufficient for current games.",
      },
    ],
    relatedComparisons: [
      "rtx-4070-super-vs-rtx-4070",
      "rtx-4070-super-vs-rtx-4090",
      "rtx-4060-ti-vs-rx-6700-xt",
    ],
  },

  // Budget tier
  rtx4060ti_vs_rx6700xt: {
    productA: "RTX 4060 Ti",
    productB: "RX 6700 XT",
    category: "gpu",
    slug: "rtx-4060-ti-vs-rx-6700-xt",
    winner: "productB",
    winnerReason: "RX 6700 XT offers 12GB VRAM and better rasterization performance for less.",
    keyDifferences: [
      { aspect: "VRAM", productAValue: "8 GB", productBValue: "12 GB" },
      { aspect: "Price", productAValue: "$299", productBValue: "$279" },
      { aspect: "1440p Gaming", productAValue: "60-80 FPS", productBValue: "80-100 FPS" },
      { aspect: "Ray Tracing", productAValue: "Good", productBValue: "Adequate" },
    ],
    faqEntries: [
      {
        question: "Why is RX 6700 XT the better choice here?",
        answer: "More VRAM, better rasterization perf, and cheaper. RTX 4060 Ti's advantage is ray tracing, which isn't critical at 1440p.",
      },
      {
        question: "Is 8GB VRAM on RTX 4060 Ti limiting?",
        answer: "For 1440p, mostly fine. For future-proofing, RX 6700 XT's 12GB is safer.",
      },
      {
        question: "Can either handle 4K?",
        answer: "Not comfortably. Both are 1440p cards. For 4K, step up to RTX 4070 or RX 7800 XT.",
      },
      {
        question: "Which is better for esports?",
        answer: "Both are overkill for esports. Either will crush competitive titles at 1440p+ 240FPS.",
      },
    ],
    relatedComparisons: [
      "rtx-4070-super-vs-rtx-4070",
      "rtx-4070-vs-rx-7800-xt",
      "rtx-4060-vs-rx-6600",
    ],
  },

  // Ultra-budget (entry level)
  rtx4060_vs_rx6600: {
    productA: "RTX 4060",
    productB: "RX 6600",
    category: "gpu",
    slug: "rtx-4060-vs-rx-6600",
    winner: "productB",
    winnerReason: "RX 6600 delivers better rasterization at a lower price point.",
    keyDifferences: [
      { aspect: "VRAM", productAValue: "8 GB", productBValue: "8 GB" },
      { aspect: "Price", productAValue: "$249", productBValue: "$199" },
      { aspect: "1080p Gaming", productAValue: "100+ FPS", productBValue: "120+ FPS" },
      { aspect: "Memory Bandwidth", productAValue: "288 GB/s", productBValue: "432 GB/s" },
    ],
    faqEntries: [
      {
        question: "Is RX 6600 clearly better than RTX 4060?",
        answer: "For rasterization gaming, yes. For ray tracing, they're closer. For price, RX 6600 wins.",
      },
      {
        question: "Can these handle 1440p gaming?",
        answer: "Yes, but expect 60-90 FPS at medium-high settings. Best for 1080p.",
      },
      {
        question: "Which should I buy in 2025?",
        answer: "If budget is tight, RX 6600. If you want ray tracing support, RTX 4060.",
      },
      {
        question: "What's the upgrade path from these?",
        answer: "Next tier: RTX 4060 Ti or RX 6700 XT for solid 1440p performance.",
      },
    ],
    relatedComparisons: [
      "rtx-4060-ti-vs-rx-6700-xt",
      "rtx-4070-super-vs-rtx-4070",
      "rtx-4070-vs-rx-7800-xt",
    ],
  },

  // Extreme flagship
  rtx4090_vs_rx7900xtx: {
    productA: "RTX 4090",
    productB: "RX 7900 XTX",
    category: "gpu",
    slug: "rtx-4090-vs-rx-7900-xtx",
    winner: "productA",
    winnerReason: "RTX 4090 maintains leadership in ray tracing and CUDA-dependent workloads.",
    keyDifferences: [
      { aspect: "4K Gaming", productAValue: "140+ FPS", productBValue: "130+ FPS" },
      { aspect: "Professional Performance", productAValue: "Industry standard", productBValue: "Competitive" },
      { aspect: "Price", productAValue: "$1,599", productBValue: "$899" },
      { aspect: "VRAM", productAValue: "24 GB", productBValue: "24 GB" },
    ],
    faqEntries: [
      {
        question: "Is RTX 4090 worth $700 more than RX 7900 XTX?",
        answer: "For gaming alone, no. For professional work (AI, rendering, data science), yes.",
      },
      {
        question: "Which is better for 4K gaming specifically?",
        answer: "RTX 4090 has a small edge. RX 7900 XTX is nearly as good and much cheaper.",
      },
      {
        question: "What about CUDA vs compute performance?",
        answer: "CUDA ecosystem is mature. If you use CUDA apps (DaVinci, Blender, etc.), RTX 4090 wins.",
      },
      {
        question: "Best GPU for gaming in 2025?",
        answer: "For pure gaming at any resolution, both are extreme overkill. RTX 4070 Super is the real best value.",
      },
    ],
    relatedComparisons: [
      "rtx-4070-super-vs-rtx-4090",
      "rtx-4070-vs-rx-7800-xt",
      "rtx-4060-ti-vs-rx-6700-xt",
    ],
  },
};
