'use client';

import { useState, useEffect, useCallback } from 'react';

const CATEGORIES = ['gpu', 'cpu', 'laptop', 'monitor', 'psu', 'ssd', 'motherboard', 'ram'];

interface Product {
  id: number;
  asin: string;
  category: string;
  title: string;
  price?: number;
  visible: boolean;
  last_synced?: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('gpu');
  const [showHidden, setShowHidden] = useState(false);
  const [asin, setAsin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products/list?category=${selectedCategory}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      const data = await res.json();
      if (data.ok) {
        setProducts(data.products || []);
      } else {
        setMessage(`Failed to load: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, showHidden]);

  async function addProduct() {
    if (!asin.trim()) {
      setMessage('Enter ASIN');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({ asin, category: selectedCategory })
      });

      const data = await res.json();
      if (data.ok) {
        setMessage(`✅ Added ${asin}`);
        setAsin('');
        loadProducts();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisible(id: number, visible: boolean) {
    try {
      const res = await fetch('/api/admin/products/toggleVisible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({ id, visible: !visible })
      });

      if ((await res.json()).ok) {
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function refreshProduct(id: number) {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      setMessage(data.ok ? '✅ Refreshed' : `❌ ${data.error}`);
      loadProducts();
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete?')) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify({ id })
      });

      if ((await res.json()).ok) {
        setMessage('✅ Deleted');
        loadProducts();
      }
    } finally {
      setLoading(false);
    }
  }

  async function bulkImport() {
    if (!fileInput) {
      setMessage('Select file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', fileInput);

      const res = await fetch('/api/admin/products/bulkImport', {
        method: 'POST',
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: formData
      });

      const data = await res.json();
      if (data.ok) {
        setMessage(`✅ Imported ${data.data.success}, Failed ${data.data.failed}`);
        setFileInput(null);
        loadProducts();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          🛍️ Products Management
        </h1>
        <p className="text-slate-400 mt-2">
          Add, remove, and manage your product catalog
        </p>
      </div>

      {message && (
        <div className="p-4 bg-slate-800 border border-cyan-400 rounded-lg">
          {message}
        </div>
      )}

      {/* Add Single Product */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-cyan-300">Add Product</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="ASIN (B0XXXXXXXXX)"
            value={asin}
            onChange={(e) => setAsin(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2 bg-slate-900 border border-cyan-400/30 rounded-lg text-white font-mono"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-cyan-400/30 rounded-lg text-white font-mono"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={addProduct}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg font-bold text-white"
          >
            Add
          </button>
        </div>
      </div>

      {/* Bulk Import */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-cyan-300">Bulk Import</h2>
        <div className="flex gap-4">
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => setFileInput(e.target.files?.[0] || null)}
            className="flex-1 px-4 py-2 bg-slate-900 border border-cyan-400/30 rounded-lg text-white"
          />
          <button
            onClick={bulkImport}
            disabled={loading || !fileInput}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg font-bold text-white"
          >
            Import
          </button>
        </div>
        <p className="text-xs text-slate-400">CSV format: asin, category, title</p>
      </div>

      {/* Product List */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-cyan-300">Products ({selectedCategory.toUpperCase()})</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {products.length === 0 ? (
            <p className="text-slate-400">No products. Add one above.</p>
          ) : (
            products.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 border border-cyan-400/20 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-cyan-300">{p.asin}</div>
                  <div className="text-sm truncate">{p.title}</div>
                  <div className="text-xs text-slate-400">
                    {p.price && `$${p.price.toFixed(2)}`}
                    {p.last_synced && ` • Synced: ${new Date(p.last_synced).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => refreshProduct(p.id)}
                    disabled={loading}
                    title="Refresh from Amazon"
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded font-bold"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => toggleVisible(p.id, p.visible)}
                    disabled={loading}
                    title={p.visible ? 'Hide' : 'Show'}
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded font-bold"
                  >
                    {p.visible ? '👁' : '🚫'}
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    disabled={loading}
                    title="Delete"
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

