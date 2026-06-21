import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Private media is served with short-lived Supabase signed URLs.
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/**' },
    ],
  },
};
export default nextConfig;
