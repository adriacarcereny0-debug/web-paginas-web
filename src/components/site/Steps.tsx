import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { StepsSection } from "@/lib/content";

/**
 * Secuencia numerada sobre papel. Antes era una banda oscura con manchas de
 * color difuminadas y tarjetas de cristal: el patrón más reconocible de
 * plantilla generada automáticamente.
 */
export function Steps({ content }: { content: StepsSection }) {
  return (
    <section id="proceso" className="section scroll-mt-24 bg-paper">
      <div className="container-x">
        <SectionHeader index="03" eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />

        <ol className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 60} as="li">
              <div className="border-t border-navy-900 pt-5">
                <span className="tnum block text-[2.75rem] leading-none tracking-[-0.04em] text-line-strong">
                  {step.number}
                </span>
                <h3 className="mt-5 text-[1.05rem] font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-[1.65] text-navy-600">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={180}>
          <div className="mt-14 border-t border-line pt-8">
            <Link
              href="/presupuesto"
              className="group inline-flex items-center gap-2 text-[15px] font-medium text-navy-900"
            >
              <span className="link-underline pb-0.5">Empezar mi presupuesto</span>
              <Icon name="arrow" size={16} className="text-brand-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
