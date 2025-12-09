// src/components/NewsletterSignup.tsx
// Newsletter Signup Component with Preferences
// Conversion-optimized signup form with DXM styling

"use client";

import { useState } from "react";
import { HardwareCategory } from "@/lib/dealRadarTypes";

interface NewsletterSignupProps {
  variant?: "inline" | "modal" | "sidebar";
  showPreferences?: boolean;
  className?: string;
}

export function NewsletterSignup({ 
  variant = "inline", 
  showPreferences = false, 
  className = "" 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [categories, setCategories] = useState<HardwareCategory[]>(["gpu", "cpu", "laptop"]);
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");
  const [dealThreshold, setDealThreshold] = useState(15);
  const [dxmScoreThreshold, setDxmScoreThreshold] = useState(8.0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          categories,
          frequency,
          dealThreshold,
          dxmScoreThreshold,
          source: `website-${variant}`
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setEmail("");
        setFirstName("");
      } else {
        setError(data.error || "Subscription failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: HardwareCategory) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (isSuccess) {
    return (
      <div className={`glass-panel p-6 text-center ${className}`}>
        <div className="text-emerald-400 text-2xl mb-3">✓</div>
        <h3 className="text-lg font-bold text-white mb-2">Welcome to DXM369!</h3>
        <p className="text-slate-400 text-sm">
          Check your email to confirm your subscription and start receiving 
          personalized hardware deals with DXM Value Scoring.
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`glass-panel p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2 w-2 bg-cyan-400 animate-neon-pulse shadow-[0_0_12px_cyan]" />
          <h3 className="text-lg font-bold text-white">Get Deal Alerts</h3>
        </div>
        
        <p className="text-slate-400 text-sm mb-6">
          Join thousands of hardware enthusiasts getting personalized deal alerts 
          with DXM Value Scoring. Never miss a great deal again.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="glass-panel-secondary px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name (optional)"
              className="glass-panel-secondary px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          {showPreferences && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categories of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["gpu", "cpu", "laptop", "monitor", "ssd"] as HardwareCategory[]).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 text-xs rounded border transition-colors ${
                        categories.includes(category)
                          ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                          : "bg-slate-800/50 border-slate-600/50 text-slate-400 hover:border-slate-500/50"
                      }`}
                    >
                      {category.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full glass-panel-secondary px-3 py-2 text-white focus:border-cyan-400/50 focus:outline-none"
                  >
                    <option value="instant">Instant (Flash Sales)</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Roundup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min. Discount: {dealThreshold}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={dealThreshold}
                    onChange={(e) => setDealThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </button>

              {showAdvanced && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min. DXM Score: {dxmScoreThreshold.toFixed(1)}/10
                  </label>
                  <input
                    type="range"
                    min="6.0"
                    max="9.5"
                    step="0.1"
                    value={dxmScoreThreshold}
                    onChange={(e) => setDxmScoreThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full glass-panel px-6 py-3 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Subscribing..." : "Get Deal Alerts →"}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-3 text-center">
          No spam, unsubscribe anytime. Privacy policy compliant.
        </p>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`glass-panel-secondary p-4 ${className}`}>
        <h3 className="text-sm font-semibold text-white mb-3">💎 Deal Alerts</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full glass-panel px-3 py-2 text-white placeholder-slate-500 text-sm focus:border-cyan-400/50 focus:outline-none"
          />

          <div className="flex flex-wrap gap-1">
            {(["gpu", "cpu", "laptop"] as HardwareCategory[]).map(category => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  categories.includes(category)
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-slate-700/50 text-slate-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {error && (
            <div className="text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 px-3 py-2 text-xs font-medium rounded transition-colors hover:bg-cyan-400/20 disabled:opacity-50"
          >
            {isLoading ? "..." : "Subscribe"}
          </button>
        </form>
      </div>
    );
  }

  // Modal variant would be implemented here
  return null;
}

// Quick signup component for CTAs
export function QuickNewsletterSignup({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "quick-signup"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setEmail("");
      } else {
        setError(data.error || "Subscription failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-emerald-400 text-sm">✓ Subscribed! Check your email.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 glass-panel-secondary px-3 py-2 text-white placeholder-slate-500 text-sm focus:border-cyan-400/50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isLoading || !email}
        className="glass-panel px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors disabled:opacity-50"
      >
        {isLoading ? "..." : "Subscribe"}
      </button>
      {error && (
        <div className="absolute top-full left-0 right-0 text-rose-400 text-xs mt-1">
          {error}
        </div>
      )}
    </form>
  );
}
