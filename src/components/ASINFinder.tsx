'use client';

import { useState } from 'react';

interface ASINResult {
  asin: string;
  title: string;
  price?: string;
  imageUrl?: string;
  url: string;
}

export default function ASINFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ASINResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchASINs = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/find-asins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      const { data } = await response.json();
      setResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyASINs = () => {
    const asins = results.map(r => r.asin).join('\n');
    navigator.clipboard.writeText(asins);
  };

  const copyURLs = () => {
    const urls = results.map(r => `https://www.amazon.com/dp/${r.asin}?tag=dxm369-20`).join('\n');
    navigator.clipboard.writeText(urls);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">ASIN Finder</h2>
      
      {/* Search Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products (e.g., RTX 4090, gaming laptop)"
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded text-white"
          onKeyPress={(e) => e.key === 'Enter' && searchASINs()}
        />
        <button 
          onClick={searchASINs}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find ASINs'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="flex gap-3 mb-4">
            <h3 className="text-lg font-semibold text-white flex-1">
              Found {results.length} products
            </h3>
            <button 
              onClick={copyASINs}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Copy ASINs
            </button>
            <button 
              onClick={copyURLs}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Copy URLs
            </button>
          </div>
          
          <div className="grid gap-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-800 border border-gray-700 rounded">
                {result.imageUrl && (
                  <img 
                    src={result.imageUrl} 
                    alt={result.title}
                    className="w-16 h-16 object-contain bg-white rounded"
                  />
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm mb-1">{result.title}</h4>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>ASIN: <span className="text-cyan-300 font-mono">{result.asin}</span></span>
                    {result.price && <span>Price: <span className="text-green-400">${result.price}</span></span>}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.asin)}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Copy ASIN
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`https://www.amazon.com/dp/${result.asin}?tag=dxm369-20`)}
                    className="px-2 py-1 bg-blue-700 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
