import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { SectionCopy } from "@/lib/content";

export type TestimonialRow = {
  id: number;
  name: string;
  company: string;
  text: string;
  photo: string;
  rating: number;
  is_demo: number;
};

/**
 * Citas a tamaño de lectura, separadas por filetes. Sin tarjetas, sin comillas
 * decorativas gigantes y sin sombras.
 */
export function Testimonials({ copy, items }: { copy: SectionCopy; items: TestimonialRow[] }) {
  if (items.length === 0) return null;
  return (
    <section id="testimonios" className="section-tight bg-navy-900">
      <div className="container-x">
        <SectionHeader index="05" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} light />

        <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 2) * 70}>
              <figure className="flex h-full flex-col border-t border-white/15 pt-6">
                <div className="flex gap-0.5" aria-label={`Valoración: ${t.rating} de 5`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Icon
                      key={s}
                      name="star"
                      size={13}
                      className={s < t.rating ? "text-white" : "text-white/25"}
                      fill={s < t.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[1.05rem] leading-[1.6] text-white/90">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.photo ? (
                    <Image
                      src={t.photo}
                      alt={t.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
                      {t.name.replace(/\[DEMO\]\s*/i, "").charAt(0)}
                    </span>
                  )}
                  <p className="text-sm text-white/55">
                    <span className="font-medium text-white">{t.name}</span>
                    {t.company ? ` · ${t.company}` : ""}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
