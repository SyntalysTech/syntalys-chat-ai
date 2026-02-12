import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
