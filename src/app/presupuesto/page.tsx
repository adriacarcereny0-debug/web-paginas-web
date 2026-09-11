import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { QuoteWizard } from "@/components/site/QuoteWizard";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Crea tu presupuesto personalizado",
    description:
      "Configura tu proyecto paso a paso y obtén una estimación personalizada del coste y del plazo de tu nueva página web.",
    alternates: { canonical: "/presupuesto" },
  };
}

const HIGHLIGHTS = [
  { icon: "clock", title: "2 minutos", text: "Es lo que tardarás en completarlo." },
  { icon: "euro", title: "Sin compromiso", text: "Recibir la estimación no te obliga a nada." },
  { icon: "shield", title: "Datos protegidos", text: "Solo los usamos para contactarte." },
];

export default async function PresupuestoPage() {
  const [site, footer] = await Promise.all([getContent("site"), getContent("footer")]);

  return (
    <>
      <Header brandName={site.brandName} initials={site.brandInitials} logo={site.logo} logoLayout={site.logoLayout} />
      <main className="bg-mist pt-[72px]">
        <div className="border-b border-slate-200 bg-white">
          <div className="container-x py-10 lg:py-14">
            <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
              ← Volver al inicio
            </Link>
            <h1 className="mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.02em] text-navy-900 sm:text-[2.7rem] sm:leading-[1.1]">
              Crea tu presupuesto personalizado
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-slate-600">
              Responde a unas preguntas sencillas sobre tu proyecto y te mostramos una estimación del coste y del plazo.
              Sin tecnicismos y sin compromiso.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name={h.icon} size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-navy-900">{h.title}</span>
                    <span className="block text-[13px] text-slate-500">{h.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="container-x max-w-4xl py-10 lg:py-14">
          <div id="wizard-top" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9">
            <QuoteWizard />
          </div>
        </div>
      </main>
      <Footer site={site} footer={footer} />
    </>
  );
}
