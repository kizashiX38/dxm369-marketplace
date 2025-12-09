"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface TelemetryEvent {
  ts: number;
  path: string;
  ref: string;
  uaHash: string;
  ipHash?: string;
  country?: string;
}

// Sparkline component
function Sparkline({ points, color = '#22d3ee' }: { points: number[]; color?: string }) {
  if (points.length === 0) return <div className="h-8 w-full bg-slate-800/50 rounded" />;

  const max = Math.max(...points, 1);
  const height = 32;
  const width = 200;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1 || 1)) * width;
    const y = height - (p / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pathPoints} />
      <polyline fill={`${color}20`} stroke="none" points={`0,${height} ${pathPoints} ${width},${height}`} />
    </svg>
  );
}

// Live event card
function EventCard({ event }: { event: TelemetryEvent }) {
  const age = Math.round((Date.now() - event.ts) / 1000);

  return (
    <div className="glass-panel-cyber rounded p-3 border border-cyan-500/20 animate-pulse-once">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-mono text-cyan-400 truncate" title={event.path}>
            {event.path}
          </div>
          {event.ref && (
            <div className="text-xs font-mono text-slate-500 truncate" title={event.ref}>
              from: {new URL(event.ref).hostname || event.ref}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          {event.country && (
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
              {event.country}
            </span>
          )}
          <span className="text-xs font-mono text-slate-500">
            {age}s ago
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DXMMonitorPage() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    eventsPerMin: 0,
    topPaths: new Map<string, number>(),
    topReferrers: new Map<string, number>(),
    countries: new Map<string, number>(),
  });
  const [sparklineData, setSparklineData] = useState<number[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const eventsRef = useRef<TelemetryEvent[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingEventsRef = useRef<TelemetryEvent[]>([]);

  const connect = useCallback(() => {
    const telemetryUrl = process.env.NEXT_PUBLIC_TELEMETRY_URL;

    if (!telemetryUrl) {
      setError('NEXT_PUBLIC_TELEMETRY_URL not configured');
      return;
    }

    const wsUrl = telemetryUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (e) => {
        try {
          const event: TelemetryEvent = JSON.parse(e.data);

          // Buffer incoming events and flush at most every 100ms
          pendingEventsRef.current = [event, ...pendingEventsRef.current];

          if (!flushTimeoutRef.current) {
            flushTimeoutRef.current = setTimeout(() => {
              const pending = pendingEventsRef.current;
              pendingEventsRef.current = [];
              flushTimeoutRef.current = null;

              if (pending.length === 0) return;

              // Merge into main buffer (keep last 200)
              eventsRef.current = [...pending, ...eventsRef.current].slice(0, 200);
              setEvents([...eventsRef.current]);
            }, 100);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        // Jittered reconnect between 500-1500ms, with cap via reuse of connect
        const delay = 500 + Math.floor(Math.random() * 1000);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setError('WebSocket connection failed');
        ws.close();
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, [connect]);

  // Calculate stats every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      // Filter events from last minute
      const recentEvents = eventsRef.current.filter(e => e.ts > oneMinuteAgo);

      // Calculate rate
      const eventsPerMin = recentEvents.length;

      // Aggregate paths
      const topPaths = new Map<string, number>();
      const topReferrers = new Map<string, number>();
      const countries = new Map<string, number>();

      for (const event of recentEvents) {
        topPaths.set(event.path, (topPaths.get(event.path) || 0) + 1);

        if (event.ref) {
          try {
            const host = new URL(event.ref).hostname;
            topReferrers.set(host, (topReferrers.get(host) || 0) + 1);
          } catch {
            topReferrers.set(event.ref, (topReferrers.get(event.ref) || 0) + 1);
          }
        }

        if (event.country) {
          countries.set(event.country, (countries.get(event.country) || 0) + 1);
        }
      }

      setStats({ eventsPerMin, topPaths, topReferrers, countries });

      // Update sparkline
      setSparklineData(prev => [...prev, eventsPerMin].slice(-60));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sortedPaths = Array.from(stats.topPaths.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const sortedReferrers = Array.from(stats.topReferrers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const sortedCountries = Array.from(stats.countries.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="cyber-title text-2xl text-white">DXM MONITOR</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              connected
                ? 'bg-green-500/20 border border-green-500/40'
                : 'bg-red-500/20 border border-red-500/40'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              <span className={`text-xs font-mono ${
                connected ? 'text-green-400' : 'text-red-400'
              }`}>
                {connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Buffer: {events.length}/200
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-6 text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/30">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Events/Min
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              {stats.eventsPerMin}
            </div>
          </div>
          <div className="glass-panel-cyber rounded-lg p-4 border border-green-500/30">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Unique Paths
            </div>
            <div className="text-2xl font-bold text-green-400">
              {stats.topPaths.size}
            </div>
          </div>
          <div className="glass-panel-cyber rounded-lg p-4 border border-amber-500/30">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Referrers
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {stats.topReferrers.size}
            </div>
          </div>
          <div className="glass-panel-cyber rounded-lg p-4 border border-purple-500/30">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Countries
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.countries.size}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20 mb-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Events/Min (60s rolling)
          </div>
          <Sparkline points={sparklineData} />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Top Paths */}
          <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Top Paths (1 min)
            </div>
            <div className="space-y-1">
              {sortedPaths.map(([path, count]) => (
                <div key={path} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate max-w-[150px]" title={path}>
                    {path}
                  </span>
                  <span className="text-cyan-400">{count}</span>
                </div>
              ))}
              {sortedPaths.length === 0 && (
                <div className="text-slate-500 text-xs">Waiting for events...</div>
              )}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Top Referrers (1 min)
            </div>
            <div className="space-y-1">
              {sortedReferrers.map(([ref, count]) => (
                <div key={ref} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate max-w-[150px]" title={ref}>
                    {ref}
                  </span>
                  <span className="text-amber-400">{count}</span>
                </div>
              ))}
              {sortedReferrers.length === 0 && (
                <div className="text-slate-500 text-xs">No referrers yet...</div>
              )}
            </div>
          </div>

          {/* Countries */}
          <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Countries (1 min)
            </div>
            <div className="space-y-1">
              {sortedCountries.map(([country, count]) => (
                <div key={country} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{country}</span>
                  <span className="text-purple-400">{count}</span>
                </div>
              ))}
              {sortedCountries.length === 0 && (
                <div className="text-slate-500 text-xs">No country data yet...</div>
              )}
            </div>
          </div>
        </div>

        {/* Live Events Feed */}
        <div className="glass-panel-cyber rounded-lg p-4 border border-cyan-500/20">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
            Live Events
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.slice(0, 20).map((event, i) => (
              <EventCard key={`${event.ts}-${i}`} event={event} />
            ))}
            {events.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-8">
                Waiting for incoming events...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs font-mono text-slate-600 text-center">
          DXM Telemetry Node | WebSocket: {connected ? 'Connected' : 'Reconnecting...'}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-once {
          0% { opacity: 0; transform: translateX(-10px); }
          50% { opacity: 1; }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-pulse-once {
          animation: pulse-once 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
