// src/app/admin/earnings/page.tsx
// Earnings Dashboard
// Real Amazon Associates earnings data and analytics

"use client";

import { useState, useEffect } from "react";
import AdminAuth from "../components/AdminAuth";
import EarningsSummary from "./components/EarningsSummary";
// import DailyEarningsChart from "./components/DailyEarningsChart";
import TrackingIdTable from "./components/TrackingIdTable";
import EarningsUpload from "./components/EarningsUpload";
import EPCLeaderboard from "./components/EPCLeaderboard";
import TrackingIdHeatmap from "./components/TrackingIdHeatmap";
import OptimizationRecommendations from "./components/OptimizationRecommendations";

export default function EarningsDashboard() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const key = sessionStorage.getItem("admin_key");
    if (key) {
      setAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            💰 Affiliate Earnings
          </h1>
          <p className="text-slate-400 mt-2">
            Amazon Associates revenue tracking and analytics
          </p>
        </div>
      </div>

      {/* Earnings Summary */}
      <EarningsSummary />

      {/* Daily Earnings Chart */}
      {/* <DailyEarningsChart /> */}

      {/* Revenue Optimization Recommendations */}
      <OptimizationRecommendations />

      {/* EPC Leaderboard */}
      <EPCLeaderboard />

      {/* Tracking ID Heatmap */}
      <TrackingIdHeatmap />

      {/* Tracking ID Breakdown */}
      <TrackingIdTable />

      {/* CSV Upload */}
      <EarningsUpload />
    </div>
  );
}
