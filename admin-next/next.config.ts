import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ DRY: Base path only in production (for Nginx /admin route)
  // In development: direct access on port 3001
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
  
  // SECURITY: Disable source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
