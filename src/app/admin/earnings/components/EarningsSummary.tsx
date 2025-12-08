// src/app/admin/earnings/components/EarningsSummary.tsx
// Earnings Summary Component
// Displays total commission, bounties, ad fees, and revenue

"use client";

import { useEffect, useState } from "react";

interface EarningsSummaryData {
  totalCommission: number;
  totalBounties: number;
  totalAdFees: number;
  totalRevenue: number;
  totalClicks: number;
  totalOrderedItems: number;
  totalShippedItems: number;
  totalReturnedItems: number;
}

export default function EarningsSummary() {
  const [summary, setSummary] = useState<EarningsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;

      const response = await fetch("/api/admin/earnings?action=summary", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch earnings summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!summary) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <p className="text-slate-400">No earnings data available. Upload a CSV to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">💰 Earnings Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="text-sm text-green-400 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-green-400">
            ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Commission</div>
          <div className="text-3xl font-bold text-cyan-400">
            ${summary.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Bounties</div>
          <div className="text-3xl font-bold text-blue-400">
            ${summary.totalBounties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Ad Fees</div>
          <div className="text-3xl font-bold text-purple-400">
            ${summary.totalAdFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Total Clicks</div>
          <div className="text-2xl font-bold text-slate-200">{summary.totalClicks.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Ordered Items</div>
          <div className="text-2xl font-bold text-slate-200">{summary.totalOrderedItems.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Shipped Items</div>
          <div className="text-2xl font-bold text-green-400">{summary.totalShippedItems.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Returned Items</div>
          <div className="text-2xl font-bold text-red-400">{summary.totalReturnedItems.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

