const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = isGitHubPages ? process.env.NEXT_PUBLIC_BASE_PATH ?? "/my-website" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: githubPagesBasePath,
  assetPrefix: githubPagesBasePath,
  devIndicators: false,
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
