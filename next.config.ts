import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    const url = new URL(target);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('API_PROXY_TARGET must be an HTTP(S) origin.');
    return [{ source: '/api/:path*', destination: `${url.origin}/api/:path*` }];
  },
};

export default nextConfig;
