// src/app/admin/components/AdminAuth.tsx
// Admin Authentication Component
// Handles admin key input and storage

"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminAuthProps {
  onAuthenticated: (key: string) => void;
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyKey = useCallback(async (keyToVerify: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/analytics?metric=clicks", {
        headers: {
          "x-admin-key": keyToVerify,
        },
      });

      if (response.ok) {
        sessionStorage.setItem("admin_key", keyToVerify);
        onAuthenticated(keyToVerify);
      } else {
        setError("Invalid admin key");
        sessionStorage.removeItem("admin_key");
      }
    } catch (err) {
      setError("Failed to verify admin key");
      sessionStorage.removeItem("admin_key");
    } finally {
      setLoading(false);
    }
  }, [onAuthenticated]);

  useEffect(() => {
    // Check if key is stored in sessionStorage
    const storedKey = sessionStorage.getItem("admin_key");
    if (storedKey) {
      // Verify the key works
      verifyKey(storedKey);
    }
  }, [verifyKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyKey(key);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c12]">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">DXM369 Admin Access</h2>
        <p className="text-slate-400 text-sm mb-6">
          Enter your admin key to access the dashboard
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin Key"
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-4"
            required
          />
          {error && (
            <div className="text-red-400 text-sm mb-4">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg px-4 py-3 text-cyan-400 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-4 text-center">
          Set ADMIN_SECRET in your environment variables
        </p>
      </div>
    </div>
  );
}

