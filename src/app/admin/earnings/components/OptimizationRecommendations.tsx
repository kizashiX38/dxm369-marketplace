// src/app/admin/earnings/components/OptimizationRecommendations.tsx
// Revenue Optimization Recommendations Component

"use client";

import { useState, useEffect } from "react";
import { OptimizationRecommendation, OptimizationReport } from "@/lib/services/revenueOptimization";

export default function OptimizationRecommendations() {
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptimizationReport();
  }, []);

  const fetchOptimizationReport = async () => {
    try {
      setLoading(true);
      const adminKey = sessionStorage.getItem("admin_key");
      if (!adminKey) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch("/api/admin/earnings/optimization", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch optimization report");
      }

      const data = await response.json();
      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-400/50 bg-red-400/10 text-red-300";
      case "medium":
        return "border-yellow-400/50 bg-yellow-400/10 text-yellow-300";
      case "low":
        return "border-blue-400/50 bg-blue-400/10 text-blue-300";
      default:
        return "border-slate-400/50 bg-slate-400/10 text-slate-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tracking_id":
        return "🏷️";
      case "category":
        return "📦";
      case "source":
        return "📊";
      case "conversion":
        return "🎯";
      case "content":
        return "📝";
      case "traffic":
        return "🚀";
      default:
        return "💡";
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="animate-pulse text-cyan-400">Loading optimization recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="text-red-400">Error: {error}</div>
        <button
          onClick={fetchOptimizationReport}
          className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="text-slate-400">No optimization data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            💰 Revenue Optimization Report
          </h2>
          <button
            onClick={fetchOptimizationReport}
            className="px-3 py-1.5 text-xs bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel-secondary p-4 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Total Recommendations</div>
            <div className="text-2xl font-bold text-cyan-300">{report.summary.totalRecommendations}</div>
          </div>
          <div className="glass-panel-secondary p-4 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">High Priority</div>
            <div className="text-2xl font-bold text-red-300">{report.summary.highPriority}</div>
          </div>
          <div className="glass-panel-secondary p-4 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Estimated Impact</div>
            <div className="text-2xl font-bold text-green-300">{report.summary.estimatedImpact}</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Generated: {new Date(report.generatedAt).toLocaleString()}
        </div>
      </div>

      {/* Top Performers */}
      {report.topPerformers.trackingIds.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">🏆 Top Performers (Highest EPC)</h3>
          <div className="space-y-2">
            {report.topPerformers.trackingIds.map((performer) => (
              <div
                key={performer.trackingId}
                className="glass-panel-secondary p-3 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-sm text-cyan-300">{performer.trackingId}</div>
                  <div className="text-xs text-slate-400">
                    EPC: ${performer.epc.toFixed(2)} • CR: {(performer.conversionRate * 100).toFixed(2)}% • Revenue: ${performer.totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">${performer.epc.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">EPC</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">💡 Actionable Recommendations</h3>
        <div className="space-y-4">
          {report.recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`glass-panel-secondary p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getTypeIcon(rec.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{rec.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded uppercase ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{rec.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-400 font-semibold">Impact: {rec.impact}</span>
                  </div>
                  <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Action:</div>
                    <div className="text-sm text-cyan-300">{rec.action}</div>
                  </div>
                  {rec.trackingIds && rec.trackingIds.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500">
                      Tracking IDs: {rec.trackingIds.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Underperformers */}
      {report.underperformers.trackingIds.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">⚠️ Underperformers (Needs Attention)</h3>
          <div className="space-y-2">
            {report.underperformers.trackingIds.map((underperformer) => (
              <div
                key={underperformer.trackingId}
                className="glass-panel-secondary p-3 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-sm text-amber-300">{underperformer.trackingId}</div>
                  <div className="text-xs text-slate-400">
                    EPC: ${underperformer.epc.toFixed(2)} • Clicks: {underperformer.totalClicks} • Revenue: ${underperformer.totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400">${underperformer.epc.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">EPC</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

