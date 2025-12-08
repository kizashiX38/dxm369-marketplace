// src/app/admin/components/EarningsSummary.tsx
// Earnings Summary Component for Main Dashboard
// Shows total earnings and link to full earnings page

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EarningsSummaryData {
  totalRevenue: number;
  totalCommission: number;
  totalBounties: number;
  totalAdFees: number;
}

export default function EarningsSummary() {
  const [summary, setSummary] = useState<EarningsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000);
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
        <div className="animate-pulse h-32 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  if (!summary || summary.totalRevenue === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-cyan-400">💰 Affiliate Earnings</h2>
          <Link
            href="/admin/earnings"
            className="text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            View Full Report →
          </Link>
        </div>
        <p className="text-slate-400">No earnings data available. Upload a CSV to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-cyan-400">💰 Affiliate Earnings</h2>
        <Link
          href="/admin/earnings"
          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-medium transition-colors"
        >
          View Full Report →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="text-sm text-green-400 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-green-400">
            ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Commission</div>
          <div className="text-2xl font-bold text-cyan-400">
            ${summary.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Bounties</div>
          <div className="text-2xl font-bold text-blue-400">
            ${summary.totalBounties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Ad Fees</div>
          <div className="text-2xl font-bold text-purple-400">
            ${summary.totalAdFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}

