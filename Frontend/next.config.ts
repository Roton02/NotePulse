import type { NextConfig } from "next";

// Forwards /api/v1 calls to the backend, so the browser never makes a cross-origin request
const backend = process.env.BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;
