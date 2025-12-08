// src/components/AdvancedFilters.tsx
// Advanced filtering and sorting component for DXM v2
// Multi-dimensional filtering with score ranges and category-specific options

"use client";

import { useState } from "react";
import { HardwareCategory } from "@/lib/dealRadarTypes";

interface FilterState {
  category: HardwareCategory | "all";
  priceRange: [number, number];
  dxmScoreRange: [number, number];
  brands: string[];
  availability: "all" | "in_stock" | "limited" | "out_of_stock";
  primeOnly: boolean;
  onSale: boolean;
  sortBy: "dxm_score" | "price_low" | "price_high" | "savings" | "newest";
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  availableBrands: string[];
  className?: string;
}

export default function AdvancedFilters({ 
  onFiltersChange, 
  availableBrands, 
  className = "" 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: [0, 5000],
    dxmScoreRange: [0, 10],
    brands: [],
    availability: "all",
    primeOnly: false,
    onSale: false,
    sortBy: "dxm_score"
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      category: "all",
      priceRange: [0, 5000],
      dxmScoreRange: [0, 10],
      brands: [],
      availability: "all",
      primeOnly: false,
      onSale: false,
      sortBy: "dxm_score"
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = [
    filters.category !== "all" ? 1 : 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? 1 : 0,
    filters.dxmScoreRange[0] > 0 || filters.dxmScoreRange[1] < 10 ? 1 : 0,
    filters.brands.length > 0 ? 1 : 0,
    filters.availability !== "all" ? 1 : 0,
    filters.primeOnly ? 1 : 0,
    filters.onSale ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className={`glass-panel ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-sm border border-cyan-500/30">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Sort Bar (Always Visible) */}
      <div className="p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-mono">SORT BY:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="bg-slate-900/50 border border-cyan-500/30 text-slate-200 px-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-cyan-400/60 transition-all"
          >
            <option value="dxm_score">DXM Score (High to Low)</option>
            <option value="price_low">Price (Low to High)</option>
            <option value="price_high">Price (High to Low)</option>
            <option value="savings">Best Savings</option>
            <option value="newest">Newest Deals</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value as FilterState['category'] })}
              className="w-full bg-slate-900/50 border border-cyan-500/30 text-slate-200 px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-cyan-400/60 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="gpu">Graphics Cards</option>
              <option value="cpu">Processors</option>
              <option value="laptop">Laptops</option>
              <option value="monitor">Monitors</option>
              <option value="motherboard">Motherboards</option>
              <option value="ram">Memory</option>
              <option value="ssd">Storage</option>
              <option value="psu">Power Supplies</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilters({ 
                  priceRange: [parseInt(e.target.value), filters.priceRange[1]] 
                })}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilters({ 
                  priceRange: [filters.priceRange[0], parseInt(e.target.value)] 
                })}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* DXM Score Range */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
              DXM Score Range: {filters.dxmScoreRange[0].toFixed(1)} - {filters.dxmScoreRange[1].toFixed(1)}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.dxmScoreRange[0]}
                onChange={(e) => updateFilters({ 
                  dxmScoreRange: [parseFloat(e.target.value), filters.dxmScoreRange[1]] 
                })}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.dxmScoreRange[1]}
                onChange={(e) => updateFilters({ 
                  dxmScoreRange: [filters.dxmScoreRange[0], parseFloat(e.target.value)] 
                })}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Poor</span>
              <span>Average</span>
              <span>Excellent</span>
              <span>Exceptional</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
              Brands
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ brands: [...filters.brands, brand] });
                      } else {
                        updateFilters({ brands: filters.brands.filter(b => b !== brand) });
                      }
                    }}
                    className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-slate-300">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
              Availability
            </label>
            <div className="flex gap-4">
              {[
                { value: "all", label: "All" },
                { value: "in_stock", label: "In Stock" },
                { value: "limited", label: "Limited" },
                { value: "out_of_stock", label: "Out of Stock" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={filters.availability === option.value}
                    onChange={(e) => updateFilters({ availability: e.target.value as FilterState['availability'] })}
                    className="text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-slate-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
              Quick Filters
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.primeOnly}
                  onChange={(e) => updateFilters({ primeOnly: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-slate-300">Prime Only</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.onSale}
                  onChange={(e) => updateFilters({ onSale: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-slate-300">On Sale</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 2px;
          background: #06b6d4;
          cursor: pointer;
          border: 1px solid #0891b2;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 2px;
          background: #06b6d4;
          cursor: pointer;
          border: 1px solid #0891b2;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </div>
  );
}
