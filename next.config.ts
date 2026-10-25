import type { NextConfig } from "next";

// Backend cassier-q-api (Spring Boot). Browser hanya bicara ke origin Next.js;
// /api/v1/* dan /uploads/* di-proxy ke sini, jadi tidak butuh CORS di backend.
const API_ORIGIN = process.env.CASSIERQ_API_ORIGIN ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${API_ORIGIN}/api/v1/:path*` },
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
