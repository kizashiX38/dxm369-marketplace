// src/app/admin/launch-readiness/page.tsx
// DXM369 Launch Readiness Dashboard
// Mission-control panel for launch security and readiness

import { LaunchReadinessDashboard } from "./LaunchReadinessDashboard";
import { LAUNCH_CHECKS } from "@/lib/launchReadinessChecks";

export default function LaunchReadinessPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/50 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Launch Readiness Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Pre-launch security and readiness checklist for dxm369.com
        </p>
      </div>

      <LaunchReadinessDashboard initialChecks={LAUNCH_CHECKS} />
    </div>
  );
}

