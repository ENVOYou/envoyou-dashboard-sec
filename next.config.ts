import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,

  // Vercel-specific optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Image optimization for Vercel
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable Vercel Image Optimization
    unoptimized: false,
  },

  // Performance headers optimized for Vercel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Vercel-specific headers for performance
          {
            key: 'X-Vercel-Cache',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Webpack optimization for Vercel Edge Runtime
  webpack: (config, { isServer }) => {
    // Optimize bundle size for Vercel deployment
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 1,
        },
      };
    }

    return config;
  },
// 'serverComponentsExternalPackages' sekarang menjadi 'serverExternalPackages'
  // dan berada di level atas (bukan di dalam 'experimental')
  serverExternalPackages: [],
  // Experimental features for Vercel
  experimental: {
    // Enable Webpack 5 features
    webpackBuildWorker: true,

  },
};

export default nextConfig;
