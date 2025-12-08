// src/app/admin/newsletter/components/NewsletterStats.tsx
// Newsletter Statistics Component

"use client";

import { useEffect, useState } from "react";

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  growthRate: number;
}

export default function NewsletterStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;
      
      const response = await fetch("/api/admin/newsletter?action=stats", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch newsletter stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">📊 Subscriber Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Total Subscribers</div>
          <div className="text-3xl font-bold text-slate-200">{stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="text-sm text-green-400 mb-2">Active</div>
          <div className="text-3xl font-bold text-green-400">{stats.active.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Unsubscribed</div>
          <div className="text-3xl font-bold text-slate-300">{stats.unsubscribed.toLocaleString()}</div>
        </div>
        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4">
          <div className="text-sm text-cyan-400 mb-2">Growth Rate (7d)</div>
          <div className="text-3xl font-bold text-cyan-400">
            {stats.growthRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

