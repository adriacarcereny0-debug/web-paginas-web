import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { SectionCopy } from "@/lib/content";

export type ServiceRow = {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string;
  price_from: number;
  price_label: string;
  features: string;
};

export function Services({ copy, services }: { copy: SectionCopy; services: ServiceRow[] }) {
  return (
    <section id="servicios" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="container-x">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

        {services.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            Todavía no hay servicios publicados. Añádelos desde el panel de administración.
          </p>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              let features: string[] = [];
              try {
                features = JSON.parse(s.features || "[]");
              } catch {
                features = [];
              }
              return (
                <Reveal key={s.id} delay={(i % 3) * 70}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-card">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-brand-100/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    {s.image ? (
                      <div className="relative mb-5 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                        <Image src={s.image} alt={s.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-white transition-transform duration-300 group-hover:scale-105">
                        <Icon name={s.icon} size={22} />
                      </span>
                    )}
                    <h3 className="relative mt-5 font-display text-xl font-bold text-navy-900">{s.title}</h3>
                    <p className="relative mt-2.5 text-[15px] leading-relaxed text-slate-600">{s.description}</p>

                    {features.length > 0 && (
                      <ul className="relative mt-5 space-y-2">
                        {features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                              <Icon name="check" size={10} strokeWidth={3} />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                      <span className="text-sm font-semibold text-navy-900">{s.price_label || "Consultar"}</span>
                      <Link
                        href="/presupuesto"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition group-hover:gap-2.5"
                      >
                        Calcular <Icon name="arrow" size={15} />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
