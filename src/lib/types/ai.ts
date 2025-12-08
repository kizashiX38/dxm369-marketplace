// src/lib/types/ai.ts
// CLIENT-SAFE: AI types only - no server imports
// Used by client components to type AI summaries

export interface AIProductSummary {
  id: string;
  asin: string;
  title: string;
  category: string;

  // Core AI Analysis
  intelligentSummary: string;
  dxmAnalysis: string;
  performanceInsights?: string;
  valueProposition?: string;

  // Comparative Analysis
  competitorComparison?: string;
  marketPosition: 'budget' | 'mid-range' | 'premium' | 'flagship';

  // User Recommendations
  bestFor: string[];
  notRecommendedFor?: string[];
  alternativeProducts?: string[];

  // Technical Insights
  keyStrengths: string[];
  potentialWeaknesses: string[];
  futureProofing: 'excellent' | 'good' | 'fair' | 'limited';

  // DXM Scoring Breakdown
  scoreBreakdown?: {
    performanceValue: { score: number; reasoning: string };
    dealQuality: { score: number; reasoning: string };
    trustSignal: { score: number; reasoning: string };
    efficiency: { score: number; reasoning: string };
    trendSignal: { score: number; reasoning: string };
  };

  // Metadata
  confidence: number; // 0-100% AI confidence in analysis
  lastUpdated?: string;
  analysisVersion: string;
}
