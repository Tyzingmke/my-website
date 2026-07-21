/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.GITHUB_PAGES === "true" ? "export" : undefined,
  devIndicators: false,
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
