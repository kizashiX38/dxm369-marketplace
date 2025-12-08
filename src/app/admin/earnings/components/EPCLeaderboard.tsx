// src/app/admin/earnings/components/EPCLeaderboard.tsx
// EPC Leaderboard Component
// Shows top performing tracking IDs by earnings per click

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TrackingIdEarnings {
  trackingId: string;
  marketplace: string;
  totalRevenue: number;
  totalClicks: number;
  epc: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'steady';
  trendPercent: number;
}

export default function EPCLeaderboard() {
  const [data, setData] = useState<TrackingIdEarnings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;

      const response = await fetch("/api/admin/earnings?action=epc-leaderboard&limit=10", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch EPC leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">🏆 EPC Leaderboard</h2>
        <p className="text-slate-400">No earnings data available</p>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-cyan-400">🏆 EPC Leaderboard</h2>
        <span className="text-sm text-slate-400">Top 10 by Earnings Per Click</span>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.trackingId}
            className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-slate-400/20 text-slate-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-600/20 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-cyan-400">{item.trackingId}</code>
                    <span className="text-xs text-slate-500 uppercase">{item.marketplace}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.totalClicks.toLocaleString()} clicks • {(item.conversionRate * 100).toFixed(2)}% conv
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  ${item.epc.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">EPC</div>
                <div className={`text-xs mt-1 flex items-center gap-1 justify-end ${getTrendColor(item.trend)}`}>
                  <span>{getTrendIcon(item.trend)}</span>
                  <span>{item.trendPercent > 0 ? '+' : ''}{item.trendPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

