// src/app/admin/earnings/components/TrackingIdHeatmap.tsx
// Tracking ID Heatmap Component
// Visual heatmap showing performance by tracking ID

"use client";

import { useEffect, useState } from "react";

interface TrackingIdEarnings {
  trackingId: string;
  marketplace: string;
  totalRevenue: number;
  totalClicks: number;
  epc: number;
  conversionRate: number;
  avgOrderValue: number;
  returnRate: number;
  trend: 'up' | 'down' | 'steady';
}

export default function TrackingIdHeatmap() {
  const [data, setData] = useState<TrackingIdEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'revenue' | 'epc' | 'conversion'>('revenue');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;

      const response = await fetch("/api/admin/earnings?action=tracking", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result || []);
      }
    } catch (error) {
      console.error("Failed to fetch tracking ID data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse h-64 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">🔥 Performance Heatmap</h2>
        <p className="text-slate-400">No tracking ID data available</p>
      </div>
    );
  }

  // Calculate min/max for heatmap intensity
  const getMetricValue = (item: TrackingIdEarnings) => {
    switch (metric) {
      case 'revenue': return item.totalRevenue;
      case 'epc': return item.epc;
      case 'conversion': return item.conversionRate * 100;
      default: return item.totalRevenue;
    }
  };

  const values = data.map(getMetricValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const getIntensity = (value: number) => {
    if (range === 0) return 0.5;
    return (value - min) / range;
  };

  const getColor = (intensity: number) => {
    // Green to red gradient
    if (intensity > 0.7) return 'bg-green-500/30 border-green-500/50';
    if (intensity > 0.4) return 'bg-yellow-500/30 border-yellow-500/50';
    if (intensity > 0.2) return 'bg-orange-500/30 border-orange-500/50';
    return 'bg-red-500/30 border-red-500/50';
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-cyan-400">🔥 Performance Heatmap</h2>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as any)}
          className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="revenue">By Revenue</option>
          <option value="epc">By EPC</option>
          <option value="conversion">By Conversion Rate</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((item) => {
          const intensity = getIntensity(getMetricValue(item));
          const value = getMetricValue(item);
          
          return (
            <div
              key={item.trackingId}
              className={`${getColor(intensity)} border rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer`}
              title={`${item.trackingId}: ${metric === 'revenue' ? `$${value.toFixed(2)}` : metric === 'epc' ? `$${value.toFixed(2)}` : `${value.toFixed(2)}%`}`}
            >
              <div className="text-xs font-medium text-slate-200 mb-1 truncate">
                {item.trackingId}
              </div>
              <div className="text-lg font-bold text-white">
                {metric === 'revenue' && `$${value.toFixed(0)}`}
                {metric === 'epc' && `$${value.toFixed(2)}`}
                {metric === 'conversion' && `${value.toFixed(1)}%`}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {item.totalClicks} clicks
              </div>
              <div className={`text-xs mt-1 ${
                item.trend === 'up' ? 'text-green-400' :
                item.trend === 'down' ? 'text-red-400' :
                'text-slate-400'
              }`}>
                {item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'} {item.trend}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/30 border border-green-500/50 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/30 border border-yellow-500/50 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/30 border border-red-500/50 rounded"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
