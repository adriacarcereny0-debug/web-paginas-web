import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { getContent } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([getContent("seo"), getContent("site")]);
  const base = seo.siteUrl?.startsWith("http") ? seo.siteUrl : "http://localhost:3000";

  return {
    metadataBase: new URL(base),
    title: { default: seo.title, template: `%s | ${site.brandName}` },
    description: seo.description,
    keywords: seo.keywords ? seo.keywords.split(",").map((k) => k.trim()) : undefined,
    applicationName: site.brandName,
    robots: seo.indexable ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: "/" },
    icons: seo.favicon ? { icon: seo.favicon } : undefined,
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: base,
      siteName: site.brandName,
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630, alt: site.brandName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      site: seo.twitter || undefined,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-white font-sans">{children}</body>
    </html>
  );
}
