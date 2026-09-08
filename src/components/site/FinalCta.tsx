import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { CtaSection } from "@/lib/content";

export function FinalCta({ content }: { content: CtaSection }) {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-navy-900 px-7 py-14 text-center sm:px-12 lg:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
              <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-[2.7rem] sm:leading-[1.1]">
                {content.title}
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-brand-50/90">{content.subtitle}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/presupuesto" className="btn group bg-white px-6 py-3.5 text-navy-900 hover:bg-brand-50">
                  {content.button}
                  <Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/#contacto" className="btn border border-white/30 px-6 py-3.5 text-white hover:bg-white/10">
                  {content.secondary}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
