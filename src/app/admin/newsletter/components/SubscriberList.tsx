// src/app/admin/newsletter/components/SubscriberList.tsx
// Subscriber List Component with Export

"use client";

import { useEffect, useState } from "react";

interface Subscriber {
  id: number;
  email: string;
  source: string | null;
  subscribed_at: string;
}

export default function SubscriberList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;
      
      const response = await fetch("/api/admin/newsletter?action=subscribers", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSubscribers(result);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) {
        alert("Please authenticate first");
        return;
      }
      
      const response = await fetch("/api/admin/newsletter?action=export&format=csv", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export subscribers:", error);
      alert("Failed to export subscribers");
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-cyan-400">📋 Active Subscribers</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-medium transition-colors"
        >
          📥 Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Source</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  No subscribers yet
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-200">{subscriber.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-slate-400 capitalize">
                      {subscriber.source || "unknown"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-slate-500">
        Showing {subscribers.length} active subscriber{subscribers.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

