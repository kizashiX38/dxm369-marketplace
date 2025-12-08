// src/app/admin/health/page.tsx
// Health & Observability Dashboard
// Browser version of /api/health with DB status, latency, and service uptime

"use client";

import { useState, useEffect } from "react";
import AdminAuth from "../components/AdminAuth";

interface HealthStatus {
  database: {
    connected: boolean;
    poolSize: number;
    idleCount: number;
    waitingCount: number;
  };
  api: {
    status: string;
    latency: number;
    uptime: string;
  };
  services: {
    amazon: boolean;
    email: boolean;
  };
}

export default function HealthDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = sessionStorage.getItem("admin_key");
    if (key) {
      setAuthenticated(true);
      fetchHealth();
      const interval = setInterval(fetchHealth, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const fetchHealth = async () => {
    try {
      // Fetch API health (includes database status)
      const start = Date.now();
      const apiResponse = await fetch("/api/health");
      const latency = Date.now() - start;
      const apiData = await apiResponse.json();

      setHealth({
        database: {
          connected: apiData.database?.connected || false,
          poolSize: apiData.database?.poolSize || 0,
          idleCount: apiData.database?.idleCount || 0,
          waitingCount: apiData.database?.waitingCount || 0,
        },
        api: {
          status: apiData.status || "unknown",
          latency,
          uptime: apiData.uptime || "unknown",
        },
        services: {
          amazon: apiData.services?.amazon || false,
          email: apiData.services?.email || false,
        },
      });
    } catch (error) {
      console.error("Failed to fetch health status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-slate-800/30 border border-red-500/50 rounded-xl p-6">
        <p className="text-red-400">Failed to load health status</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          ⚡ System Health & Observability
        </h1>
        <p className="text-slate-400 mt-2">
          Real-time system status, database connectivity, and service monitoring
        </p>
      </div>

      {/* Database Status */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-cyan-400">🗄️ Database Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Connection</div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  health.database.connected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <span className="font-medium text-slate-200">
                {health.database.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Pool Size</div>
            <div className="text-2xl font-bold text-cyan-400">{health.database.poolSize}</div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Idle Connections</div>
            <div className="text-2xl font-bold text-blue-400">{health.database.idleCount}</div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Waiting</div>
            <div className="text-2xl font-bold text-slate-300">{health.database.waitingCount}</div>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-cyan-400">🚀 API Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Status</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="font-medium text-slate-200 uppercase">{health.api.status}</span>
            </div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Latency</div>
            <div className="text-2xl font-bold text-cyan-400">{health.api.latency}ms</div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Uptime</div>
            <div className="text-lg font-medium text-slate-200">{health.api.uptime}</div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-cyan-400">🔌 External Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Amazon API</div>
                <div className="text-lg font-medium text-slate-200">Product Advertising</div>
              </div>
              <div
                className={`w-4 h-4 rounded-full ${
                  health.services.amazon ? "bg-green-400" : "bg-yellow-400"
                }`}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {health.services.amazon ? "Configured" : "Not configured"}
            </div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Email Service</div>
                <div className="text-lg font-medium text-slate-200">Newsletter</div>
              </div>
              <div
                className={`w-4 h-4 rounded-full ${
                  health.services.email ? "bg-green-400" : "bg-yellow-400"
                }`}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {health.services.email ? "Configured" : "Not configured"}
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-slate-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
