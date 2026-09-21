import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { TrustSection } from "@/lib/content";

export function Trust({ content }: { content: TrustSection }) {
  return (
    <section id="confianza" className="section-tight bg-paper">
      <div className="container-x">
        <SectionHeader index="01" eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />

        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <div className="border-t border-line-strong pt-5">
                <Icon name={item.icon} size={18} className="text-brand-600" />
                <h3 className="mt-4 text-[15px] font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-[1.6] text-navy-600">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {content.stats?.length > 0 && (
          <Reveal delay={120}>
            <div className="mt-14 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-3">
              {content.stats.map((s) => (
                <div key={s.label}>
                  <p className="tnum text-[2.4rem] leading-none tracking-[-0.03em] text-navy-900">{s.value}</p>
                  <p className="mt-2.5 text-sm text-navy-400">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
