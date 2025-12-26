import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ basePath for Nginx /admin route in production
  ...(process.env.NODE_ENV === 'production' && { basePath: "/admin" }),
  
  // SECURITY: Disable dev indicators in production
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  
  // Temporarily ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Temporarily ignore ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // SECURITY: Disable source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
