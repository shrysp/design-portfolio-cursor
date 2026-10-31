import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Read from disk by an invitation's share picture, which the build can't see it opening
  outputFileTracingIncludes: {
    "/invite/[code]/ticket": ["./assets/og/**", "./public/og/invite-plate.jpg"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

export default nextConfig;
