import type { MetadataRoute } from "next";

const siteUrl = "https://www.tonyconsults.co.ke";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about/", "/contact/", "/services/", "/work/"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
