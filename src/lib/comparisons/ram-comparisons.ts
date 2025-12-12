// src/lib/comparisons/ram-comparisons.ts
// RAM comparison templates - DDR4 vs DDR5 and speed tiers

import { ComparisonConfig } from "@/lib/comparisonPageGenerator";

export const ramComparisons: Record<string, ComparisonConfig> = {
  // DDR4 vs DDR5 Decision
  corsairvengeance_vs_gskill: {
    productA: "Corsair Vengeance DDR5",
    productB: "G.Skill Trident Z5",
    category: "ram",
    slug: "corsair-vengeance-vs-gskill-trident-z5-ddr5",
    winner: "different-use-cases",
    winnerReason: "Corsair better value; G.Skill better performance.",
    keyDifferences: [
      { aspect: "Speed (std)", productAValue: "6000 MHz", productBValue: "6000 MHz" },
      { aspect: "Price (32GB)", productAValue: "$134", productBValue: "$149" },
      { aspect: "Gaming", productAValue: "Excellent", productBValue: "Excellent" },
      { aspect: "Overclocking", productAValue: "Good", productBValue: "Better" },
    ],
    faqEntries: [
      {
        question: "Which DDR5 RAM should I buy?",
        answer: "Corsair for value/gaming. G.Skill for overclocking.",
      },
      {
        question: "Do I need 6600 MHz?",
        answer: "No, 6000 MHz is perfect for gaming. Higher speeds matter only in benchmarks.",
      },
      {
        question: "Should I buy DDR4 instead?",
        answer: "DDR5 is now standard for new builds. DDR4 only if budget is critical.",
      },
      {
        question: "What speed matters for gaming?",
        answer: "6000-6400 MHz is sweet spot. Latency (CAS 18-20) matters more than speed.",
      },
    ],
  },

  // Speed tier comparison
  ddr5_6000_vs_7200: {
    productA: "G.Skill Trident Z5 6000MHz",
    productB: "G.Skill Trident Z5 7200MHz",
    category: "ram",
    slug: "ddr5-6000-vs-ddr5-7200-speed-comparison",
    winner: "productA",
    winnerReason: "6000MHz is perfect value; 7200MHz benefits only extreme overclockers.",
    keyDifferences: [
      { aspect: "Speed", productAValue: "6000 MHz", productBValue: "7200 MHz" },
      { aspect: "Price (32GB)", productAValue: "$149", productBValue: "$199" },
      { aspect: "Gaming FPS Gain", productAValue: "N/A", productBValue: "+1-2 FPS max" },
      { aspect: "Stability", productAValue: "Excellent", productBValue: "Requires tuning" },
    ],
    faqEntries: [
      {
        question: "Is DDR5-7200 worth the extra $50?",
        answer: "Not for gaming. You'll gain 1-2 FPS at best. 6000MHz is the value pick.",
      },
      {
        question: "When does faster RAM matter?",
        answer: "Professional workloads (video editing, 3D rendering). Not for gaming.",
      },
      {
        question: "Can I run 7200MHz on older boards?",
        answer: "Maybe, but requires tweaking BIOS. 6000MHz is guaranteed compatible.",
      },
      {
        question: "What latency should I care about?",
        answer: "CAS latency (CAS 18 vs CAS 20) matters more than MHz for gaming.",
      },
    ],
  },
};
