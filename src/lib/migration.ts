// src/lib/migration.ts
// Zero-downtime migration system for DXM v1 to v2
// Feature flags, gradual rollout, and rollback procedures

export interface MigrationConfig {
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  features: {
    v2Scoring: boolean;
    multiCategory: boolean;
    enhancedUI: boolean;
    advancedAnalytics: boolean;
  };
  rollbackThreshold: {
    errorRate: number; // 0-1 (e.g., 0.05 = 5%)
    responseTime: number; // milliseconds
    conversionDrop: number; // 0-1 (e.g., 0.1 = 10% drop)
  };
}

export interface MigrationState {
  version: "v1" | "v2" | "mixed";
  startTime: string;
  usersOnV2: number;
  totalUsers: number;
  metrics: {
    errorRate: number;
    avgResponseTime: number;
    conversionRate: number;
    userSatisfaction: number;
  };
  issues: string[];
}

// Default migration configuration
const DEFAULT_MIGRATION_CONFIG: MigrationConfig = {
  enabled: false,
  rolloutPercentage: 0,
  features: {
    v2Scoring: false,
    multiCategory: false,
    enhancedUI: false,
    advancedAnalytics: false
  },
  rollbackThreshold: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2 seconds
    conversionDrop: 0.15 // 15%
  }
};

/**
 * Migration manager for DXM v1 to v2 transition
 */
export class DXMMigrationManager {
  private config: MigrationConfig;
  private state: MigrationState;

  constructor(config?: Partial<MigrationConfig>) {
    this.config = { ...DEFAULT_MIGRATION_CONFIG, ...config };
    this.state = {
      version: "v1",
      startTime: new Date().toISOString(),
      usersOnV2: 0,
      totalUsers: 0,
      metrics: {
        errorRate: 0,
        avgResponseTime: 0,
        conversionRate: 0,
        userSatisfaction: 0
      },
      issues: []
    };
  }

  /**
   * Determine if a user should get v2 features
   */
  shouldUseV2(userId?: string, sessionId?: string): boolean {
    if (!this.config.enabled) return false;
    
    // Deterministic rollout based on user/session ID
    const id = userId || sessionId || Math.random().toString();
    const hash = this.simpleHash(id);
    const userPercentile = (hash % 100) + 1;
    
    return userPercentile <= this.config.rolloutPercentage;
  }

  /**
   * Check if specific feature is enabled for user
   */
  isFeatureEnabled(feature: keyof MigrationConfig['features'], userId?: string, sessionId?: string): boolean {
    if (!this.shouldUseV2(userId, sessionId)) return false;
    return this.config.features[feature];
  }

  /**
   * Get current migration configuration
   */
  getConfig(): MigrationConfig {
    return { ...this.config };
  }

  /**
   * Update migration configuration
   */
  updateConfig(newConfig: Partial<MigrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logConfigChange(newConfig);
  }

  /**
   * Get current migration state
   */
  getState(): MigrationState {
    return { ...this.state };
  }

  /**
   * Update migration metrics
   */
  updateMetrics(metrics: Partial<MigrationState['metrics']>): void {
    this.state.metrics = { ...this.state.metrics, ...metrics };
    this.checkRollbackConditions();
  }

  /**
   * Increment rollout percentage gradually
   */
  incrementRollout(increment: number = 5): boolean {
    const newPercentage = Math.min(this.config.rolloutPercentage + increment, 100);
    
    if (newPercentage > this.config.rolloutPercentage) {
      this.config.rolloutPercentage = newPercentage;
      this.logRolloutChange(newPercentage);
      return true;
    }
    
    return false;
  }

  /**
   * Emergency rollback to v1
   */
  emergencyRollback(reason: string): void {
    this.config.enabled = false;
    this.config.rolloutPercentage = 0;
    this.state.issues.push(`EMERGENCY_ROLLBACK: ${reason} at ${new Date().toISOString()}`);
    this.logEmergencyRollback(reason);
  }

  /**
   * Gradual rollback
   */
  rollback(percentage: number = 50): void {
    this.config.rolloutPercentage = Math.max(this.config.rolloutPercentage - percentage, 0);
    this.logRolloutChange(this.config.rolloutPercentage);
  }

  /**
   * Check if rollback conditions are met
   */
  private checkRollbackConditions(): void {
    const { metrics } = this.state;
    const { rollbackThreshold } = this.config;

    if (metrics.errorRate > rollbackThreshold.errorRate) {
      this.emergencyRollback(`Error rate exceeded threshold: ${metrics.errorRate} > ${rollbackThreshold.errorRate}`);
      return;
    }

    if (metrics.avgResponseTime > rollbackThreshold.responseTime) {
      this.emergencyRollback(`Response time exceeded threshold: ${metrics.avgResponseTime}ms > ${rollbackThreshold.responseTime}ms`);
      return;
    }

    // Check for significant conversion drop (requires baseline)
    const baselineConversion = 0.05; // 5% baseline (would come from historical data)
    const conversionDrop = (baselineConversion - metrics.conversionRate) / baselineConversion;
    
    if (conversionDrop > rollbackThreshold.conversionDrop) {
      this.emergencyRollback(`Conversion rate dropped significantly: ${(conversionDrop * 100).toFixed(1)}%`);
      return;
    }
  }

  /**
   * Simple hash function for deterministic user assignment
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Logging methods (in production, these would send to monitoring systems)
   */
  private logConfigChange(config: Partial<MigrationConfig>): void {
    console.log(`[DXM_MIGRATION] Config updated:`, config);
  }

  private logRolloutChange(percentage: number): void {
    console.log(`[DXM_MIGRATION] Rollout percentage changed to: ${percentage}%`);
  }

  private logEmergencyRollback(reason: string): void {
    console.error(`[DXM_MIGRATION] EMERGENCY ROLLBACK: ${reason}`);
    // In production, this would trigger alerts
  }
}

// Global migration manager instance
export const migrationManager = new DXMMigrationManager();

/**
 * Feature flag hooks for React components
 */
export function useFeatureFlag(feature: keyof MigrationConfig['features'], userId?: string, sessionId?: string): boolean {
  return migrationManager.isFeatureEnabled(feature, userId, sessionId);
}

/**
 * Migration status for monitoring dashboards
 */
export function getMigrationStatus(): {
  isActive: boolean;
  rolloutPercentage: number;
  version: string;
  health: "healthy" | "warning" | "critical";
  metrics: MigrationState['metrics'];
} {
  const config = migrationManager.getConfig();
  const state = migrationManager.getState();
  
  let health: "healthy" | "warning" | "critical" = "healthy";
  
  if (state.metrics.errorRate > 0.02) health = "warning";
  if (state.metrics.errorRate > 0.05) health = "critical";
  if (state.metrics.avgResponseTime > 1500) health = "warning";
  if (state.metrics.avgResponseTime > 2000) health = "critical";

  return {
    isActive: config.enabled,
    rolloutPercentage: config.rolloutPercentage,
    version: state.version,
    health,
    metrics: state.metrics
  };
}

/**
 * Staged rollout plan
 */
export const ROLLOUT_STAGES = [
  {
    stage: 1,
    name: "Internal Testing",
    percentage: 1,
    duration: "24 hours",
    criteria: "Error rate < 1%, Response time < 500ms",
    features: ["v2Scoring"]
  },
  {
    stage: 2,
    name: "Beta Users",
    percentage: 5,
    duration: "48 hours", 
    criteria: "Error rate < 2%, No critical issues",
    features: ["v2Scoring", "enhancedUI"]
  },
  {
    stage: 3,
    name: "Early Adopters",
    percentage: 15,
    duration: "72 hours",
    criteria: "Conversion rate stable, User satisfaction > 4.0",
    features: ["v2Scoring", "enhancedUI", "multiCategory"]
  },
  {
    stage: 4,
    name: "Gradual Rollout",
    percentage: 50,
    duration: "1 week",
    criteria: "All metrics stable, No performance degradation",
    features: ["v2Scoring", "enhancedUI", "multiCategory", "advancedAnalytics"]
  },
  {
    stage: 5,
    name: "Full Deployment",
    percentage: 100,
    duration: "Ongoing",
    criteria: "Complete migration successful",
    features: ["v2Scoring", "enhancedUI", "multiCategory", "advancedAnalytics"]
  }
];

/**
 * Migration utilities for API endpoints
 */
export function withMigration<T>(
  v1Handler: () => T,
  v2Handler: () => T,
  userId?: string,
  sessionId?: string
): T {
  if (migrationManager.shouldUseV2(userId, sessionId)) {
    return v2Handler();
  }
  return v1Handler();
}

/**
 * A/B testing utilities
 */
export function trackMigrationEvent(
  event: "page_view" | "click" | "conversion" | "error",
  version: "v1" | "v2",
  metadata?: Record<string, any>
): void {
  // In production, this would send to analytics
  console.log(`[DXM_MIGRATION_EVENT] ${event} on ${version}`, metadata);
}

export default {
  DXMMigrationManager,
  migrationManager,
  useFeatureFlag,
  getMigrationStatus,
  ROLLOUT_STAGES,
  withMigration,
  trackMigrationEvent
};
