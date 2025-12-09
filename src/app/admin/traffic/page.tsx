// Admin Traffic Dashboard - Server Component Shell
// Real-time Cloudflare analytics visualization

import TrafficLive from './TrafficLive';

export const metadata = {
  title: 'Traffic Intelligence | DXM369 Admin',
  description: 'Real-time traffic analytics dashboard',
};

export default function TrafficPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Status Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <span className="cyber-subtitle text-cyan-400">CLOUDFLARE ANALYTICS: CONNECTED</span>
        </div>

        <TrafficLive />

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800">
          <p className="text-xs font-mono text-slate-600">
            Data source: Cloudflare GraphQL Analytics API | Refresh: 2s | Window: 60s
          </p>
        </div>
      </div>
    </div>
  );
}
