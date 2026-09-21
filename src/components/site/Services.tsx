import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { SectionCopy } from "@/lib/content";

export type ServiceRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  price_from: number;
  price_label: string;
  features: string;
};

/**
 * Índice de servicios en forma de listado: una fila por servicio, separadas por
 * filetes. Sustituye a la cuadrícula de tarjetas idénticas.
 */
export function Services({ copy, services }: { copy: SectionCopy; services: ServiceRow[] }) {
  return (
    <section id="servicios" className="section scroll-mt-24 bg-white">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader index="02" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
          {services.some((s) => s.slug) && (
            <Reveal delay={140}>
              <Link
                href="/servicios"
                className="link-underline inline-flex items-center gap-2 pb-1 text-sm font-medium text-navy-900"
              >
                Ver todos en detalle
                <Icon name="arrow" size={15} />
              </Link>
            </Reveal>
          )}
        </div>

        {services.length === 0 ? (
          <p className="mt-12 border-t border-line pt-10 text-sm text-navy-400">
            Todavía no hay servicios publicados. Añádelos desde el panel de administración.
          </p>
        ) : (
          <ul className="mt-14 border-t border-line-strong">
            {services.map((s, i) => {
              let features: string[] = [];
              try {
                features = JSON.parse(s.features || "[]");
              } catch {
                features = [];
              }
              const href = s.slug ? `/servicios/${s.slug}` : "/presupuesto";
              return (
                <Reveal key={s.id} delay={Math.min(i, 4) * 50} as="li">
                  <Link
                    href={href}
                    className="group grid gap-x-8 gap-y-4 border-b border-line py-8 transition-colors hover:bg-paper md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.1fr)_auto] md:items-start md:px-4 md:-mx-4"
                    aria-label={s.slug ? `Ver el servicio ${s.title}` : `Calcular presupuesto de ${s.title}`}
                  >
                    <span className="section-index pt-1.5">{String(i + 1).padStart(2, "0")}</span>

                    <div className="flex items-start gap-4">
                      {s.image ? (
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[6px] bg-mist">
                          <Image
                            src={s.image}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <Icon name={s.icon} size={20} className="mt-1 shrink-0 text-navy-400" />
                      )}
                      <h3 className="text-[1.35rem] leading-tight tracking-[-0.02em] text-navy-900 transition-colors group-hover:text-brand-700">
                        {s.title}
                      </h3>
                    </div>

                    <div>
                      <p className="text-[15px] leading-[1.65] text-navy-600">{s.description}</p>
                      {features.length > 0 && (
                        <p className="mt-3 text-[13px] leading-relaxed text-navy-400">{features.join(" · ")}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 md:pt-1">
                      <span className="tnum whitespace-nowrap text-sm font-semibold text-navy-900">
                        {s.price_label || "Consultar"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-brand-600 transition-all group-hover:gap-2.5">
                        {s.slug ? "Ver detalle" : "Calcular"}
                        <Icon name="arrow" size={14} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
