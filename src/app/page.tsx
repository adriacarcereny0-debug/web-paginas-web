import { getFaqs, getProjects, getReviews, getServices, getTestimonials } from "@/lib/queries";
import { businessSchema, faqSchema, jsonLd, siteOrigin } from "@/lib/seo";
import { getContent } from "@/lib/content";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Trust } from "@/components/site/Trust";
import { Services } from "@/components/site/Services";
import { Steps } from "@/components/site/Steps";
import { Portfolio } from "@/components/site/Portfolio";
import { Testimonials } from "@/components/site/Testimonials";
import { Reviews } from "@/components/site/Reviews";
import { Faq } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Contact } from "@/components/site/Contact";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, projects, testimonials, reviews, faqs] = await Promise.all([
    getServices(),
    getProjects(),
    getTestimonials(),
    getReviews(),
    getFaqs(),
  ]);

  const [
    site,
    seo,
    hero,
    trust,
    servicesCopy,
    steps,
    portfolioCopy,
    testimonialsCopy,
    reviewsCopy,
    faqCopy,
    cta,
    contactCopy,
    footer,
  ] =
    await Promise.all([
      getContent("site"),
      getContent("seo"),
      getContent("hero"),
      getContent("trust"),
      getContent("servicesCopy"),
      getContent("steps"),
      getContent("portfolioCopy"),
      getContent("testimonialsCopy"),
      getContent("reviewsCopy"),
      getContent("faqCopy"),
      getContent("cta"),
      getContent("contactCopy"),
      getContent("footer"),
    ]);

  const realReviews = reviews.filter((r) => r.is_demo !== 1);
  const aggregateRating =
    realReviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (realReviews.reduce((sum, r) => sum + r.rating, 0) / realReviews.length).toFixed(1),
          reviewCount: realReviews.length,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  const schema = jsonLd([
    businessSchema({
      site,
      seo,
      services: services.map((s) => s.title),
      aggregateRating,
    }),
    {
      "@type": "WebSite",
      "@id": `${siteOrigin(seo)}/#website`,
      url: siteOrigin(seo),
      name: site.brandName,
      description: seo.description,
      inLanguage: "es-ES",
      publisher: { "@id": `${siteOrigin(seo)}/#business` },
    },
    faqSchema(faqs),
    services.some((s) => s.slug)
      ? {
          "@type": "ItemList",
          name: "Servicios",
          itemListElement: services
            .filter((s) => s.slug)
            .map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.title,
              url: `${siteOrigin(seo)}/servicios/${s.slug}`,
            })),
        }
      : undefined,
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <Header brandName={site.brandName} initials={site.brandInitials} logo={site.logo} />
      <main id="contenido">
        <Hero content={hero} />
        <Trust content={trust} />
        <Services copy={servicesCopy} services={services} />
        <Steps content={steps} />
        <Portfolio copy={portfolioCopy} projects={projects} />
        <Testimonials copy={testimonialsCopy} items={testimonials} />
        <Reviews copy={reviewsCopy} reviews={reviews} />
        <Faq copy={faqCopy} items={faqs} />
        <FinalCta content={cta} />
        <Contact copy={contactCopy} site={site} services={services.map((s) => s.title)} />
      </main>
      <Footer site={site} footer={footer} />
      <WhatsAppButton phone={site.whatsapp} brandName={site.brandName} />
    </>
  );
}
