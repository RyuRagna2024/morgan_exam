// next.config.mjs

// 1. Import the analyzer
import bundleAnalyzer from "@next/bundle-analyzer";

// 2. Initialize the analyzer wrapper function
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true", // Only enable when ANALYZE env var is 'true'
  openAnalyzer: true, // Automatically open reports in the browser after build
});

// 3. Your existing Next.js config object
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
    },
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  // Add any other configurations you might have here
};

// 4. Wrap your config with the analyzer function before exporting
export default withBundleAnalyzer(nextConfig);
