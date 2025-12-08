// src/app/admin/components/ClickStats.tsx
// Click Statistics Component
// Displays total clicks, today, this week, this month

"use client";

import { useEffect, useState } from "react";

interface ClickStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export default function ClickStats() {
  const [stats, setStats] = useState<ClickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;
      
      const response = await fetch("/api/admin/analytics?metric=clicks", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch click stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <p className="text-slate-400">Failed to load click statistics</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">📊 Click Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={stats.total.toLocaleString()}
          icon="👆"
          color="cyan"
        />
        <StatCard
          title="Today"
          value={stats.today.toLocaleString()}
          icon="📅"
          color="blue"
        />
        <StatCard
          title="This Week"
          value={stats.thisWeek.toLocaleString()}
          icon="📆"
          color="green"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth.toLocaleString()}
          icon="📈"
          color="purple"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    cyan: "from-cyan-500 to-cyan-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}></div>
      </div>
      <div className="text-3xl font-bold text-slate-200 mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

