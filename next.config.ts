import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Sent with every response (pages, API routes, static files). No Content-Security-Policy yet: the
 * locale layout's inline early script and Next's inline bootstrap need a nonce or hashes first
 * (follow-up). WebGL and next/font need no header.
 */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    // Always inlined, '' when unset, so the DNA poster mode is dead code in normal builds
    // (only scripts/dna-poster.mjs builds with 1).
    NEXT_PUBLIC_DNA_POSTER: process.env.NEXT_PUBLIC_DNA_POSTER === '1' ? '1' : '',
  },
  experimental: {
    // app/global-not-found.tsx: the 404 for URLs no route matches (the root layout sits under [locale]).
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default withNextIntl(nextConfig);
