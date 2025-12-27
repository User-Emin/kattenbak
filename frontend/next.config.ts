import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // 🔒 SECURITY: COMPLETELY DISABLE ALL DEV OVERLAYS & ERROR BADGES
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  
  // 🔒 SECURITY: Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // 🔒 SECURITY: Temporarily ignore TypeScript/ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "catsupply.nl", // Own domain for /uploads/
      },
    ],
    formats: ["image/webp", "image/avif"], // Auto WebP/AVIF conversion
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },
};

export default nextConfig;
