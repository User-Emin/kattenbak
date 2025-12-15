import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Base path for admin app under /admin route
  basePath: "/admin",
  
  // Temporarily ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
