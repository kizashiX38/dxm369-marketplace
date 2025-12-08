// src/app/admin/earnings/components/EarningsSyncStatus.tsx
// Earnings Sync Status Component
// Display last sync status and manual sync controls

"use client";

import { useEffect, useState } from "react";
import { publicConfig } from "@/lib/env-client";

interface SyncStatus {
  lastSync: string | null;
  status: string;
  recordsSynced: number;
  trackingIds: string[];
}

export default function EarningsSyncStatus() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  async function fetchSyncStatus() {
    try {
      const adminKey = publicConfig.adminKey || "admin";
      const response = await fetch("/api/admin/earnings?metric=sync-status", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(result.data);
      }
    } catch (error) {
      console.error("[Sync Status] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSync() {
    setSyncing(true);
    try {
      const adminKey = publicConfig.adminKey || "admin";
      const response = await fetch("/api/admin/earnings/sync", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "api",
          trackingIds: publicConfig.associateTag
            ? [publicConfig.associateTag]
            : ["dxm369-20"],
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Sync completed: ${result.message}`);
        fetchSyncStatus();
      } else {
        const error = await response.json();
        alert(`Sync failed: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error("[Manual Sync] Error:", error);
      alert("Sync failed. Check console for details.");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-32"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "partial":
        return "text-yellow-400";
      default:
        return "text-slate-400";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Sync Status</h3>
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {status ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Last Sync:</span>
            <span className="text-white">{formatDate(status.lastSync)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <span className={getStatusColor(status.status)}>
              {status.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Records Synced:</span>
            <span className="text-white">{status.recordsSynced.toLocaleString()}</span>
          </div>
          {status.trackingIds.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tracking IDs:</span>
              <div className="flex gap-2">
                {status.trackingIds.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-1 bg-slate-700/50 text-cyan-400 text-xs rounded font-mono"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400">No sync history available. Click &quot;Sync Now&quot; to start.</p>
      )}
    </div>
  );
}

