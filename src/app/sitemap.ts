import type { MetadataRoute } from "next";

const siteUrl = "https://www.tonyconsults.co.ke";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about/", "/contact/", "/services/", "/work/", "/website-design-kenya/", "/guides/website-cost-kenya/"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/website-design-kenya/" ? 0.9 : 0.8,
  }));
}
