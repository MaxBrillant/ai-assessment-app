/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
      ],
    },
    serverSourceMaps: false,
  },
};

export default nextConfig;
