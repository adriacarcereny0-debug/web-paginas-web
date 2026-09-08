import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { TrustSection } from "@/lib/content";

export function Trust({ content }: { content: TrustSection }) {
  return (
    <section id="confianza" className="border-y border-slate-100 bg-mist py-20 lg:py-28">
      <div className="container-x">
        <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-slate-200/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={item.icon} size={21} />
                </span>
                <h3 className="mt-5 text-[15px] font-bold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {content.stats?.length > 0 && (
          <Reveal delay={120}>
            <div className="mt-12 grid divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {content.stats.map((s) => (
                <div key={s.label} className="px-6 py-7 text-center">
                  <p className="font-display text-3xl font-extrabold tracking-tight text-navy-900">{s.value}</p>
                  <p className="mt-1.5 text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
