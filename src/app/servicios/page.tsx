import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { getServices } from "@/lib/queries";
import { absoluteUrl, breadcrumbSchema, jsonLd, metaDescription } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FinalCta } from "@/components/site/FinalCta";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContent("seo");
  return {
    title: seo.servicesIndexTitle,
    description: metaDescription(seo.servicesIndexDescription),
    alternates: { canonical: "/servicios" },
    openGraph: {
      title: seo.servicesIndexTitle,
      description: metaDescription(seo.servicesIndexDescription),
      url: absoluteUrl(seo, "/servicios"),
      type: "website",
    },
  };
}

export default async function ServiciosPage() {
  const [services, site, seo, footer, cta] = await Promise.all([
    getServices(),
    getContent("site"),
    getContent("seo"),
    getContent("footer"),
    getContent("cta"),
  ]);

  const withPage = services.filter((s) => s.slug);

  const schema = jsonLd([
    breadcrumbSchema(seo, [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
    ]),
    {
      "@type": "ItemList",
      name: seo.servicesIndexTitle,
      itemListElement: withPage.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.title,
        url: absoluteUrl(seo, `/servicios/${s.slug}`),
      })),
    },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <Header brandName={site.brandName} initials={site.brandInitials} logo={site.logo} logoLayout={site.logoLayout} />
      <main className="bg-white pt-[var(--header-h)]">
        <div className="border-b border-line bg-mist">
          <div className="container-x py-14 lg:py-20">
            <nav aria-label="Ruta de navegación" className="text-sm text-navy-400">
              <Link href="/" className="hover:text-brand-600">
                Inicio
              </Link>
              <span className="mx-2 text-line-strong">/</span>
              <span className="text-navy-900">Servicios</span>
            </nav>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-5xl sm:leading-[1.08]">
              {seo.servicesIndexTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-navy-600">{seo.servicesIndexDescription}</p>
          </div>
        </div>

        <div className="container-x py-16 lg:py-20">
          <div className="grid gap-x-10 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              let features: string[] = [];
              try {
                features = JSON.parse(service.features || "[]");
              } catch {
                features = [];
              }
              const inner = (
                <article className="group flex h-full flex-col border-t border-line-strong py-7">
                  <Icon name={service.icon} size={18} className="text-brand-600" />
                  <h2 className="mt-5 text-[1.3rem] leading-tight tracking-[-0.02em] text-navy-900 transition-colors group-hover:text-brand-700">
                    {service.title}
                  </h2>
                  <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-navy-600">{service.description}</p>
                  {features.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-navy-600">
                          <Icon name="check" size={12} strokeWidth={2.5} className="mt-1 shrink-0 text-brand-600" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="tnum text-sm font-semibold text-navy-900">
                      {service.price_label || (service.price_from > 0 ? `Desde ${formatMoney(service.price_from)}` : "Consultar")}
                    </span>
                    {service.slug && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-brand-600 transition-all group-hover:gap-2.5">
                        Ver detalle <Icon name="arrow" size={14} />
                      </span>
                    )}
                  </div>
                </article>
              );
              return service.slug ? (
                <Link key={service.id} href={`/servicios/${service.slug}`} className="block h-full">
                  {inner}
                </Link>
              ) : (
                <div key={service.id} className="h-full">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        <FinalCta content={cta} />
      </main>
      <Footer site={site} footer={footer} />
    </>
  );
}
