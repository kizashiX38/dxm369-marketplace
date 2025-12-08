// src/app/admin/earnings/components/EarningsByTracking.tsx
// Earnings by Tracking ID Component
// Breakdown of earnings by affiliate tracking ID

"use client";

import { useEffect, useState } from "react";
import { publicConfig } from "@/lib/env-client";

interface TrackingEarnings {
  tracking_id: string;
  revenue: number;
  commission: number;
  clicks: number;
  ordered_items: number;
  shipped_items: number;
  epc: number;
  conversion_rate: number;
}

export default function EarningsByTracking() {
  const [data, setData] = useState<TrackingEarnings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchByTracking();
  }, []);

  async function fetchByTracking() {
    try {
      const adminKey = publicConfig.adminKey || "admin";
      const response = await fetch("/api/admin/earnings?metric=by-tracking", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      }
    } catch (error) {
      console.error("[Earnings By Tracking] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Earnings by Tracking ID</h3>
        <p className="text-slate-400">No tracking ID data available.</p>
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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Earnings by Tracking ID</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-semibold">Tracking ID</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">Revenue</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">Commission</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">Clicks</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">EPC</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">Conv. Rate</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">Ordered</th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold">Shipped</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.tracking_id}
                className={`border-b border-slate-700/50 ${
                  idx % 2 === 0 ? "bg-slate-800/30" : ""
                }`}
              >
                <td className="py-3 px-4 text-cyan-400 font-mono text-sm">
                  {row.tracking_id}
                </td>
                <td className="py-3 px-4 text-right text-white">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="py-3 px-4 text-right text-green-400 font-semibold">
                  {formatCurrency(row.commission)}
                </td>
                <td className="py-3 px-4 text-right text-slate-300">
                  {row.clicks.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-blue-400">
                  {formatCurrency(row.epc)}
                </td>
                <td className="py-3 px-4 text-right text-purple-400">
                  {formatPercent(row.conversion_rate)}
                </td>
                <td className="py-3 px-4 text-right text-slate-300">
                  {row.ordered_items.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-slate-300">
                  {row.shipped_items.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

