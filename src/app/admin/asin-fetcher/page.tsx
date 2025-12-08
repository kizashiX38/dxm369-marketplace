'use client';

import { useState, useEffect } from 'react';
import { appConfig } from '@/lib/env';
import AdminAuth from '../components/AdminAuth';

interface FetcherStatus {
  status: 'online' | 'offline' | 'error';
  uptime: number;
  totalFetches: number;
  successRate: number;
  lastFetch: string | null;
  cacheSize: number;
  memory: number;
}

interface FetcherLog {
  timestamp: string;
  asin: string;
  source: 'paapi' | 'scraper' | 'seed' | 'error';
  duration: number;
  success: boolean;
}

export default function ASINFetcherPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState<FetcherStatus | null>(null);
  const [logs, setLogs] = useState<FetcherLog[]>([]);
  const [error, setError] = useState('');
  const [serverState, setServerState] = useState<'running' | 'stopped'>('running');

  // Auth check on mount
  useEffect(() => {
    const isDevMode = appConfig.publicEnv !== 'production';
    if (isDevMode) {
      setAuthenticated(true);
    } else {
      const key = sessionStorage.getItem('admin_key');
      if (key) {
        setAuthenticated(true);
      }
    }
  }, []);

  // Poll fetcher status
  useEffect(() => {
    if (!authenticated) return;

    const pollStatus = async () => {
      try {
        const res = await fetch('/api/admin/fetcher-status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data.data);
          setServerState(data.data.status === 'online' ? 'running' : 'stopped');
        }
      } catch (err) {
        console.error('Status poll failed:', err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [authenticated]);

  // Start fetcher
  const handleStart = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await fetch('/api/admin/fetcher-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (data.ok) {
        setServerState('running');
        setError('✅ Fetcher started');
      } else {
        setError(`❌ ${data.error}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setFetching(false);
    }
  };

  // Restart fetcher
  const handleRestart = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await fetch('/api/admin/fetcher-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' }),
      });
      const data = await res.json();
      if (data.ok) {
        setServerState('running');
        setError('✅ Fetcher restarted');
      } else {
        setError(`❌ ${data.error}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setFetching(false);
    }
  };

  // Stop fetcher
  const handleStop = async () => {
    if (!confirm('Stop the ASIN Fetcher? Active fetches will be interrupted.')) return;

    setFetching(true);
    setError('');
    try {
      const res = await fetch('/api/admin/fetcher-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await res.json();
      if (data.ok) {
        setServerState('stopped');
        setError('✅ Fetcher stopped');
      } else {
        setError(`❌ ${data.error}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setFetching(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    if (!confirm('Clear all ASIN cache? This cannot be undone.')) return;

    setFetching(true);
    try {
      const res = await fetch('/api/admin/fetcher-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      const data = await res.json();
      if (data.ok) {
        setError('✅ Cache cleared');
      } else {
        setError(`❌ ${data.error}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setFetching(false);
    }
  };

  const isDevMode = appConfig.publicEnv !== 'production';
  if (!authenticated && !isDevMode) {
    return <AdminAuth onAuthenticated={() => setAuthenticated(true)} />;
  }

  const statusColor = status?.status === 'online' ? 'text-green-400' : 'text-red-400';
  const statusBg = status?.status === 'online' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-lg rounded-t-xl mb-8 -mx-6 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            🔍 ASIN Fetcher Control
          </h1>
          <p className="text-slate-400">Manage ASIN fetching service, monitor status, and control operations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Status Card */}
        <div className={`p-6 rounded-xl border ${statusBg} backdrop-blur-sm shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Fetcher Status</h2>
            <div className={`px-4 py-2 rounded-lg ${statusColor} font-bold text-lg shadow-md`}>
              {status?.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Uptime</p>
              <p className="text-3xl font-mono font-bold text-cyan-400">
                {status?.uptime ? `${Math.floor(status.uptime / 60)}m` : '—'}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Total Fetches</p>
              <p className="text-3xl font-mono font-bold text-cyan-400">{status?.totalFetches || 0}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Success Rate</p>
              <p className="text-3xl font-mono font-bold text-cyan-400">{status?.successRate || 0}%</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Cache Size</p>
              <p className="text-3xl font-mono font-bold text-cyan-400">
                {status?.cacheSize ? `${(status.cacheSize / 1024 / 1024).toFixed(2)} MB` : '—'}
              </p>
            </div>
          </div>

          {status?.lastFetch && (
            <p className="text-sm text-slate-400 mt-4 border-t border-slate-700/50 pt-4">
              Last fetch: <span className="text-cyan-400 font-mono">{status.lastFetch}</span>
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`p-4 rounded-xl shadow-lg ${error.startsWith('✅') ? 'bg-green-900/20 border border-green-500/50 text-green-400' : 'bg-red-900/20 border border-red-500/50 text-red-400'}`}>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span> Server Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleStart}
              disabled={fetching || serverState === 'running'}
              className="p-5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-semibold transition-all hover:scale-105 active:scale-95 border border-green-500/30 shadow-lg hover:shadow-green-500/20"
            >
              {fetching ? '⏳ Starting...' : '▶️ Start Fetcher'}
            </button>
            <button
              onClick={handleRestart}
              disabled={fetching}
              className="p-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-semibold transition-all hover:scale-105 active:scale-95 border border-blue-500/30 shadow-lg hover:shadow-blue-500/20"
            >
              {fetching ? '⏳ Restarting...' : '🔄 Restart Fetcher'}
            </button>
            <button
              onClick={handleStop}
              disabled={fetching || serverState === 'stopped'}
              className="p-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-semibold transition-all hover:scale-105 active:scale-95 border border-red-500/30 shadow-lg hover:shadow-red-500/20"
            >
              {fetching ? '⏳ Stopping...' : '⏹️ Stop Fetcher'}
            </button>
          </div>
        </div>

        {/* Cache Management */}
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🗄️</span> Cache Management
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleClearCache}
              disabled={fetching}
              className="px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-semibold transition-all hover:scale-105 active:scale-95 border border-orange-500/30 shadow-lg hover:shadow-orange-500/20"
            >
              {fetching ? '⏳ Clearing...' : '🗑️ Clear Cache'}
            </button>
            {status?.cacheSize !== undefined && (
              <div className="bg-slate-700/50 px-6 py-3 rounded-xl border border-slate-600/50">
                <p className="text-sm text-slate-400 mb-1">Current cache size</p>
                <p className="text-xl font-mono font-bold text-cyan-400">
                  {(status.cacheSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span> Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">PA-API Status</p>
              <p className="text-lg text-cyan-400 font-mono font-semibold">✅ Configured</p>
            </div>
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">Scraper Service</p>
              <p className="text-sm text-cyan-400 font-mono">http://localhost:5000</p>
            </div>
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">Seed Database</p>
              <p className="text-sm text-cyan-400 font-mono">data/asin-seed.json</p>
            </div>
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">Max Batch Size</p>
              <p className="text-lg text-cyan-400 font-mono font-semibold">100 ASINs</p>
            </div>
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">Cache TTL</p>
              <p className="text-lg text-cyan-400 font-mono font-semibold">15 min</p>
            </div>
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">Timeout</p>
              <p className="text-lg text-cyan-400 font-mono font-semibold">30 sec</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span> Recent Fetches
          </h3>
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-slate-700/20 rounded-lg border border-slate-600/30">
              <p className="text-slate-400 text-lg">No recent activity</p>
              <p className="text-slate-500 text-sm mt-2">Fetch logs will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-700/50 rounded-xl shadow-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/70 border-b border-slate-700/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">Timestamp</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">ASIN</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">Source</th>
                    <th className="px-6 py-4 text-right text-slate-300 font-semibold">Duration</th>
                    <th className="px-6 py-4 text-center text-slate-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">{log.timestamp}</td>
                      <td className="px-6 py-4 font-mono text-cyan-400 font-semibold">{log.asin}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${
                          log.source === 'paapi' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                          log.source === 'scraper' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                          log.source === 'seed' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                          'bg-red-900/30 text-red-400 border border-red-500/30'
                        }`}>
                          {log.source === 'paapi' && '🟢 '}
                          {log.source === 'scraper' && '🟡 '}
                          {log.source === 'seed' && '🔵 '}
                          {log.source === 'error' && '❌ '}
                          {log.source.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-mono">{log.duration}ms</td>
                      <td className="px-6 py-4 text-center text-xl">
                        {log.success ? <span className="text-green-400">✅</span> : <span className="text-red-400">❌</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
