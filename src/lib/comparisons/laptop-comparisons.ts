// src/lib/comparisons/laptop-comparisons.ts
// Gaming laptop comparison templates - brand battles and price tiers

import { ComparisonConfig } from "@/lib/comparisonPageGenerator";

export const laptopComparisons: Record<string, ComparisonConfig> = {
  // Premium gaming brands
  zephyrus_vs_legion: {
    productA: "ASUS ROG Zephyrus G16",
    productB: "Lenovo Legion Pro 7",
    category: "laptop",
    slug: "asus-rog-zephyrus-g16-vs-lenovo-legion-pro-7",
    winner: "different-use-cases",
    winnerReason: "Zephyrus for portability; Legion for performance and value.",
    keyDifferences: [
      { aspect: "Weight", productAValue: "5.5 lbs", productBValue: "6.2 lbs" },
      { aspect: "GPU", productAValue: "RTX 4070", productBValue: "RTX 4080" },
      { aspect: "Display", productAValue: "1440p 120Hz", productBValue: "1440p 144Hz" },
      { aspect: "Price", productAValue: "$1,799", productBValue: "$1,999" },
    ],
    faqEntries: [
      {
        question: "Should I buy Zephyrus or Legion?",
        answer: "Zephyrus if you travel; Legion if you want raw performance at home.",
      },
      {
        question: "Which has better thermals?",
        answer: "Legion runs cooler. Zephyrus prioritizes thin design over cooling.",
      },
      {
        question: "Can either handle streaming + gaming?",
        answer: "Legion's RTX 4080 handles streaming easier. Zephyrus is still capable.",
      },
      {
        question: "Which is better for 2025?",
        answer: "Both are excellent. Choose based on portability needs.",
      },
    ],
  },

  // Performance flagship
  razer_blade_vs_alienware: {
    productA: "Razer Blade 16",
    productB: "Alienware m16",
    category: "laptop",
    slug: "razer-blade-16-vs-alienware-m16-2025",
    winner: "productA",
    winnerReason: "Razer Blade wins on build quality and display; Alienware on specs.",
    keyDifferences: [
      { aspect: "Build Quality", productAValue: "Premium", productBValue: "Gaming-focused" },
      { aspect: "GPU", productAValue: "RTX 4070", productBValue: "RTX 4080" },
      { aspect: "Display Quality", productAValue: "Excellent", productBValue: "High refresh" },
      { aspect: "Price", productAValue: "$1,699", productBValue: "$1,899" },
    ],
    faqEntries: [
      {
        question: "Which laptop is better for gaming?",
        answer: "Alienware's RTX 4080 edges out performance. Razer Blade is still excellent.",
      },
      {
        question: "Should I care about build quality?",
        answer: "Yes—Razer's premium materials last longer and feel better.",
      },
      {
        question: "Can either handle professional work?",
        answer: "Both can. Razer slightly better for color-accurate work.",
      },
      {
        question: "Which is better overall in 2025?",
        answer: "Razer Blade for balanced excellence. Alienware if pure performance matters.",
      },
    ],
  },

  // Budget gaming
  msi_vs_asus_budget: {
    productA: "MSI Raider GE66",
    productB: "ASUS TUF F15",
    category: "laptop",
    slug: "msi-raider-ge66-vs-asus-tuf-f15-budget",
    winner: "productB",
    winnerReason: "ASUS TUF offers better thermals and durability at lower price.",
    keyDifferences: [
      { aspect: "Durability", productAValue: "Good", productBValue: "MilSpec rated" },
      { aspect: "GPU", productAValue: "RTX 4060", productBValue: "RTX 4050" },
      { aspect: "Price", productAValue: "$899", productBValue: "$799" },
      { aspect: "Gaming Performance", productAValue: "Strong", productBValue: "Adequate" },
    ],
    faqEntries: [
      {
        question: "Is ASUS TUF F15 worth it for budget gaming?",
        answer: "Yes—MilSpec durability + decent GPU for under $800 is excellent value.",
      },
      {
        question: "Should I buy MSI Raider instead?",
        answer: "Only if you need RTX 4060. ASUS TUF is tougher and cheaper.",
      },
      {
        question: "Can these handle 1440p gaming?",
        answer: "At reduced settings, yes. Both are optimized for 1080p.",
      },
      {
        question: "Which lasts longer?",
        answer: "ASUS TUF with MilSpec rating. MSI is solid but less rugged.",
      },
    ],
  },
};
