'use client';

import { useState } from 'react';
import { LinkCheckResult } from '@/lib/linkChecker';

interface LinkValidatorProps {
  urls: string[];
}

export default function LinkValidator({ urls }: LinkValidatorProps) {
  const [results, setResults] = useState<LinkCheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  const validateLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/validate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      
      const { data } = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <button 
        onClick={validateLinks}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Validating...' : 'Check Links'}
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded border border-gray-700">
              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${result.isValid ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-red-500 shadow-red-500/50 shadow-lg'}`} />
              <span className="text-sm text-gray-300 truncate flex-1 font-mono">{result.url}</span>
              <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">{result.status || result.error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
