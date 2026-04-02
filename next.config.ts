import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow any https image URL (thumbnails, avatars may come from any CDN)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
