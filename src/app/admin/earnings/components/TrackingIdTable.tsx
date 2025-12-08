// src/app/admin/earnings/components/TrackingIdTable.tsx
// Tracking ID Earnings Table
// Shows earnings breakdown by tracking ID

"use client";

import { useEffect, useState } from "react";

interface TrackingIdEarnings {
  trackingId: string;
  marketplace: string;
  totalCommission: number;
  totalBounties: number;
  totalAdFees: number;
  totalRevenue: number;
  totalClicks: number;
  totalOrderedItems: number;
}

export default function TrackingIdTable() {
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

      const response = await fetch("/api/admin/earnings?action=tracking", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
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
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">📊 Earnings by Tracking ID</h2>
        <p className="text-slate-400">No tracking ID data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">📊 Earnings by Tracking ID</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Tracking ID</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Marketplace</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Clicks</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Orders</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Commission</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Bounties</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Ad Fees</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.trackingId}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="py-3 px-4">
                  <code className="text-sm text-cyan-400">{item.trackingId}</code>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-300 uppercase">{item.marketplace}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-slate-200">{item.totalClicks.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-slate-200">{item.totalOrderedItems.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-green-400 font-medium">
                    ${item.totalCommission.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-blue-400 font-medium">
                    ${item.totalBounties.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-purple-400 font-medium">
                    ${item.totalAdFees.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-cyan-400 font-bold">
                    ${item.totalRevenue.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

