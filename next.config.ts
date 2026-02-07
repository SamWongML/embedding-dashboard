import type { NextConfig } from "next";

const remoteImageHosts = new Set<string>()

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    remoteImageHosts.add(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname)
  } catch {
    // Ignore invalid URL values and keep image hosts explicit.
  }
}

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization domains
  images: {
    remotePatterns: Array.from(remoteImageHosts).map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['recharts', 'd3', 'd3-force', 'lucide-react'],
  },
};

export default nextConfig;
