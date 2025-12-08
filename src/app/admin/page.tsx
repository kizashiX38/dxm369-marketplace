// src/app/admin/page.tsx
// DXM369 Executive Dashboard
// Main analytics dashboard with click stats, trends, and revenue projections

"use client";

import { useState, useEffect } from "react";
import AdminAuth from "./components/AdminAuth";
import ClickStats from "./components/ClickStats";
// const CategoryBreakdown = dynamic(() => import("./components/CategoryBreakdown"), { ssr: false });
// const TrendChart = dynamic(() => import("./components/TrendChart"), { ssr: false });
import TopProducts from "./components/TopProducts";
import RevenueProjection from "./components/RevenueProjection";
import EarningsSummary from "./components/EarningsSummary";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const key = sessionStorage.getItem("admin_key");
    if (key) {
      setAdminKey(key);
      setAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = (key: string) => {
    setAdminKey(key);
    setAuthenticated(true);
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          DXM Executive Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Real-time marketplace intelligence & performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <ClickStats />

      {/* Earnings Summary */}
      <EarningsSummary />

      {/* Revenue Projection */}
      <RevenueProjection />

      {/* Category Breakdown */}
      {/* <CategoryBreakdown /> */}

      {/* Trend Chart */}
      {/* <TrendChart /> */}

      {/* Top Products */}
      <TopProducts />
    </div>
  );
}
