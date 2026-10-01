import type { NextConfig } from 'next';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const MEDIA_HOST = process.env.NEXT_PUBLIC_MEDIA_HOST ?? 'localhost';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
    remotePatterns: [
      { protocol: 'https', hostname: MEDIA_HOST },
      { protocol: 'http', hostname: MEDIA_HOST },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
  // The browser talks to /api/v1/* on this origin; Next forwards to NestJS.
  // Auth cookies therefore stay first-party and SameSite=Lax works.
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${API_URL}/api/v1/:path*` }];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
