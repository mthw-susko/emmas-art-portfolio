import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Turbopack resolves chunks relative to this project
  turbopack: {
    root: __dirname,
  },
  images: {
    // Migrate away from deprecated `images.domains` if desired later
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
