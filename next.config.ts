import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");

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
    if (!backendUrl) {
      throw new Error("BACKEND_URL is not configured");
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
