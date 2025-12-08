// src/app/admin/components/TopProducts.tsx
// Top Products Component
// Table showing top performing products by clicks

"use client";

import { useEffect, useState } from "react";

interface TopProduct {
  product_id: number;
  asin: string;
  category: string;
  count: number;
  avg_dxm_score: number;
  avg_price: number;
}

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) return;
      
      const response = await fetch("/api/admin/analytics?metric=top-products&limit=10", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(result);
      }
    } catch (error) {
      console.error("Failed to fetch top products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">⭐ Top Performing Products</h2>
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">⭐ Top Performing Products</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Rank</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">ASIN</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Clicks</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg DXM Score</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.product_id}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="text-cyan-400 font-bold">#{index + 1}</span>
                </td>
                <td className="py-3 px-4">
                  <code className="text-sm text-slate-300">{product.asin}</code>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-300 capitalize">{product.category}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-medium text-slate-200">{product.count.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-medium text-cyan-400">
                    {product.avg_dxm_score?.toFixed(2) || "N/A"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-medium text-green-400">
                    ${product.avg_price?.toFixed(2) || "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

