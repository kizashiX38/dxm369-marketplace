"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeResponse } from '@/app/api/analytics/realtime/route';

// Simple SVG Sparkline component
function Sparkline({ points, color = '#22d3ee' }: { points: number[]; color?: string }) {
  if (points.length === 0) return <div className="h-10 w-full bg-slate-800/50 rounded" />;

  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const height = 40;
  const width = 200;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1 || 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={pathPoints}
      />
      <polyline
        fill={`${color}20`}
        stroke="none"
        points={`0,${height} ${pathPoints} ${width},${height}`}
      />
    </svg>
  );
}

// KPI Card component
function KPICard({
  title,
  value,
  subtitle,
  color = 'cyan',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'cyan' | 'green' | 'red' | 'amber';
}) {
  const colorClasses = {
    cyan: 'border-cyan-500/30 text-cyan-400',
    green: 'border-green-500/30 text-green-400',
    red: 'border-red-500/30 text-red-400',
    amber: 'border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`glass-panel-cyber rounded-lg p-4 border ${colorClasses[color]}`}>
      <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
        {title}
      </div>
      <div className={`text-2xl font-bold ${colorClasses[color].split(' ')[1]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

export default function TrafficLive() {
  const [data, setData] = useState<RealtimeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [tickCount, setTickCount] = useState(0);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [rateLimitedMsg, setRateLimitedMsg] = useState<string | null>(null);
  const [windowSec, setWindowSec] = useState<30 | 60 | 300>(60);
  const [windowHistory, setWindowHistory] = useState<number[]>([]);
  const [anomaly, setAnomaly] = useState<null | 'SPIKE' | 'QUIET'>(null);
  const abortRef = useRef<AbortController | null>(null);
  const backoffRef = useRef(2000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const response = await fetch(`/api/analytics/realtime?window=${windowSec}&limit=60`, {
        signal: abortRef.current.signal,
      });

      if (response.status === 429) {
        // Prefer server hint if provided
        let retryInSec = 5;
        try {
          const hint = await response.clone().json();
          if (hint && hint.error && typeof hint.error.retryIn !== 'undefined') {
            retryInSec = Number(hint.error.retryIn) || 5;
          }
        } catch {}
        // Jitter ±10%, cap at 10s, min 5s
        const jitterFactor = 0.9 + Math.random() * 0.2;
        backoffRef.current = Math.min(10000, Math.max(5000, Math.round(retryInSec * 1000 * jitterFactor)));
        setRateLimitedMsg(`Rate limited. Retrying in ${Math.round(backoffRef.current / 1000)}s...`);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      // Support new API contract { ok, data|error } and legacy shape
      if (json && json.ok === false) {
        if (json.error && json.error.code === 'rate_limited') {
          const retryInSec = Number(json.error.retryIn ?? 5);
          const jitterFactor = 0.9 + Math.random() * 0.2;
          backoffRef.current = Math.min(10000, Math.max(5000, Math.round(retryInSec * 1000 * jitterFactor)));
          setRateLimitedMsg(`Rate limited. Retrying in ${Math.round(backoffRef.current / 1000)}s...`);
          return;
        }
        throw new Error('API error');
      }

      const payload: RealtimeResponse = json && json.ok ? json.data : json;
      setData(payload);
      setError(null);
      setRateLimitedMsg(null);
      // Reset backoff on success (base 2s + jitter)
      backoffRef.current = 2000 + Math.floor(Math.random() * 500);

      // Update sparkline with rolling data
      setSparklineData(prev => {
        const newData = [...prev, payload.totals.requests];
        return newData.slice(-60); // Keep last 60 points
      });

      // Update window history and compute anomaly (rolling mean of last 5 windows)
      setWindowHistory(prev => {
        const hist = [...prev, payload.totals.requests].slice(-5);
        // Compute mean of previous windows (exclude latest for baseline)
        const baseline = hist.length > 1 ? hist.slice(0, -1) : hist;
        const mean = baseline.length > 0 ? baseline.reduce((a, b) => a + b, 0) / baseline.length : 0;
        const current = hist[hist.length - 1] ?? 0;
        let flag: null | 'SPIKE' | 'QUIET' = null;
        if (mean > 0) {
          if (current > 3 * mean) flag = 'SPIKE';
          else if (current < 0.2 * mean) flag = 'QUIET';
        }
        setAnomaly(flag);
        return hist;
      });

      setTickCount(prev => prev + 1);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // Exponential backoff on generic errors up to 10s with jitter
      const base = Math.min(backoffRef.current * 2, 10000);
      const jitter = Math.floor(Math.random() * 500);
      backoffRef.current = base + jitter;
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [windowSec]);

  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
      return;
    }

    const scheduleNext = () => {
      if (!isLive) return;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      intervalRef.current = setTimeout(async () => {
        await fetchData();
        scheduleNext();
      }, backoffRef.current);
    };

    // Kick off initial fetch + loop
    fetchData().then(() => scheduleNext());

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [isLive, fetchData, windowSec]);

  const handleTest = async () => {
    try {
      const response = await fetch(`/api/analytics/realtime?window=${windowSec}&limit=10`);
      const json = await response.json();
      setTestResult(`Status: ${response.status}\nKeys: ${Object.keys(json).join(', ')}\nRaw count: ${json.raw?.length || 0}\nSample: ${JSON.stringify(json.raw?.[0] || 'none')}`);
    } catch (err) {
      setTestResult(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const cachedPercent = data
    ? ((data.totals.cached / (data.totals.requests || 1)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="cyber-title text-2xl text-white">TRAFFIC INTELLIGENCE</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isLive ? 'bg-green-500/20 border border-green-500/40' : 'bg-slate-700/50 border border-slate-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className={`text-xs font-mono ${isLive ? 'text-green-400' : 'text-slate-400'}`}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          {/* Window Controls */}
          <div className="ml-2 flex items-center gap-1">
            {([30, 60, 300] as const).map(w => (
              <button
                key={w}
                onClick={() => setWindowSec(w)}
                className={`px-2 py-1 rounded text-[10px] font-mono ${
                  windowSec === w
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {w === 30 ? '30s' : w === 60 ? '1m' : '5m'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">
            Tick: {tickCount}
          </span>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded text-xs font-mono uppercase ${
              isLive
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}
      {rateLimitedMsg && (
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 text-amber-300 text-xs font-mono">
          {rateLimitedMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <KPICard
            title={`Requests (${windowSec === 30 ? '30s' : windowSec === 60 ? '60s' : '300s'})`}
            value={data?.totals.requests?.toLocaleString() || '—'}
            color="cyan"
          />
          {anomaly && (
            <div className={`absolute -top-2 -right-2 text-[10px] font-mono px-2 py-0.5 rounded ${
              anomaly === 'SPIKE' ? 'bg-red-500/30 border border-red-500/40 text-red-300' : 'bg-amber-500/30 border border-amber-500/40 text-amber-200'
            }`}>
              {anomaly}
            </div>
          )}
        </div>
        <KPICard
          title="Cached"
          value={`${cachedPercent}%`}
          subtitle={`${data?.totals.cached?.toLocaleString() || 0} hits`}
          color="green"
        />
        <KPICard
          title="Threats"
          value={data?.totals.threats || 0}
          color="red"
        />
        <KPICard
          title="Data Transfer"
          value={data ? formatBytes(data.totals.bytes) : '—'}
          color="amber"
        />
      </div>

      {/* Sparkline */}
      <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
          Requests Trend (60s rolling)
        </div>
        <Sparkline points={sparklineData} />
      </div>

      {/* Tables Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Paths */}
        <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
            Top Paths
          </div>
          <div className="space-y-1">
            {data?.topPaths.slice(0, 10).map((item, i) => (
              <div key={i} className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 truncate max-w-[150px]" title={item.path}>
                  {item.path}
                </span>
                <span className="text-cyan-400">{item.requests}</span>
              </div>
            )) || <div className="text-slate-500 text-xs">Loading...</div>}
          </div>
        </div>

        {/* Status Codes */}
        <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
            Status Distribution
          </div>
          <div className="space-y-1">
            {data?.statusCounts && Object.entries(data.statusCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([status, count]) => (
                <div key={status} className="flex justify-between text-xs font-mono">
                  <span className={`${
                    status.startsWith('2') ? 'text-green-400' :
                    status.startsWith('3') ? 'text-amber-400' :
                    status.startsWith('4') ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {status}
                  </span>
                  <span className="text-slate-300">{count}</span>
                </div>
              )) || <div className="text-slate-500 text-xs">Loading...</div>}
          </div>
        </div>

        {/* Countries */}
        <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
            Top Countries
          </div>
          <div className="space-y-1">
            {data?.byCountry && Object.entries(data.byCountry)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([country, count]) => (
                <div key={country} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate max-w-[120px]">{country}</span>
                  <span className="text-cyan-400">{count}</span>
                </div>
              )) || <div className="text-slate-500 text-xs">Loading...</div>}
          </div>
        </div>
      </div>

      {/* Test Button */}
      <details className="glass-panel-cyber rounded-lg border border-slate-700/50">
        <summary className="p-4 cursor-pointer text-xs font-mono text-slate-400 hover:text-slate-300">
          Debug / Test API
        </summary>
        <div className="p-4 pt-0 space-y-3">
          <button
            onClick={handleTest}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-xs font-mono text-slate-300 hover:bg-slate-700"
          >
            Test Fetch
          </button>
          {testResult && (
            <pre className="text-xs font-mono text-slate-400 bg-slate-900 p-3 rounded overflow-auto max-h-40">
              {testResult}
            </pre>
          )}
        </div>
      </details>

      {/* Timestamp */}
      <div className="text-xs font-mono text-slate-600 text-right">
        Last update: {data?.ts ? new Date(data.ts).toLocaleTimeString() : '—'}
      </div>
    </div>
  );
}
