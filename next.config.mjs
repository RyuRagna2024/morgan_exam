/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
    },
    // If you need to use external packages in edge runtime
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com", // Allow all subdomains of vercel-storage.com
      },
    ],
  },
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
