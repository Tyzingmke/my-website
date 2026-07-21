/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  devIndicators: false,
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
