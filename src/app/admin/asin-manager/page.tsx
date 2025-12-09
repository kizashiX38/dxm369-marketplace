'use client';

import { useState, useEffect } from 'react';
import { appConfig } from '@/lib/env-client';
import AdminAuth from '../components/AdminAuth';

interface ASINProduct {
  id: string;
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  dxmScore: number;
  category: string;
  brand: string;
  source: string;
  imageUrl?: string;
}

interface BridgeHealth {
  status: string;
  service: string;
  version: string;
  asin_fetcher_ready: boolean;
  cache_ready: boolean;
}

interface CacheStats {
  total_cached: number;
  cache_size: number;
  hit_rate: number;
}

type TabType = 'fetch' | 'search' | 'database' | 'sync' | 'cache' | 'export';

export default function ASINControlCenter() {
  // Hydration state
  const [hydrated, setHydrated] = useState(false);

  // Auth state
  const [authenticated, setAuthenticated] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('fetch');
  const [bridgeHealth, setBridgeHealth] = useState<BridgeHealth | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch/Product state
  const [asins, setAsins] = useState<string>('B08WPRMVWB B0BZTDZL7J');
  const [products, setProducts] = useState<ASINProduct[]>([]);
  const [fetchTime, setFetchTime] = useState<number | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'brand' | 'category' | 'price'>('brand');
  const [searchResults, setSearchResults] = useState<ASINProduct[]>([]);

  // Database state
  const [dbProducts, setDbProducts] = useState<ASINProduct[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);

  // Cache state
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  // Mark component as hydrated after mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Development mode bypass on mount
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

  // Check bridge health on mount
  useEffect(() => {
    if (!authenticated) return;
    checkBridgeHealth();
    const interval = setInterval(checkBridgeHealth, 10000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // Load database stats on mount
  useEffect(() => {
    if (!authenticated) return;
    loadDatabaseStats();
  }, [authenticated]);

  const checkBridgeHealth = async () => {
    try {
      const response = await fetch('/api/admin/fetcher-status', {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      const data = await response.json();
      setBridgeHealth({
        status: data.data.status === 'online' ? 'healthy' : 'offline',
        service: 'ASIN Fetcher',
        version: '2.0',
        asin_fetcher_ready: data.data.status === 'online',
        cache_ready: true,
      });
      setError('');
    } catch (err) {
      setError('❌ Fetcher Server not responding');
      setBridgeHealth(null);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/admin/products-db?action=stats', {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDbStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load DB stats:', err);
    }
  };

  // ==================== TAB: FETCH ASIN DATA (SHADOW SCRAPER) ====================
  const fetchASINs = async () => {
    if (!asins.trim()) {
      setError('Please enter at least one ASIN');
      return;
    }

    setLoading(true);
    setError('');
    const startTime = Date.now();

    try {
      const asinList = asins
        .split(/[\s,]+/)
        .map((a) => a.trim().toUpperCase())
        .filter((a) => a.length > 0);

      if (asinList.length > 10) {
        setError('⚠️ Maximum 10 ASINs per request');
        setLoading(false);
        return;
      }

      // Use Shadow Scraper API instead of PA-API
      const response = await fetch(`/api/shadow/scrape?asins=${asinList.join(',')}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const fetched = data.data?.products || [];

      // Transform shadow scraper data to match product interface
      const transformedProducts = fetched.map((p: any) => ({
        id: p.asin,
        asin: p.asin,
        title: p.title,
        price: p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        dxmScore: calculateQuickDXMScore(p),
        category: p.category,
        brand: p.brand,
        source: 'shadow-scraper',
        imageUrl: p.imageUrl,
      }));

      setProducts(transformedProducts);
      setFetchTime(Date.now() - startTime);
      setError(`✅ Shadow Scraper: Fetched ${fetched.length} products (${data.data?.errors?.length || 0} failed)`);
    } catch (err) {
      setError(`Shadow Scraper Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Quick DXM Score calculation
  const calculateQuickDXMScore = (product: any): number => {
    let score = 5; // Base score

    // Price value (if discount exists)
    if (product.discountPercent && product.discountPercent > 0) {
      score += Math.min(product.discountPercent / 10, 2); // Max +2 for discounts
    }

    // Rating boost
    if (product.rating >= 4.5) score += 1.5;
    else if (product.rating >= 4.0) score += 1;
    else if (product.rating >= 3.5) score += 0.5;

    // Review count (social proof)
    if (product.reviewCount > 1000) score += 1;
    else if (product.reviewCount > 500) score += 0.5;

    // Availability boost
    if (product.availability?.toLowerCase().includes('in stock')) score += 0.5;

    return Math.min(Math.round(score * 10) / 10, 10); // Cap at 10
  };

  // ==================== TAB: SEARCH PRODUCTS ====================
  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const filtered = products.filter((p) => {
        const query = searchQuery.toLowerCase();
        if (searchType === 'brand') return p.brand.toLowerCase().includes(query);
        if (searchType === 'category') return p.category.toLowerCase().includes(query);
        if (searchType === 'price') {
          const price = parseFloat(searchQuery);
          return !isNaN(price) && p.price <= price;
        }
        return false;
      });

      setSearchResults(filtered);
      if (filtered.length === 0) {
        setError(`No products found matching "${searchQuery}"`);
      } else {
        setError(`✅ Found ${filtered.length} product(s)`);
      }
    } catch (err) {
      setError(`Search error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // ==================== TAB: DATABASE TOOLS ====================
  const importProducts = async (file: File) => {
    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        data = lines.slice(1).map((line) => {
          const values = line.split(',');
          return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i]?.trim();
            return obj;
          }, {} as any);
        });
      } else {
        throw new Error('Unsupported file format. Use JSON or CSV.');
      }

      const response = await fetch('/api/admin/products-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({
          action: 'bulkImport',
          products: Array.isArray(data) ? data : [data],
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setError(`✅ ${result.message}`);
        await loadDatabaseStats();
      } else {
        setError(`❌ ${result.error}`);
      }
    } catch (err) {
      setError(`Import error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // ==================== TAB: CACHE MANAGEMENT ====================
  const loadCacheStats = async () => {
    setCacheLoading(true);
    try {
      const response = await fetch('/api/admin/fetcher-cache?action=stats', {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      const data = await response.json();
      setCacheStats({
        total_cached: 0,
        cache_size: 0,
        hit_rate: 0,
      });
      setError('');
    } catch (err) {
      setError('Error loading cache stats');
    } finally {
      setCacheLoading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Clear all cached ASINs? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/admin/fetcher-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({ action: 'clear' }),
      });
      if (response.ok) {
        setError('');
        setCacheStats(null);
        await loadCacheStats();
        setError('✅ Cache cleared successfully');
      }
    } catch (err) {
      setError(`Error clearing cache: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // ==================== TAB: SYNC TO MARKETPLACE ====================
  const syncProducts = async (productsToSync: ASINProduct[]) => {
    if (productsToSync.length === 0) {
      setError('No products to sync. Fetch ASINs first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/products-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({
          action: 'bulkImport',
          products: productsToSync,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync error: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts([]);
      setAsins('');
      setError(`✅ ${productsToSync.length} products synced to database!`);
      await loadDatabaseStats();
    } catch (err) {
      setError(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // ==================== TAB: EXPORT ====================
  const exportProducts = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/products-export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setError('✅ Products exported successfully');
    } catch (err) {
      setError(`Export error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // ==================== RENDER ====================
  const isDevMode = appConfig.publicEnv !== 'production';
  if (!authenticated && !isDevMode) {
    return <AdminAuth onAuthenticated={() => setAuthenticated(true)} />;
  }

  const bridgeStatus = bridgeHealth?.status === 'healthy' ? '✅ Healthy' : '❌ Offline';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-lg rounded-t-xl mb-8 -mx-6 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ⚙️ DXM ASIN Manager
          </h1>
          <p className="text-slate-400">Fetch, search, manage, and sync products with the marketplace</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Fetcher Status Card */}
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm shadow-lg flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">🔍</span> ASIN Fetcher Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/30">
                <p className="text-slate-400 mb-1">Status</p>
                <p className={`text-lg font-semibold ${bridgeHealth?.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                  {bridgeStatus}
                </p>
              </div>
              {bridgeHealth && (
                <>
                  <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/30">
                    <p className="text-slate-400 mb-1">Service</p>
                    <p className="text-lg font-semibold text-cyan-400">{bridgeHealth.service}</p>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/30">
                    <p className="text-slate-400 mb-1">Fetcher</p>
                    <p className={`text-lg font-semibold ${bridgeHealth.asin_fetcher_ready ? 'text-green-400' : 'text-red-400'}`}>
                      {bridgeHealth.asin_fetcher_ready ? '✅ Ready' : '❌ Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={checkBridgeHealth}
            className="ml-6 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-cyan-500/30 shadow-lg"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`p-4 rounded-xl shadow-lg ${error.startsWith('✅') ? 'bg-green-900/20 border border-green-500/50 text-green-400' : 'bg-red-900/20 border border-red-500/50 text-red-400'}`}>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-700/50 overflow-x-auto bg-slate-800/20 p-1 rounded-t-xl">
          {[
            { key: 'fetch' as TabType, label: '🔍 Fetch', icon: '📥' },
            { key: 'search' as TabType, label: '🔎 Search', icon: '🔎' },
            { key: 'database' as TabType, label: '🗄️ Database', icon: '🗄️' },
            { key: 'cache' as TabType, label: '💾 Cache', icon: '💾' },
            { key: 'sync' as TabType, label: '🔄 Sync', icon: '🔄' },
            { key: 'export' as TabType, label: '📤 Export', icon: '📤' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              className={`px-6 py-3 font-semibold transition-all rounded-lg whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800/20 p-6 rounded-b-xl border border-t-0 border-slate-700/50">
          {/* TAB: FETCH ASINS */}
          {activeTab === 'fetch' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  📋 Enter ASINs (space or comma separated)
                </label>
                <textarea
                  value={asins}
                  onChange={(e) => setAsins(e.target.value)}
                  placeholder="B0BJQRXJZD B0CCLPW7LQ B0DVCBDJBJ"
                  className="w-full h-40 px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono text-sm shadow-inner"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={fetchASINs}
                  disabled={loading}
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-cyan-500/30 shadow-lg flex-1 text-lg"
                >
                  {loading ? '⏳ Fetching...' : '🚀 Fetch ASINs'}
                </button>
                <button
                  onClick={() => { setProducts([]); setAsins(''); setFetchTime(null); }}
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-slate-600/50 shadow-lg"
                >
                  🗑️ Clear
                </button>
              </div>
              {fetchTime && products.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-sm text-green-400 font-semibold">
                    ⏱️ Successfully fetched {products.length} products in {fetchTime}ms
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: SEARCH PRODUCTS */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Search Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="w-full px-5 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                  >
                    <option value="brand">Brand</option>
                    <option value="category">Category</option>
                    <option value="price">Max Price</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Query</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchType === 'price' ? '999.99' : 'Search...'}
                    className="w-full px-5 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={searchProducts}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-blue-500/30 shadow-lg"
                  >
                    {loading ? '⏳ Searching...' : '🔍 Search'}
                  </button>
                </div>
              </div>
              {searchResults.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/50 text-blue-400 shadow-lg">
                  <p className="font-semibold">✅ Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: DATABASE TOOLS */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Database Stats */}
              {dbStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Total Products</p>
                    <p className="text-4xl font-bold text-cyan-400">{dbStats.totalProducts || 0}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Last Sync</p>
                    <p className="text-lg font-mono text-cyan-400">{dbStats.lastSync ? new Date(dbStats.lastSync).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Categories</p>
                    <p className="text-4xl font-bold text-cyan-400">{Object.keys(dbStats.byCategory || {}).length}</p>
                  </div>
                </div>
              )}

              {/* Import Section */}
              <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📥</span> Import Products
                </h3>
                <label className="flex-1 px-8 py-6 rounded-xl bg-slate-900/50 border-2 border-dashed border-slate-600/50 text-slate-400 text-center cursor-pointer hover:border-cyan-500 hover:bg-slate-900/70 transition-all block">
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        importProducts(e.target.files[0]);
                      }
                    }}
                    disabled={loading}
                    className="hidden"
                  />
                  <div className="text-lg font-semibold">
                    {loading ? '⏳ Importing...' : '📁 Choose JSON or CSV file'}
                  </div>
                  <div className="text-sm text-slate-500 mt-2">Click to browse or drag and drop</div>
                </label>
              </div>
            </div>
          )}

          {/* TAB: CACHE MANAGEMENT */}
          {activeTab === 'cache' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={loadCacheStats}
                  disabled={cacheLoading}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-blue-500/30 shadow-lg flex-1"
                >
                  {cacheLoading ? '⏳ Loading...' : '📊 Load Cache Stats'}
                </button>
                <button
                  onClick={clearCache}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-red-500/30 shadow-lg flex-1"
                >
                  🗑️ Clear Cache
                </button>
              </div>
              {cacheStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Cached Products</p>
                    <p className="text-4xl font-bold text-cyan-400">{cacheStats.total_cached}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Cache Size</p>
                    <p className="text-4xl font-bold text-cyan-400">{(cacheStats.cache_size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Hit Rate</p>
                    <p className="text-4xl font-bold text-cyan-400">{(cacheStats.hit_rate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SYNC TO DATABASE */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔄</span> Ready Products
                </h3>
                {products.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                      <p className="text-slate-300 text-lg">
                        <span className="font-bold text-cyan-400">{products.length}</span> product{products.length !== 1 ? 's' : ''} ready to sync
                      </p>
                    </div>
                    <button
                      onClick={() => syncProducts(products)}
                      disabled={loading}
                      className="w-full px-8 py-5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border border-green-500/30 shadow-lg text-xl"
                    >
                      {loading ? '⏳ Syncing...' : `🚀 Sync ${products.length} Products to Database`}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-700/20 rounded-xl border border-slate-600/30">
                    <p className="text-slate-400 text-lg">No products fetched</p>
                    <p className="text-slate-500 text-sm mt-2">Go to &quot;Fetch&quot; tab first to load products</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">📤</span> Export Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => exportProducts('json')}
                    className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500 hover:bg-slate-900/70 transition-all hover:scale-105 active:scale-95 text-left shadow-lg"
                  >
                    <div className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                      📋 Export as JSON
                    </div>
                    <div className="text-sm text-slate-400">Structured format for databases and APIs</div>
                  </button>
                  <button
                    onClick={() => exportProducts('csv')}
                    className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500 hover:bg-slate-900/70 transition-all hover:scale-105 active:scale-95 text-left shadow-lg"
                  >
                    <div className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                      📊 Export as CSV
                    </div>
                    <div className="text-sm text-slate-400">Spreadsheet compatible format for Excel</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Table - Show for Fetch and Search tabs */}
          {(activeTab === 'fetch' || activeTab === 'search') && (products.length > 0 || searchResults.length > 0) && (
            <div className="mt-6 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {activeTab === 'search' ? `Search Results (${searchResults.length})` : `Fetched Products (${products.length})`}
              </h3>
              <div className="overflow-x-auto border border-slate-700/50 rounded-xl shadow-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/70 border-b border-slate-700/70">
                    <tr>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">ASIN</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Title</th>
                      <th className="px-6 py-4 text-right text-slate-300 font-semibold">Price</th>
                      <th className="px-6 py-4 text-center text-slate-300 font-semibold">Rating</th>
                      <th className="px-6 py-4 text-right text-slate-300 font-semibold">DXM Score</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {(activeTab === 'search' ? searchResults : products).map((product) => (
                      <tr key={product.asin} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-cyan-400 font-semibold">{product.asin}</td>
                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{product.title}</td>
                        <td className="px-6 py-4 text-right text-slate-300 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center text-amber-400 font-semibold">⭐ {(product.rating ?? 0).toFixed(1)}</td>
                        <td className="px-6 py-4 text-right font-bold text-cyan-400 text-lg">{(product.dxmScore ?? 0).toFixed(1)}/10</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-lg bg-slate-700/50 text-cyan-400 uppercase text-xs font-semibold border border-slate-600/30">
                            {product.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
