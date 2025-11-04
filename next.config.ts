import type { NextConfig } from "next";

// Pin the Turbopack root to this project to avoid the
// multi-lockfile auto-detection picking a parent directory.
const nextConfig: any = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
} satisfies NextConfig as any;

export default nextConfig as NextConfig;
