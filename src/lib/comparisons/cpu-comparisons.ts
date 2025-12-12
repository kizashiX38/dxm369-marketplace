// src/lib/comparisons/cpu-comparisons.ts
// CPU comparison templates - pure config objects
// Gaming vs Productivity focused clusters

import { ComparisonConfig } from "@/lib/comparisonPageGenerator";

export const cpuComparisons: Record<string, ComparisonConfig> = {
  // GAMING FOCUS TIER 1
  ryzen7700x_vs_i714700k: {
    productA: "AMD Ryzen 7 7700X",
    productB: "Intel i7-14700K",
    category: "cpu",
    slug: "ryzen-7-7700x-vs-i7-14700k",
    winner: "different-use-cases",
    winnerReason: "7700X wins gaming; i7-14700K wins productivity.",
    keyDifferences: [
      { aspect: "Cores/Threads", productAValue: "8/16", productBValue: "20/28" },
      { aspect: "Gaming", productAValue: "Winner", productBValue: "2nd" },
      { aspect: "Productivity", productAValue: "2nd", productBValue: "Winner" },
      { aspect: "Price", productAValue: "$279", productBValue: "$319" },
    ],
    faqEntries: [
      {
        question: "Which CPU is better for gaming?",
        answer: "Ryzen 7 7700X wins with superior single-thread performance.",
      },
      {
        question: "Which is better for streaming + gaming?",
        answer: "i7-14700K—its extra cores handle encoding while gaming.",
      },
      {
        question: "What's the price difference?",
        answer: "Ryzen 7700X is ~$40 cheaper.",
      },
      {
        question: "Which should a new builder choose?",
        answer: "Pure gaming: 7700X. Gaming + content creation: i7-14700K.",
      },
    ],
    relatedComparisons: [
      "ryzen-5-7600x-vs-i5-14600k",
      "ryzen-9-7950x-vs-i9-14900k",
      "ryzen-7-5700x-vs-i7-13700k",
    ],
  },

  // GAMING FOCUS TIER 2
  ryzen5_7600x_vs_i514600k: {
    productA: "Ryzen 5 7600X",
    productB: "Intel i5-14600K",
    category: "cpu",
    slug: "ryzen-5-7600x-vs-i5-14600k",
    winner: "productA",
    winnerReason: "Ryzen 5 7600X has better gaming performance and is cheaper.",
    keyDifferences: [
      { aspect: "Cores/Threads", productAValue: "6/12", productBValue: "14/20" },
      { aspect: "Gaming Single-Thread", productAValue: "Winner", productBValue: "Competitive" },
      { aspect: "Price", productAValue: "$199", productBValue: "$219" },
      { aspect: "Streaming Ready", productAValue: "Possible", productBValue: "Better" },
    ],
    faqEntries: [
      {
        question: "Is Ryzen 5 7600X better for gaming than i5-14600K?",
        answer: "Yes—better single-thread speed and lower cost. i5 has more cores for multitasking.",
      },
      {
        question: "Can either handle gaming + streaming?",
        answer: "i5-14600K is more stable for streaming. Ryzen 5 7600X can manage, but tight.",
      },
      {
        question: "Which is the better value?",
        answer: "Ryzen 5 7600X at $199 is excellent for pure gaming.",
      },
      {
        question: "What about overclocking?",
        answer: "Both support overclocking. Ryzen 7000X series is slightly more stable.",
      },
    ],
    relatedComparisons: [
      "ryzen-7-7700x-vs-i7-14700k",
      "ryzen-9-7950x-vs-i9-14900k",
      "ryzen-7-5700x-vs-i7-13700k",
    ],
  },

  // PRODUCTIVITY FOCUS TIER 1
  ryzen9_7950x_vs_i914900k: {
    productA: "Ryzen 9 7950X",
    productB: "Intel i9-14900K",
    category: "cpu",
    slug: "ryzen-9-7950x-vs-i9-14900k",
    winner: "productB",
    winnerReason: "i9-14900K wins in productivity and gaming due to more cores and higher clocks.",
    keyDifferences: [
      { aspect: "Cores/Threads", productAValue: "16/32", productBValue: "24/32" },
      { aspect: "Productivity", productAValue: "Excellent", productBValue: "Best-in-class" },
      { aspect: "Gaming", productAValue: "Excellent", productBValue: "Excellent" },
      { aspect: "Price", productAValue: "$379", productBValue: "$589" },
    ],
    faqEntries: [
      {
        question: "Should I buy i9-14900K or Ryzen 9 7950X?",
        answer: "i9-14900K is faster overall but costs $210 more. 7950X is better value for productivity.",
      },
      {
        question: "Which is better for rendering?",
        answer: "i9-14900K edges out with more cores and higher clocks. Difference is 5-8%.",
      },
      {
        question: "Can either handle gaming and productivity equally?",
        answer: "Both excel at both. Choose based on budget and software preferences.",
      },
      {
        question: "What about power consumption?",
        answer: "i9-14900K consumes more power. Ryzen 9 7950X is more efficient.",
      },
    ],
    relatedComparisons: [
      "ryzen-7-7700x-vs-i7-14700k",
      "ryzen-5-7600x-vs-i5-14600k",
      "ryzen-7-5700x-vs-i7-13700k",
    ],
  },

  // PRODUCTIVITY FOCUS TIER 2 (Budget)
  ryzen7_5700x_vs_i713700k: {
    productA: "Ryzen 7 5700X",
    productB: "Intel i7-13700K",
    category: "cpu",
    slug: "ryzen-7-5700x-vs-i7-13700k",
    winner: "productB",
    winnerReason: "i7-13700K is newer with better all-around performance, especially for productivity.",
    keyDifferences: [
      { aspect: "Architecture", productAValue: "Zen 3", productBValue: "13th Gen Raptor Lake" },
      { aspect: "Cores/Threads", productAValue: "8/16", productBValue: "16/24" },
      { aspect: "Price", productAValue: "$249", productBValue: "$319" },
      { aspect: "Gaming", productAValue: "Excellent", productBValue: "Superior" },
    ],
    faqEntries: [
      {
        question: "Is i7-13700K worth the extra cost over Ryzen 7 5700X?",
        answer: "Yes—it's newer, faster, and more versatile. 5700X is aging but still capable.",
      },
      {
        question: "Should I buy last-gen Ryzen or newer Intel?",
        answer: "If upgrading in 2025, go newer (i7-13700K or newer). 5700X is a last-resort budget option.",
      },
      {
        question: "Can Ryzen 7 5700X still game well?",
        answer: "Yes, it's still excellent for 1440p+ gaming. Intel 13th gen is faster but 5700X holds its own.",
      },
      {
        question: "What about AM5 vs LGA1700 platform?",
        answer: "AM5 has future upgrade path (Ryzen 7000 series). LGA1700 is Intel's modern platform.",
      },
    ],
    relatedComparisons: [
      "ryzen-7-7700x-vs-i7-14700k",
      "ryzen-5-7600x-vs-i5-14600k",
      "ryzen-9-7950x-vs-i9-14900k",
    ],
  },
};
