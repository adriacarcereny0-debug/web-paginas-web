import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const seo = getContent("seo");
  const base = seo.siteUrl?.replace(/\/$/, "") || "http://localhost:3000";
  return {
    rules: seo.indexable
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
