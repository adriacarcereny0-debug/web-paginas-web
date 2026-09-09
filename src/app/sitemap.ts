import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { getServices } from "@/lib/queries";
import { siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, services] = await Promise.all([getContent("seo"), getServices()]);
  const base = siteOrigin(seo);
  const now = new Date();

  const servicePages: MetadataRoute.Sitemap = services
    .filter((s) => s.slug)
    .map((s) => ({
      url: `${base}/servicios/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/presupuesto`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...servicePages,
    { url: `${base}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
