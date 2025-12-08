// src/app/admin/earnings/components/EarningsOverview.tsx
// Earnings Overview Component
// Key metrics cards for revenue, commission, clicks, conversions

"use client";

import { useEffect, useState } from "react";
import { publicConfig } from "@/lib/env-client";

interface EarningsStats {
  totalRevenue: number;
  totalCommission: number;
  totalClicks: number;
  totalOrdered: number;
  totalShipped: number;
  totalReturned: number;
  avgEpc: number;
  avgConversionRate: number;
  period: {
    start: string;
    end: string;
  };
}

export default function EarningsOverview() {
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsStats();
  }, []);

  async function fetchEarningsStats() {
    try {
      const adminKey = publicConfig.adminKey || "admin";
      const response = await fetch("/api/admin/earnings?metric=stats", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("[Earnings Overview] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded w-24 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
        <p className="text-slate-400">No earnings data available. Sync your earnings to get started.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-cyan-400">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {stats.period.start} to {stats.period.end}
          </div>
        </div>

        {/* Total Commission */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Total Commission</div>
          <div className="text-3xl font-bold text-green-400">
            {formatCurrency(stats.totalCommission)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {formatPercent(stats.totalCommission / stats.totalRevenue || 0)} of revenue
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Total Clicks</div>
          <div className="text-3xl font-bold text-blue-400">
            {stats.totalClicks.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            EPC: {formatCurrency(stats.avgEpc)}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Conversion Rate</div>
          <div className="text-3xl font-bold text-purple-400">
            {formatPercent(stats.avgConversionRate)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {stats.totalOrdered} ordered / {stats.totalShipped} shipped
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Ordered Items</div>
          <div className="text-2xl font-bold text-white">
            {stats.totalOrdered.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Shipped Items</div>
          <div className="text-2xl font-bold text-white">
            {stats.totalShipped.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="text-slate-400 text-sm mb-2">Returned Items</div>
          <div className="text-2xl font-bold text-red-400">
            {stats.totalReturned.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

