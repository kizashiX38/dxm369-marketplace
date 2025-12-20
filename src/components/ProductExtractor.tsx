'use client';

import { useState } from 'react';
import { ProductMetadata } from '@/lib/productExtractor';

interface ProductExtractorProps {
  urls?: string[];
}

export default function ProductExtractor({ urls = [] }: ProductExtractorProps) {
  const [products, setProducts] = useState<ProductMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputUrls, setInputUrls] = useState(urls.join('\n'));

  const extractProducts = async () => {
    setLoading(true);
    console.log('Starting extraction...');
    
    try {
      const urlList = inputUrls.split('\n').filter(url => url.trim());
      console.log('URLs to extract:', urlList);
      
      const response = await fetch('/api/extract-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        return;
      }
      
      const result = await response.json();
      console.log('API Result:', result);
      
      setProducts(result.data || []);
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    const validProducts = products.filter(p => p.isValid);
    const blob = new Blob([JSON.stringify(validProducts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    a.click();
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Product Metadata Extractor</h2>
      
      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amazon URLs (one per line):
        </label>
        <textarea
          value={inputUrls}
          onChange={(e) => setInputUrls(e.target.value)}
          className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
          placeholder="https://www.amazon.com/dp/B0BGP8FGNZ?tag=dxm369-20"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button 
          onClick={extractProducts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Extracting...' : 'Extract Products'}
        </button>
        
        {products.length > 0 && (
          <button 
            onClick={exportToJSON}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export JSON
          </button>
        )}
      </div>

      {/* Results */}
      {products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Extracted Products ({products.filter(p => p.isValid).length}/{products.length} valid)
          </h3>
          
          {products.map((product, index) => (
            <div key={index} className={`p-4 rounded border ${product.isValid ? 'bg-gray-800 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
              {product.isValid ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">{product.title}</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-400">ASIN:</span> <span className="text-cyan-300 font-mono">{product.asin}</span></p>
                      <p><span className="text-gray-400">Brand:</span> <span className="text-white">{product.brand}</span></p>
                      <p><span className="text-gray-400">Price:</span> <span className="text-green-400 font-bold">${product.price}</span></p>
                      {product.rating && (
                        <p><span className="text-gray-400">Rating:</span> <span className="text-yellow-400">{product.rating}/5</span> ({product.reviewCount} reviews)</p>
                      )}
                      <p><span className="text-gray-400">Availability:</span> <span className="text-white">{product.availability}</span></p>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title || 'Product image'}
                        className="w-32 h-32 object-contain bg-white rounded mb-3"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-red-400">
                  <p className="font-mono text-sm mb-1">{product.url}</p>
                  <p className="text-xs">Error: {product.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
