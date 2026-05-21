/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const api = process.env.API_URL || 'http://localhost:5000';
    return [{ source: '/api-backend/:path*', destination: `${api}/:path*` }];
  },
};

export default nextConfig;
