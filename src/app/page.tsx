import { query } from "@/lib/db";
import { getContent } from "@/lib/content";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Trust } from "@/components/site/Trust";
import { Services, type ServiceRow } from "@/components/site/Services";
import { Steps } from "@/components/site/Steps";
import { Portfolio, type ProjectRow } from "@/components/site/Portfolio";
import { Testimonials, type TestimonialRow } from "@/components/site/Testimonials";
import { Reviews, type ReviewRow } from "@/components/site/Reviews";
import { Faq, type FaqRow } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Contact } from "@/components/site/Contact";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, projects, testimonials, reviews, faqs] = await Promise.all([
    query<ServiceRow>("SELECT * FROM services WHERE visible = 1 ORDER BY sort_order, id"),
    query<ProjectRow>("SELECT * FROM projects WHERE visible = 1 ORDER BY sort_order, id"),
    query<TestimonialRow>("SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order, id"),
    query<ReviewRow>("SELECT * FROM reviews WHERE visible = 1 ORDER BY featured DESC, sort_order, id"),
    query<FaqRow>("SELECT * FROM faqs WHERE visible = 1 ORDER BY sort_order, id"),
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${seo.siteUrl}#business`,
        name: site.brandName,
        description: seo.description,
        url: seo.siteUrl,
        email: site.email || undefined,
        telephone: site.phone || undefined,
        address: site.address ? { "@type": "PostalAddress", addressLocality: site.address } : undefined,
        areaServed: "ES",
        serviceType: services.map((s) => s.title),
        aggregateRating,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "WebSite",
        url: seo.siteUrl,
        name: site.brandName,
        inLanguage: "es-ES",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
