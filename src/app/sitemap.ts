import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getContent("seo");
  const base = siteUrl?.replace(/\/$/, "") || "http://localhost:3000";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/presupuesto`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
