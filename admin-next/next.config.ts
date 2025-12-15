import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ DRY: Base path only in production (for Nginx /admin route)
  // In development: direct access on port 3001
  ...(process.env.NODE_ENV === 'production' && { basePath: "/admin" }),
  
  // Temporarily ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
