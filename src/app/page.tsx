import { getDb } from "@/lib/db";
import { getContent } from "@/lib/content";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Trust } from "@/components/site/Trust";
import { Services, type ServiceRow } from "@/components/site/Services";
import { Steps } from "@/components/site/Steps";
import { Portfolio, type ProjectRow } from "@/components/site/Portfolio";
import { Testimonials, type TestimonialRow } from "@/components/site/Testimonials";
import { Faq, type FaqRow } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Contact } from "@/components/site/Contact";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();
  const services = db.prepare("SELECT * FROM services WHERE visible = 1 ORDER BY sort_order, id").all() as ServiceRow[];
  const projects = db.prepare("SELECT * FROM projects WHERE visible = 1 ORDER BY sort_order, id").all() as ProjectRow[];
  const testimonials = db
    .prepare("SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order, id")
    .all() as TestimonialRow[];
  const faqs = db.prepare("SELECT * FROM faqs WHERE visible = 1 ORDER BY sort_order, id").all() as FaqRow[];

  const site = getContent("site");
  const seo = getContent("seo");

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
      <Header brandName={site.brandName} initials={site.brandInitials} />
      <main id="contenido">
        <Hero content={getContent("hero")} />
        <Trust content={getContent("trust")} />
        <Services copy={getContent("servicesCopy")} services={services} />
        <Steps content={getContent("steps")} />
        <Portfolio copy={getContent("portfolioCopy")} projects={projects} />
        <Testimonials copy={getContent("testimonialsCopy")} items={testimonials} />
        <Faq copy={getContent("faqCopy")} items={faqs} />
        <FinalCta content={getContent("cta")} />
        <Contact copy={getContent("contactCopy")} site={site} services={services.map((s) => s.title)} />
      </main>
      <Footer site={site} footer={getContent("footer")} />
      <WhatsAppButton phone={site.whatsapp} brandName={site.brandName} />
    </>
  );
}
