import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { Hero as HeroContent } from "@/lib/content";
import { HeroMockup } from "./HeroMockup";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-[72px]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-70" />
        <div className="absolute -left-40 -top-32 h-[420px] w-[420px] rounded-full bg-brand-400/20 blur-[110px]" />
        <div className="absolute -right-32 top-24 h-[380px] w-[380px] rounded-full bg-sky-300/25 blur-[110px]" />
      </div>

      <div className="container-x relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-24">
        <div>
          {content.badge && (
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-[13px] font-medium text-navy-700 shadow-soft backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {content.badge}
              </span>
            </Reveal>
          )}

          <Reveal delay={60}>
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-navy-900 sm:text-6xl lg:text-[4.1rem]">
              {content.title}{" "}
              <span className="text-gradient">{content.highlight}</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-600 sm:text-lg">{content.subtitle}</p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/presupuesto" className="btn-primary group">
                {content.primaryCta}
                <Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/#proceso" className="btn-secondary">
                {content.secondaryCta}
              </Link>
            </div>
          </Reveal>

          {content.bullets?.length > 0 && (
            <Reveal delay={240}>
              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                {content.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <Icon name="check" size={12} strokeWidth={2.4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <Reveal delay={140} className="relative">
          {content.image ? (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card">
              <Image
                src={content.image}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          ) : (
            <HeroMockup />
          )}
        </Reveal>
      </div>
    </section>
  );
}
