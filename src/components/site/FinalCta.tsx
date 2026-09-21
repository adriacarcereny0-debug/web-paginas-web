import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { CtaSection } from "@/lib/content";

/**
 * Cierre a sangre sobre tinta plana: ni degradado, ni caja redondeada, ni
 * manchas de color difuminadas.
 */
export function FinalCta({ content }: { content: CtaSection }) {
  return (
    <section className="bg-navy-900">
      <div className="container-x py-20 lg:py-24">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_auto] lg:items-end">
            <div>
              <h2 className="max-w-[18ch] text-[2rem] leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.75rem]">
                {content.title}
              </h2>
              <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.65] text-white/60">{content.subtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href="/presupuesto" className="btn group bg-white text-navy-900 hover:bg-white/90">
                {content.button}
                <Icon name="arrow" size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/#contacto" className="btn border border-white/25 text-white hover:bg-white/10">
                {content.secondary}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
