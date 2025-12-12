// src/lib/comparisons/ssd-comparisons.ts
// SSD comparison templates - PCIe tier and brand battles

import { ComparisonConfig } from "@/lib/comparisonPageGenerator";

export const ssdComparisons: Record<string, ComparisonConfig> = {
  // PCIe 4.0 Comparison
  samsung990pro_vs_wdblack: {
    productA: "Samsung 990 Pro",
    productB: "WD Black SN850X",
    category: "ssd",
    slug: "samsung-990-pro-vs-wd-black-sn850x",
    winner: "productA",
    winnerReason: "990 Pro edges out with better cache and proven reliability.",
    keyDifferences: [
      { aspect: "Speed (Read)", productAValue: "7,100 MB/s", productBValue: "7,100 MB/s" },
      { aspect: "Cache", productAValue: "1.4GB", productBValue: "1GB" },
      { aspect: "Price (1TB)", productAValue: "$89", productBValue: "$84" },
      { aspect: "Reliability", productAValue: "Excellent", productBValue: "Excellent" },
    ],
    faqEntries: [
      {
        question: "Is Samsung 990 Pro worth the extra cost?",
        answer: "Yes—better cache and proven track record. $5 premium is worthwhile.",
      },
      {
        question: "Are these different from 4.0 drives?",
        answer: "Not for gaming. Both exceed game load speeds.",
      },
      {
        question: "Do I need PCIe 4.0 or can I go 3.0?",
        answer: "PCIe 4.0 is now standard. PCIe 3.0 aging out.",
      },
      {
        question: "Which is better for PS5?",
        answer: "Both work on PS5. WD Black is officially certified.",
      },
    ],
  },

  // PCIe 4.0 vs 5.0
  crucial_t500_vs_samsung990pro: {
    productA: "Crucial T500",
    productB: "Samsung 990 Pro",
    category: "ssd",
    slug: "crucial-t500-vs-samsung-990-pro",
    winner: "productB",
    winnerReason: "Samsung 990 Pro is proven; Crucial T500 is newer but less established.",
    keyDifferences: [
      { aspect: "PCIe Generation", productAValue: "PCIe 5.0", productBValue: "PCIe 4.0" },
      { aspect: "Read Speed", productAValue: "12,400 MB/s", productBValue: "7,100 MB/s" },
      { aspect: "Price (1TB)", productAValue: "$119", productBValue: "$89" },
      { aspect: "Real Gaming Impact", productAValue: "None", productBValue: "None" },
    ],
    faqEntries: [
      {
        question: "Should I buy PCIe 5.0 SSD in 2025?",
        answer: "Only if future-proofing matters. For gaming/gaming, PCIe 4.0 is still king value.",
      },
      {
        question: "Will PCIe 5.0 make my games load faster?",
        answer: "No. Gaming is bottlenecked by storage bandwidth that even PCIe 3.0 exceeds.",
      },
      {
        question: "When does PCIe 5.0 matter?",
        answer: "Professional workflows: video rendering, 3D, large file transfers.",
      },
      {
        question: "Is Crucial T500 reliable?",
        answer: "Crucial is solid, but Samsung has longer track record with 990 Pro.",
      },
    ],
  },

  // Budget PCIe 4.0
  kingston_fury_vs_WD_blue: {
    productA: "Kingston Fury Beast Pro",
    productB: "WD Blue SN580",
    category: "ssd",
    slug: "kingston-fury-vs-wd-blue-sn580",
    winner: "productA",
    winnerReason: "Kingston Fury offers better performance at competitive pricing.",
    keyDifferences: [
      { aspect: "Speed (Read)", productAValue: "4,950 MB/s", productBValue: "4,150 MB/s" },
      { aspect: "Price (1TB)", productAValue: "$59", productBValue: "$49" },
      { aspect: "PCIe Generation", productAValue: "PCIe 4.0", productBValue: "PCIe 4.0" },
      { aspect: "Budget Gaming", productAValue: "Excellent", productBValue: "Adequate" },
    ],
    faqEntries: [
      {
        question: "Is Kingston Fury Beast Pro good for gaming?",
        answer: "Yes—faster than WD Blue and still budget-friendly at $59.",
      },
      {
        question: "What's the difference in load times?",
        answer: "Minimal in gaming. Both exceed what games need (~3,500 MB/s).",
      },
      {
        question: "Should I buy WD Blue SN580?",
        answer: "Only if $10 savings are critical. Kingston Fury is better value.",
      },
      {
        question: "Can I use these in PS5?",
        answer: "Kingston Fury works. WD Blue SN580 is not certified (though may work).",
      },
    ],
  },
};
