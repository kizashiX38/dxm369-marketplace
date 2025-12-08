// src/app/admin/launch-readiness/LaunchReadinessDashboard.tsx
// Client component for Launch Readiness Dashboard interactivity

"use client";

import { useState, useMemo } from "react";
import type { LaunchCheck, CheckStatus, CheckGroup } from "@/lib/launchReadinessChecks";
import { getChecksByGroup, getGroupStatus, getOverallStatus, getFinalGateChecks } from "@/lib/launchReadinessChecks";

interface LaunchReadinessDashboardProps {
  initialChecks: LaunchCheck[];
}

const GROUP_LABELS: Record<CheckGroup, string> = {
  external: "External Security Scan",
  environment: "Environment Configuration",
  deployment: "Deployment & Production",
  security: "Security & Compliance",
  final: "Final Launch Gate",
};

const GROUP_DESCRIPTIONS: Record<CheckGroup, string> = {
  external: "External security scans and infrastructure checks",
  environment: "Environment variables and configuration validation",
  deployment: "Vercel deployment and runtime hardening",
  security: "Security headers, monitoring, backups, and legal compliance",
  final: "12 MUST-PASS checks before launch",
};

export function LaunchReadinessDashboard({ initialChecks }: LaunchReadinessDashboardProps) {
  const [checks, setChecks] = useState<LaunchCheck[]>(initialChecks);

  const checksByGroup = useMemo(() => getChecksByGroup(checks), [checks]);
  const overallStatus = useMemo(() => getOverallStatus(checks), [checks]);
  const finalGateChecks = useMemo(() => getFinalGateChecks(checks), [checks]);
  const finalGateStatus = useMemo(() => getGroupStatus(finalGateChecks), [finalGateChecks]);

  const updateCheckStatus = (id: string, status: CheckStatus) => {
    setChecks(prev => prev.map(check => 
      check.id === id ? { ...check, status } : check
    ));
  };

  const resetAllToPending = () => {
    setChecks(prev => prev.map(check => ({ ...check, status: "unknown" as CheckStatus })));
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case "pass": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "warn": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "fail": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  const getStatusBadge = (status: CheckStatus) => {
    const colors = getStatusColor(status);
    const labels = {
      pass: "PASS",
      warn: "WARN",
      fail: "FAIL",
      unknown: "PENDING",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono border ${colors}`}>
        {labels[status]}
      </span>
    );
  };

  const getProgress = (groupChecks: LaunchCheck[]) => {
    const passed = groupChecks.filter(c => c.status === "pass").length;
    const total = groupChecks.length;
    return { passed, total, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`rounded-lg p-6 border-2 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Launch Status</h2>
            <p className="text-sm opacity-80">
              {overallStatus === "pass" && finalGateStatus === "pass" 
                ? "✅ DXM369 IS CLEARED FOR GLOBAL LAUNCH - INITIATE: OPERATION ORBITAL COMMERCE"
                : overallStatus === "pass"
                ? "⚠️ Most checks passing, but Final Launch Gate not complete"
                : "🚨 Launch readiness incomplete - review checks below"}
            </p>
          </div>
          <div className="text-right">
            {getStatusBadge(overallStatus)}
            <div className="text-xs mt-2 opacity-60">
              {checks.filter(c => c.status === "pass").length} / {checks.length} passing
            </div>
          </div>
        </div>
      </div>

      {/* Final Launch Gate - Special Box */}
      <div className={`rounded-lg p-6 border-2 ${getStatusColor(finalGateStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">🧨 Final Launch Gate</h2>
            <p className="text-sm opacity-80">12 MUST-PASS checks before dxm369.com goes live</p>
          </div>
          {getStatusBadge(finalGateStatus)}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-mono">
              {finalGateChecks.filter(c => c.status === "pass").length} / {finalGateChecks.length}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                finalGateStatus === "pass" ? "bg-green-500" : 
                finalGateStatus === "warn" ? "bg-yellow-500" : 
                finalGateStatus === "fail" ? "bg-red-500" : "bg-slate-600"
              }`}
              style={{ 
                width: `${(finalGateChecks.filter(c => c.status === "pass").length / finalGateChecks.length) * 100}%` 
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {finalGateChecks.map((check) => (
            <CheckItem
              key={check.id}
              check={check}
              onStatusChange={updateCheckStatus}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      </div>

      {/* Grouped Checks */}
      {(Object.keys(checksByGroup) as CheckGroup[]).map((group) => {
        const groupChecks = checksByGroup[group];
        const groupStatus = getGroupStatus(groupChecks);
        const progress = getProgress(groupChecks);

        return (
          <div key={group} className="rounded-lg border border-slate-800/50 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">{GROUP_LABELS[group]}</h3>
                <p className="text-sm text-slate-500">{GROUP_DESCRIPTIONS[group]}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(groupStatus)}
                <div className="text-xs mt-1 text-slate-500">
                  {progress.passed} / {progress.total} ({progress.percentage}%)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {groupChecks.map((check) => (
                <CheckItem
                  key={check.id}
                  check={check}
                  onStatusChange={updateCheckStatus}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={resetAllToPending}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
        >
          Reset All to PENDING
        </button>
      </div>
    </div>
  );
}

interface CheckItemProps {
  check: LaunchCheck;
  onStatusChange: (id: string, status: CheckStatus) => void;
  getStatusBadge: (status: CheckStatus) => React.ReactNode;
}

function CheckItem({ check, onStatusChange, getStatusBadge }: CheckItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{check.label}</span>
        </div>
        {check.description && (
          <p className="text-xs text-slate-500 mt-1">{check.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {getStatusBadge(check.status)}
        <select
          value={check.status}
          onChange={(e) => onStatusChange(check.id, e.target.value as CheckStatus)}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="unknown">PENDING</option>
          <option value="pass">PASS</option>
          <option value="warn">WARN</option>
          <option value="fail">FAIL</option>
        </select>
      </div>
    </div>
  );
}

