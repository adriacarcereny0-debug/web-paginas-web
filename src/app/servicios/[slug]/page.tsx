import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { getServiceBySlug, getServices } from "@/lib/queries";
import { absoluteUrl, breadcrumbSchema, jsonLd, metaDescription } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [service, seo] = await Promise.all([getServiceBySlug(slug), getContent("seo")]);
  if (!service) return { title: "Servicio no encontrado", robots: { index: false, follow: true } };

  const title = service.meta_title || service.title;
  const description = metaDescription(service.meta_description || service.body || service.description);
  const url = absoluteUrl(seo, `/servicios/${service.slug}`);

  return {
    title,
    description,
    alternates: { canonical: `/servicios/${service.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: service.image ? [{ url: absoluteUrl(seo, service.image) }] : undefined,
    },
  };
}

export default async function ServicioPage({ params }: Params) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [site, seo, footer, allServices] = await Promise.all([
    getContent("site"),
    getContent("seo"),
    getContent("footer"),
    getServices(),
  ]);

  let features: string[] = [];
  try {
    features = JSON.parse(service.features || "[]");
  } catch {
    features = [];
  }

  const related = allServices.filter((s) => s.slug && s.id !== service.id).slice(0, 3);
  const paragraphs = (service.body || service.description).split(/\n{2,}/).filter(Boolean);
  const description = service.meta_description || service.body || service.description;

  const schema = jsonLd([
    {
      "@type": "Service",
      "@id": `${absoluteUrl(seo, `/servicios/${service.slug}`)}#service`,
      name: service.title,
      description: metaDescription(description, 300),
      serviceType: service.title,
      provider: { "@id": `${absoluteUrl(seo, "/")}#business` },
      areaServed: site.areaServed || "España",
      url: absoluteUrl(seo, `/servicios/${service.slug}`),
      ...(service.price_from > 0
        ? {
            offers: {
              "@type": "Offer",
              price: service.price_from,
              priceCurrency: "EUR",
              priceSpecification: {
                "@type": "PriceSpecification",
                minPrice: service.price_from,
                priceCurrency: "EUR",
                valueAddedTaxIncluded: false,
              },
              availability: "https://schema.org/InStock",
              url: absoluteUrl(seo, "/presupuesto"),
            },
          }
        : {}),
    },
    breadcrumbSchema(seo, [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: service.title, path: `/servicios/${service.slug}` },
    ]),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <Header brandName={site.brandName} initials={site.brandInitials} logo={site.logo} logoLayout={site.logoLayout} />

      <main className="bg-white pt-[var(--header-h)]">
        <div className="border-b border-line bg-mist">
          <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-20">
            <div>
              <nav aria-label="Ruta de navegación" className="text-sm text-navy-400">
                <Link href="/" className="hover:text-brand-600">
                  Inicio
                </Link>
                <span className="mx-2 text-line-strong">/</span>
                <Link href="/servicios" className="hover:text-brand-600">
                  Servicios
                </Link>
                <span className="mx-2 text-line-strong">/</span>
                <span className="text-navy-900">{service.title}</span>
              </nav>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-5xl sm:leading-[1.08]">
                {service.title}
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-navy-600">{service.description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/presupuesto" className="btn-primary group">
                  Calcular mi presupuesto
                  <Icon name="arrow" size={17} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/#contacto" className="btn-secondary">
                  Hablar con nosotros
                </Link>
              </div>

              {(service.price_label || service.price_from > 0) && (
                <p className="mt-5 text-sm font-semibold text-navy-900">
                  {service.price_label || `Desde ${formatMoney(service.price_from)}`}
                </p>
              )}
            </div>

            <div className="relative">
              {service.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-white">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-[8px] border border-line bg-white">
                  <Icon name={service.icon} size={34} className="text-line-strong" />
                </div>
              )}
            </div>
          </div>
        </div>

        <article className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-20">
          <div>
            <h2 className="text-2xl font-semibold text-navy-900">Qué incluye este servicio</h2>
            <div className="mt-5 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-navy-600">
                  {p}
                </p>
              ))}
            </div>

            {features.length > 0 && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li className="flex items-start gap-3 border-t border-line py-3.5" key={f}>
                    <Icon name="check" size={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-brand-600" />
                    <span className="text-sm text-navy-700">{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:pl-4">
            <div className="sticky top-24 rounded-[8px] border border-line bg-paper p-6">
              <h2 className="text-lg font-semibold text-navy-900">¿Cuánto costaría tu proyecto?</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                Responde unas preguntas sencillas y recibe una estimación del coste y del plazo en 2 minutos, sin
                compromiso.
              </p>
              <Link href="/presupuesto" className="btn-primary btn-sm mt-5 w-full">
                Crear mi presupuesto
              </Link>
              {site.phone && (
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-navy-800 hover:text-brand-600"
                >
                  <Icon name="phone" size={15} /> {site.phone}
                </a>
              )}
            </div>
          </aside>
        </article>

        {related.length > 0 && (
          <section className="border-t border-line bg-mist py-16">
            <div className="container-x">
              <h2 className="text-2xl font-semibold text-navy-900">Otros servicios</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/servicios/${r.slug}`}
                    className="group border-t border-line-strong py-6 transition-colors"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon name={r.icon} size={19} />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-navy-900">{r.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-navy-600">{r.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition group-hover:gap-2.5">
                      Ver detalle <Icon name="arrow" size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer site={site} footer={footer} />
    </>
  );
}
