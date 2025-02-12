import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['raw.githubusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
