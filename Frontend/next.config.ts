import type { NextConfig } from "next";

// Forwards /api/v1 calls to the backend, so the browser never makes a cross-origin request
// Base address only (no /api/v1). Set BACKEND_URL to use a different backend, e.g. http://localhost:5000
const backend = process.env.BACKEND_URL || "https://note-pulse-three.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;
