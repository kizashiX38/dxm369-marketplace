// src/app/admin/newsletter/components/SourceAttribution.tsx
// Source Attribution Component

"use client";

import { useEffect, useState } from "react";

interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export default function SourceAttribution() {
  const [data, setData] = useState<SourceData[]>([]);
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
      
      const response = await fetch("/api/admin/newsletter?action=sources", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch source data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">📊 Source Attribution</h2>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-200 capitalize">
                {item.source}
              </span>
              <span className="text-cyan-400 font-bold">{item.count.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-600/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-400 mt-1">{item.percentage.toFixed(1)}% of total</div>
          </div>
        ))}
      </div>
    </div>
  );
}

