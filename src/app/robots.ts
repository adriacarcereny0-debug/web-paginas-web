import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getContent("seo");
  const base = siteOrigin(seo);
  return {
    rules: seo.indexable
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
