import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@paystack/inline-js'],
  },
};

export default nextConfig;