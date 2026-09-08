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

export function Testimonials({ copy, items }: { copy: SectionCopy; items: TestimonialRow[] }) {
  if (items.length === 0) return null;
  return (
    <section id="testimonios" className="border-y border-slate-100 bg-mist py-20 lg:py-28">
      <div className="container-x">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 80}>
              <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 transition-shadow duration-300 hover:shadow-card">
                <Icon name="quote" size={26} className="text-brand-200" />
                <div className="mt-3 flex gap-0.5" aria-label={`Valoración: ${t.rating} de 5`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Icon
                      key={s}
                      name="star"
                      size={15}
                      className={s < t.rating ? "text-amber-400" : "text-slate-200"}
                      fill={s < t.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">“{t.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  {t.photo ? (
                    <Image src={t.photo} alt={t.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
                      {t.name.replace(/\[DEMO\]\s*/i, "").charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.company}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
