// src/components/SearchBar.tsx
// Client-side search component to prevent hydration issues

"use client";

import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        suppressHydrationWarning
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search hardware..."
        className="w-64 px-3 py-2 glass-panel-secondary text-sm font-mono placeholder-slate-500 text-white focus:border-cyan-400/50 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
