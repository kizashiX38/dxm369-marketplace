// src/app/admin/newsletter/page.tsx
// Newsletter Intelligence Hub
// Subscriber growth, source attribution, and export features

"use client";

import { useState, useEffect } from "react";
import AdminAuth from "../components/AdminAuth";
import NewsletterStats from "./components/NewsletterStats";
import SubscriberList from "./components/SubscriberList";
// import GrowthChart from "./components/GrowthChart";
import SourceAttribution from "./components/SourceAttribution";

export default function NewsletterDashboard() {
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
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          ✉️ Newsletter Intelligence Hub
        </h1>
        <p className="text-slate-400 mt-2">
          Audience growth, engagement metrics, and subscriber management
        </p>
      </div>

      {/* Key Stats */}
      <NewsletterStats />

      {/* Growth Chart */}
      {/* <GrowthChart /> */}

      {/* Source Attribution */}
      <SourceAttribution />

      {/* Subscriber List */}
      <SubscriberList />
    </div>
  );
}
