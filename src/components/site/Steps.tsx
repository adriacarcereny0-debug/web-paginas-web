import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { StepsSection } from "@/lib/content";

export function Steps({ content }: { content: StepsSection }) {
  return (
    <section id="proceso" className="relative scroll-mt-24 overflow-hidden bg-navy-900 py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/15 blur-[120px]" />
      </div>

      <div className="container-x relative">
        <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} light />

        <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 80} as="li">
              <div className="relative h-full rounded-2xl border border-white/10 bg-white/[.04] p-7 backdrop-blur transition-all duration-300 hover:border-brand-400/40 hover:bg-white/[.07]">
                <span className="font-display text-4xl font-extrabold tracking-tight text-brand-400/60">{step.number}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{step.text}</p>
                {i < content.steps.length - 1 && (
                  <span aria-hidden className="absolute -right-3 top-12 hidden text-white/15 lg:block">
                    <Icon name="chevron" size={22} />
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={200}>
          <div className="mt-12 flex justify-center">
            <Link href="/presupuesto" className="btn-primary group">
              Empezar mi presupuesto
              <Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
