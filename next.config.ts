import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  },
  turbopack: {},
  webpack: (config) => config,
};

export default nextConfig;
