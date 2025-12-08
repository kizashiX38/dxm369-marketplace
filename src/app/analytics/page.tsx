// src/app/analytics/page.tsx
// DXM Internal Analytics Dashboard
// Real-time insights, performance metrics, and revenue optimization

"use client";

import { useState, useEffect } from "react";
import { Metadata } from "next";

interface AnalyticsData {
  scoreDistribution: Record<string, number>;
  categoryPerformance: Record<string, any>;
  marketInsights: any;
  featuredDeals: any[];
  trendingDeals: any[];
  timestamp: string;
}

interface ScoreAnalytics {
  scoreHistogram: Array<{range: string; count: number; percentage: number}>;
  categoryScores: Record<string, number[]>;
  scoreStats: any;
}

interface PerformanceMetrics {
  performanceMetrics: any;
  categoryPerformance: any;
  systemHealth: any;
}

interface RevenueMetrics {
  revenueMetrics: any;
  scoreConversionCorrelation: any[];
  categoryRevenue: any;
  recommendations: string[];
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'performance' | 'revenue'>('overview');
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    overview?: AnalyticsData;
    scores?: ScoreAnalytics;
    performance?: PerformanceMetrics;
    revenue?: RevenueMetrics;
  }>({});

  const fetchAnalytics = async (metric: string, tf: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dxm/analytics?metric=${metric}&timeframe=${tf}`);
      const result = await response.json();
      
      setData(prev => ({
        ...prev,
        [metric]: result
      }));
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(activeTab, timeframe);
  }, [activeTab, timeframe]);

  // Auto-refresh every 30 seconds for real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics(activeTab, timeframe);
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, timeframe]);

  return (
    <div className="min-h-screen bg-[#080c12] text-slate-200 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              📊 DXM Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Real-time marketplace intelligence & performance metrics</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Timeframe:</span>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-800/30 p-1 rounded-lg">
          {[
            { key: 'overview', label: '🎯 Overview', icon: '📈' },
            { key: 'scores', label: '🎲 Scores', icon: '📊' },
            { key: 'performance', label: '⚡ Performance', icon: '🚀' },
            { key: 'revenue', label: '💰 Revenue', icon: '💎' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-slate-400">Loading analytics...</span>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && data.overview && !loading && (
        <OverviewTab data={data.overview} />
      )}

      {/* Scores Tab */}
      {activeTab === 'scores' && data.scores && !loading && (
        <ScoresTab data={data.scores} />
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && data.performance && !loading && (
        <PerformanceTab data={data.performance} />
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && data.revenue && !loading && (
        <RevenueTab data={data.revenue} />
      )}

      {/* Last Updated */}
      {!loading && (
        <div className="mt-8 text-center text-xs text-slate-500">
          Last updated: {data.overview && 'timestamp' in data.overview ? new Date(data.overview.timestamp).toLocaleString() : 'Never'}
        </div>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Deals"
          value={data.marketInsights.totalDeals}
          icon="🛍️"
          trend="+12%"
        />
        <MetricCard
          title="Avg DXM Score"
          value={data.marketInsights.avgDxmScore.toFixed(2)}
          icon="🎯"
          trend="+0.3"
        />
        <MetricCard
          title="Top Performers"
          value={data.marketInsights.topPerformers.length}
          icon="⭐"
          trend="+2"
        />
        <MetricCard
          title="Best Values"
          value={data.marketInsights.bestValues.length}
          icon="💎"
          trend="+5"
        />
      </div>

      {/* Score Distribution */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">📊 Score Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.scoreDistribution).map(([range, count]) => (
            <div key={range} className="text-center">
              <div className="text-2xl font-bold text-slate-200">{count}</div>
              <div className="text-sm text-slate-400 capitalize">{range.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(data.categoryPerformance).map(([category, perf]: [string, any]) => (
          <div key={category} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-cyan-400 capitalize">
              {category === 'gpu' ? '🎮 GPUs' : category === 'cpu' ? '🔧 CPUs' : '💻 Laptops'}
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Products:</span>
                <span className="font-medium">{perf.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Score:</span>
                <span className="font-medium text-cyan-400">{perf.avgScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Top Score:</span>
                <span className="font-medium text-green-400">{perf.topScore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Price:</span>
                <span className="font-medium">${perf.avgPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performers */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">⭐ Top Performers (DXM Score ≥ 9.0)</h3>
        <div className="space-y-3">
          {data.marketInsights.topPerformers.map((deal: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <div className="font-medium text-slate-200">{deal.title}</div>
                <div className="text-sm text-slate-400">{deal.brand} • {deal.category}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400">{deal.dxmScore.toFixed(2)}</div>
                <div className="text-sm text-slate-400">${deal.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Scores Tab Component
function ScoresTab({ data }: { data: ScoreAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Score Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">📈 Overall Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Mean:</span>
              <span className="font-medium">{data.scoreStats.overall.mean}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Median:</span>
              <span className="font-medium">{data.scoreStats.overall.median}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Std Dev:</span>
              <span className="font-medium">{data.scoreStats.overall.stdDev}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Range:</span>
              <span className="font-medium">{data.scoreStats.overall.min} - {data.scoreStats.overall.max}</span>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        {Object.entries(data.scoreStats.byCategory).map(([category, stats]: [string, any]) => (
          <div key={category} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400 capitalize">
              {category === 'gpu' ? '🎮 GPU' : category === 'cpu' ? '🔧 CPU' : '💻 Laptop'} Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Mean:</span>
                <span className="font-medium">{stats.mean}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Median:</span>
                <span className="font-medium">{stats.median}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Count:</span>
                <span className="font-medium">{stats.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Range:</span>
                <span className="font-medium">{stats.min} - {stats.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Histogram */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">📊 Score Distribution Histogram</h3>
        <div className="space-y-2">
          {data.scoreHistogram.map((bucket, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-slate-400">{bucket.range}</div>
              <div className="flex-1 bg-slate-700/50 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${bucket.percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {bucket.count} ({bucket.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({ data }: { data: PerformanceMetrics }) {
  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">🚀 System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{data.systemHealth.status.toUpperCase()}</div>
            <div className="text-sm text-slate-400">System Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{data.systemHealth.uptime}</div>
            <div className="text-sm text-slate-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">{data.systemHealth.activeAlerts}</div>
            <div className="text-sm text-slate-400">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold mb-4 text-cyan-400">⚡ API Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Response:</span>
              <span className="font-medium">{data.performanceMetrics.apiResponseTime.avg}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P95:</span>
              <span className="font-medium">{data.performanceMetrics.apiResponseTime.p95}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P99:</span>
              <span className="font-medium">{data.performanceMetrics.apiResponseTime.p99}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Throughput:</span>
              <span className="font-medium">{data.performanceMetrics.throughput} req/min</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold mb-4 text-cyan-400">🧮 Score Calculation</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Time:</span>
              <span className="font-medium">{data.performanceMetrics.scoreCalculationTime.avg}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P95:</span>
              <span className="font-medium">{data.performanceMetrics.scoreCalculationTime.p95}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cache Hit Rate:</span>
              <span className="font-medium text-green-400">{(data.performanceMetrics.cacheHitRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Error Rate:</span>
              <span className="font-medium text-red-400">{(data.performanceMetrics.errorRate * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">📊 Algorithm Performance by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(data.categoryPerformance).map(([category, perf]: [string, any]) => (
            <div key={category} className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 capitalize">
                {category === 'gpu' ? '🎮 GPUs' : category === 'cpu' ? '🔧 CPUs' : '💻 Laptops'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Calc Time:</span>
                  <span>{perf.avgCalculationTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy:</span>
                  <span className="text-green-400">{(perf.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="text-cyan-400">{(perf.coverage * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Revenue Tab Component
function RevenueTab({ data }: { data: RevenueMetrics }) {
  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Est. Revenue"
          value={`$${data.revenueMetrics.estimatedRevenue.toLocaleString()}`}
          icon="💰"
          trend="+15.2%"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(data.revenueMetrics.conversionRate * 100).toFixed(2)}%`}
          icon="🎯"
          trend="+0.8%"
        />
        <MetricCard
          title="Est. Clicks"
          value={data.revenueMetrics.estimatedClicks.toLocaleString()}
          icon="👆"
          trend="+23%"
        />
        <MetricCard
          title="Revenue/Visitor"
          value={`$${data.revenueMetrics.revenuePerVisitor.toFixed(2)}`}
          icon="👤"
          trend="+$0.15"
        />
      </div>

      {/* Score-Conversion Correlation */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">📈 Score vs Conversion Rate</h3>
        <div className="space-y-3">
          {data.scoreConversionCorrelation.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">{item.scoreRange}</div>
                <div className="flex-1 bg-slate-600/50 rounded-full h-2 relative overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                    style={{ width: `${item.conversionRate * 1000}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-400">{(item.conversionRate * 100).toFixed(2)}%</div>
                <div className="text-xs text-slate-400">${item.avgOrderValue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(data.categoryRevenue).map(([category, revenue]: [string, any]) => (
          <div key={category} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-cyan-400 capitalize">
              {category === 'gpu' ? '🎮 GPU' : category === 'cpu' ? '🔧 CPU' : '💻 Laptop'} Revenue
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Revenue:</span>
                <span className="font-medium text-green-400">${revenue.estimatedRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Order:</span>
                <span className="font-medium">${revenue.avgOrderValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conv. Rate:</span>
                <span className="font-medium">{(revenue.conversionRate * 100).toFixed(2)}%</span>
              </div>
              <div className="text-xs text-slate-400 mt-3">
                Top: {revenue.topPerformer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">💡 Revenue Optimization Recommendations</h3>
        <div className="space-y-3">
          {data.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-cyan-400 mt-0.5">💡</div>
              <div className="text-sm text-slate-300">{rec}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, trend }: { title: string; value: string | number; icon: string; trend?: string }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-200 mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}
