import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     domains: ["localhost", "your-domain.com"],
    unoptimized: true,
  },
};
export default nextConfig;
