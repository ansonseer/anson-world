import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pin the workspace root — a stray package-lock.json exists in C:\Users\suner
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
