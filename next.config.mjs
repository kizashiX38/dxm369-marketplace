/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimized for Cloudflare deployment
  output: 'standalone',
  images: {
    // Allow SVG images and unoptimized images for better compatibility
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    // Allow all image formats including SVG
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

