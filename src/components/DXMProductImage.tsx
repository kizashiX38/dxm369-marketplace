// DXM Product Image Manager
// Handles product image loading with intelligent fallbacks and error handling

"use client";

import { useState } from "react";
import Image from "next/image";

interface DXMProductImageProps {
  product: {
    brand?: string;
    title: string;
    category: string;
    imageUrl?: string;
  };
  className?: string;
  width?: number;
  height?: number;
  showFallback?: boolean;
}

export function DXMProductImage({ 
  product, 
  className = "", 
  width = 300, 
  height = 200,
  showFallback = true 
}: DXMProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // DXM Standard: Generate image path from product data
  const generateImagePath = () => {
    if (product.imageUrl) {
      return product.imageUrl;
    }

    // DXM Standard naming: brand_model_variant.webp
    const brand = (product.brand || 'unknown').toLowerCase().replace(/\s+/g, '_');
    const model = product.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30); // Limit length
    
    return `/images/products/${product.category}s/${brand}_${model}.webp`;
  };

  // Fallback image based on category
  const getFallbackImage = () => {
    const fallbacks = {
      gpu: "/images/placeholder-gpu.svg",
      cpu: "/images/placeholder-cpu.svg", 
      laptop: "/images/placeholder-laptop.svg",
    };
    return fallbacks[product.category as keyof typeof fallbacks] || "/images/placeholder-gpu.svg";
  };

  const imageSrc = imageError || !showFallback ? getFallbackImage() : generateImagePath();
  const isSvg = imageSrc.toLowerCase().endsWith('.svg');

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
      )}
      
      {/* Product Image - Use regular img for SVG, Next.js Image for others */}
      {isSvg ? (
        <img
          src={imageSrc}
          alt={product.title}
          width={width}
          height={height}
          className="w-full h-full object-contain transition-all duration-300 hover:scale-105 cyber-glow"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={product.title}
          width={width}
          height={height}
          style={{ width: 'auto', height: 'auto' }}
          className="w-full h-full object-contain transition-all duration-300 hover:scale-105 cyber-glow"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          priority={false}
          unoptimized={true}
        />
      )}

      {/* Cyber glow effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* DXM badge for verified images */}
      {!imageError && product.imageUrl && (
        <div className="absolute top-2 right-2 bg-cyan-500/20 border border-cyan-400/30 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-300 uppercase tracking-wider">
          DXM
        </div>
      )}
    </div>
  );
}

// CSS for cyber glow effect (add to globals.css)
export const cyberGlowStyles = `
.cyber-glow {
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.3));
  transition: filter 0.3s ease;
}

.cyber-glow:hover {
  filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.6));
}
`;
