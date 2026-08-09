import type { NextConfig } from "next";

// The backend base URL, read server-side only. The browser never sees this —
// it calls same-origin /api/* paths, and the rewrite below forwards them
// server-to-server, so CORS never applies.
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
