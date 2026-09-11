import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { getContent } from "@/lib/content";
import { metaDescription, siteOrigin } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([getContent("seo"), getContent("site")]);
  const base = siteOrigin(seo);
  const description = metaDescription(seo.description);

  return {
    metadataBase: new URL(base),
    title: { default: seo.title, template: `%s | ${site.brandName}` },
    description,
    keywords: seo.keywords ? seo.keywords.split(",").map((k) => k.trim()) : undefined,
    applicationName: site.brandName,
    authors: [{ name: site.brandName, url: base }],
    creator: site.brandName,
    publisher: site.brandName,
    category: "Diseño y desarrollo web",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: true, email: true, address: true },
    // Directivas ampliadas para buscadores: permiten fragmentos largos y
    // vistas previas de imagen a tamaño completo en los resultados.
    robots: seo.indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
    verification: {
      google: seo.googleVerification || undefined,
      other: seo.bingVerification ? { "msvalidate.01": seo.bingVerification } : undefined,
    },
    alternates: { canonical: "/", languages: { "es-ES": "/" } },
    // Un único origen para el icono: el que se sube desde el panel manda, y si no
    // hay ninguno se usa el de la marca. Así nunca compiten dos iconos distintos.
    icons: {
      icon: seo.favicon || "/icono.svg",
      shortcut: seo.favicon || "/icono.svg",
      apple: seo.favicon || "/icono.svg",
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: base,
      siteName: site.brandName,
      title: seo.title,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630, alt: site.brandName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description,
      site: seo.twitter || undefined,
      creator: seo.twitter || undefined,
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
    <html lang="es-ES" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-white font-sans">{children}</body>
    </html>
  );
}
