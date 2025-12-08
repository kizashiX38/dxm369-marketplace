// src/app/api/dxm/migration/route.ts
// Migration management API for DXM v1 to v2 transition
// Control rollout, monitor metrics, and handle rollbacks

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeQueryParse, safeJsonParse } from "@/lib/apiSafe";
import { env } from "@/lib/env";
import { migrationManager, getMigrationStatus, ROLLOUT_STAGES } from "@/lib/migration";

export const GET = apiSafe(async (request: NextRequest) => {
  const searchParams = safeQueryParse(request);
  const action = searchParams.get("action") || "status";
    if (action === "status") {
      // Get current migration status
      const status = getMigrationStatus();
      const config = migrationManager.getConfig();
      const state = migrationManager.getState();

      return NextResponse.json({
        ok: true,
        data: {
          action: "status",
          status,
          config,
          state,
          rolloutStages: ROLLOUT_STAGES,
          currentStage: ROLLOUT_STAGES.find(stage => 
            config.rolloutPercentage <= stage.percentage
          ) || ROLLOUT_STAGES[ROLLOUT_STAGES.length - 1],
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "health") {
      // Detailed health check
      const status = getMigrationStatus();
      const state = migrationManager.getState();
      
      const healthChecks = {
        migrationEnabled: migrationManager.getConfig().enabled,
        rolloutPercentage: status.rolloutPercentage,
        errorRate: {
          current: state.metrics.errorRate,
          threshold: migrationManager.getConfig().rollbackThreshold.errorRate,
          status: state.metrics.errorRate < migrationManager.getConfig().rollbackThreshold.errorRate ? "healthy" : "critical"
        },
        responseTime: {
          current: state.metrics.avgResponseTime,
          threshold: migrationManager.getConfig().rollbackThreshold.responseTime,
          status: state.metrics.avgResponseTime < migrationManager.getConfig().rollbackThreshold.responseTime ? "healthy" : "critical"
        },
        conversionRate: {
          current: state.metrics.conversionRate,
          baseline: 0.05, // 5% baseline
          status: state.metrics.conversionRate >= 0.04 ? "healthy" : "warning" // Allow some variance
        },
        issues: state.issues,
        overallHealth: status.health
      };

      return NextResponse.json({
        ok: true,
        data: {
          action: "health",
          healthChecks,
          recommendations: generateHealthRecommendations(healthChecks),
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "metrics") {
      // Get detailed metrics for monitoring
      const state = migrationManager.getState();
      
      // Simulated metrics (in production, these would come from real monitoring)
      const detailedMetrics = {
        current: state.metrics,
        trends: {
          errorRate: [0.001, 0.002, 0.001, 0.003, state.metrics.errorRate],
          responseTime: [145, 156, 142, 167, state.metrics.avgResponseTime],
          conversionRate: [0.048, 0.051, 0.049, 0.052, state.metrics.conversionRate],
          userSatisfaction: [4.2, 4.3, 4.1, 4.4, state.metrics.userSatisfaction]
        },
        comparison: {
          v1: {
            errorRate: 0.002,
            avgResponseTime: 134,
            conversionRate: 0.049,
            userSatisfaction: 4.1
          },
          v2: {
            errorRate: state.metrics.errorRate,
            avgResponseTime: state.metrics.avgResponseTime,
            conversionRate: state.metrics.conversionRate,
            userSatisfaction: state.metrics.userSatisfaction
          }
        }
      };

      return NextResponse.json({
        ok: true,
        data: {
          action: "metrics",
          metrics: detailedMetrics,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ 
      ok: false,
      error: "Invalid action. Use: status, health, or metrics" 
    }, { status: 400 });
});

export const POST = apiSafe(async (request: NextRequest) => {
  const body = await safeJsonParse<{ action: string; [key: string]: any }>(request);
  
  if (!body || !body.action) {
    return NextResponse.json({ 
      ok: false,
      error: "Missing action field" 
    }, { status: 400 });
  }
  
  const action = body.action;

    if (action === "enable") {
      // Enable migration with optional configuration
      const config = body.config || {};
      migrationManager.updateConfig({
        enabled: true,
        rolloutPercentage: config.rolloutPercentage || 1,
        ...config
      });

      return NextResponse.json({
        ok: true,
        data: {
          action: "enable",
          success: true,
          config: migrationManager.getConfig(),
          message: "Migration enabled successfully",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "disable") {
      // Disable migration (rollback to v1)
      migrationManager.updateConfig({
        enabled: false,
        rolloutPercentage: 0
      });

      return NextResponse.json({
        ok: true,
        data: {
          action: "disable",
          success: true,
          message: "Migration disabled - all users on v1",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "increment") {
      // Increment rollout percentage
      const increment = body.increment || 5;
      const success = migrationManager.incrementRollout(increment);

      return NextResponse.json({
        ok: true,
        data: {
          action: "increment",
          success,
          newPercentage: migrationManager.getConfig().rolloutPercentage,
          message: success ? `Rollout increased by ${increment}%` : "Already at 100%",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "rollback") {
      // Rollback migration
      const percentage = body.percentage || 50;
      migrationManager.rollback(percentage);

      return NextResponse.json({
        ok: true,
        data: {
          action: "rollback",
          success: true,
          newPercentage: migrationManager.getConfig().rolloutPercentage,
          message: `Rolled back by ${percentage}%`,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "emergency_rollback") {
      // Emergency rollback
      const reason = body.reason || "Manual emergency rollback";
      migrationManager.emergencyRollback(reason);

      return NextResponse.json({
        ok: true,
        data: {
          action: "emergency_rollback",
          success: true,
          reason,
          message: "Emergency rollback completed - all users on v1",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "update_config") {
      // Update migration configuration
      const config = body.config || {};
      migrationManager.updateConfig(config);

      return NextResponse.json({
        ok: true,
        data: {
          action: "update_config",
          success: true,
          config: migrationManager.getConfig(),
          message: "Configuration updated successfully",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "update_metrics") {
      // Update migration metrics (typically called by monitoring systems)
      const metrics = body.metrics || {};
      migrationManager.updateMetrics(metrics);

      return NextResponse.json({
        ok: true,
        data: {
          action: "update_metrics",
          success: true,
          metrics: migrationManager.getState().metrics,
          message: "Metrics updated successfully",
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === "simulate_issue") {
      // Simulate issues for testing (development only)
      const issueType = body.issueType || "error_rate";
      
      if (env.NODE_ENV !== "development") {
        return NextResponse.json({ 
          ok: false,
          error: "Simulation only available in development" 
        }, { status: 403 });
      }

      switch (issueType) {
        case "error_rate":
          migrationManager.updateMetrics({ errorRate: 0.08 }); // Above threshold
          break;
        case "response_time":
          migrationManager.updateMetrics({ avgResponseTime: 2500 }); // Above threshold
          break;
        case "conversion_drop":
          migrationManager.updateMetrics({ conversionRate: 0.02 }); // Significant drop
          break;
        default:
          return NextResponse.json({ ok: false, error: "Invalid issue type" }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        data: {
          action: "simulate_issue",
          success: true,
          issueType,
          message: `Simulated ${issueType} issue`,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ 
      ok: false,
      error: "Invalid action. Use: enable, disable, increment, rollback, emergency_rollback, update_config, update_metrics, or simulate_issue" 
    }, { status: 400 });
});

function generateHealthRecommendations(healthChecks: any): string[] {
  const recommendations: string[] = [];

  if (healthChecks.errorRate.status === "critical") {
    recommendations.push("CRITICAL: Error rate exceeded threshold - consider immediate rollback");
  }

  if (healthChecks.responseTime.status === "critical") {
    recommendations.push("CRITICAL: Response time exceeded threshold - investigate performance issues");
  }

  if (healthChecks.conversionRate.status === "warning") {
    recommendations.push("WARNING: Conversion rate below baseline - monitor user behavior");
  }

  if (healthChecks.issues.length > 0) {
    recommendations.push(`${healthChecks.issues.length} issues detected - review migration logs`);
  }

  if (healthChecks.overallHealth === "healthy" && recommendations.length === 0) {
    recommendations.push("All systems healthy - safe to continue rollout");
  }

  return recommendations;
}
