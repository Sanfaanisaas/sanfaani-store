import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/operations/user",
        destination: "/account/orders",
        permanent: false,
      },
    ];
  },
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
