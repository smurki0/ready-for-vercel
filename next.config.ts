import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "21.0.9.15",
    "preview-chat-dc6f05b3-eab7-4a8c-8c81-af027aa1cba5.space-z.ai",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
