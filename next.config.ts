import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: "/uploads/**" }],
    remotePatterns: [],
    unoptimized: false,
  },
};

export default nextConfig;
