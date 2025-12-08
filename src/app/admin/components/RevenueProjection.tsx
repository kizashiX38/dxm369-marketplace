// src/app/admin/components/RevenueProjection.tsx
// Revenue Projection Component
// Shows estimated revenue based on clicks and conversion rates

"use client";

import { useEffect, useState } from "react";

interface RevenueData {
  estimatedClicks: number;
  estimatedConversions: number;
  estimatedRevenue: number;
  conversionRate: number;
}

export default function RevenueProjection() {
  const [data, setData] = useState<RevenueData | null>(null);
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
      
      const response = await fetch("/api/admin/analytics?metric=revenue", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <p className="text-slate-400">Failed to load revenue projection</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">💰 Revenue Projection</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Estimated Clicks</div>
          <div className="text-3xl font-bold text-slate-200">
            {data.estimatedClicks.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Conversion Rate</div>
          <div className="text-3xl font-bold text-cyan-400">
            {(data.conversionRate * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Est. Conversions</div>
          <div className="text-3xl font-bold text-blue-400">
            {data.estimatedConversions.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="text-sm text-green-400 mb-2">Est. Revenue</div>
          <div className="text-3xl font-bold text-green-400">
            ${data.estimatedRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-green-500/70 mt-1">
            Based on ${450} avg order value
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-slate-700/20 rounded-lg">
        <p className="text-xs text-slate-400">
          💡 <strong>Note:</strong> Revenue projections are estimates based on industry-standard
          conversion rates (2%) and average order values. Actual revenue may vary.
        </p>
      </div>
    </div>
  );
}

