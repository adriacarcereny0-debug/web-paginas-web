import type { Seo, SiteInfo } from "./content";

export function siteOrigin(seo: Seo) {
  const url = seo.siteUrl?.trim();
  if (url?.startsWith("http")) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function absoluteUrl(seo: Seo, path = "/") {
  return `${siteOrigin(seo)}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Ficha del negocio. Solo se declaran los campos que están realmente rellenos. */
export function businessSchema({
  site,
  seo,
  services,
  aggregateRating,
}: {
  site: SiteInfo;
  seo: Seo;
  services: string[];
  aggregateRating?: object;
}) {
  const origin = siteOrigin(seo);
  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (site.street) address.streetAddress = site.street;
  if (site.locality) address.addressLocality = site.locality;
  if (site.region) address.addressRegion = site.region;
  if (site.postalCode) address.postalCode = site.postalCode;
  if (site.country) address.addressCountry = site.country;

  return clean({
    "@type": "ProfessionalService",
    "@id": `${origin}/#business`,
    name: site.brandName,
    description: seo.description,
    url: origin,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    image: site.logo ? absoluteUrl(seo, site.logo) : seo.ogImage ? absoluteUrl(seo, seo.ogImage) : undefined,
    logo: site.logo ? absoluteUrl(seo, site.logo) : undefined,
    address: Object.keys(address).length > 1 ? address : undefined,
    areaServed: site.areaServed || undefined,
    priceRange: site.priceRange || undefined,
    foundingDate: site.foundingYear || undefined,
    slogan: site.tagline || undefined,
    knowsLanguage: ["es-ES"],
    sameAs: site.social?.map((s) => s.url).filter((u) => u?.startsWith("http")),
    serviceType: services,
    aggregateRating,
    contactPoint: site.phone
      ? {
          "@type": "ContactPoint",
          telephone: site.phone,
          contactType: "customer service",
          areaServed: site.country || "ES",
          availableLanguage: ["Spanish"],
        }
      : undefined,
  });
}

export function breadcrumbSchema(seo: Seo, trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(seo, item.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return undefined;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Elimina claves vacías para no publicar datos estructurados incompletos. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete obj[key];
    }
  }
  return obj;
}

export function jsonLd(graph: unknown[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph.filter(Boolean) });
}

/** Recorta una descripción al límite recomendado sin partir palabras. */
export function metaDescription(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
}
