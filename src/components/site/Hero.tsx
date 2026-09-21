import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { Hero as HeroContent } from "@/lib/content";

/**
 * Portada tipográfica: el titular ocupa el ancho de la retícula y el resto se
 * organiza en dos columnas asimétricas. Sin degradados, sin manchas de color
 * difuminadas y sin maquetas falsas con cifras inventadas.
 */
export function Hero({ content }: { content: HeroContent }) {
  return (
    <section id="inicio" className="bg-white pt-[var(--header-h)]">
      <div className="container-x pb-16 pt-14 lg:pb-20 lg:pt-24">
        {content.badge && (
          <Reveal>
            <p className="flex items-center gap-2.5 text-[13px] font-medium text-navy-600">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              {content.badge}
            </p>
          </Reveal>
        )}

        <Reveal delay={60}>
          <h1 className="mt-7 max-w-[15ch] text-[2.7rem] leading-[1.04] tracking-[-0.035em] text-navy-900 sm:text-[4rem] lg:text-[5rem]">
            {content.title}{" "}
            <span className="text-brand-600">{content.highlight}</span>
          </h1>
        </Reveal>

        <div className="mt-12 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Reveal delay={120}>
              <p className="max-w-[52ch] text-[17px] leading-[1.65] text-navy-600">{content.subtitle}</p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/presupuesto" className="btn-primary group">
                  {content.primaryCta}
                  <Icon name="arrow" size={17} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/#proceso" className="btn-secondary">
                  {content.secondaryCta}
                </Link>
              </div>
            </Reveal>
          </div>

          {content.bullets?.length > 0 && (
            <Reveal delay={220}>
              <ul className="lg:border-l lg:border-line lg:pl-16">
                {content.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 border-b border-line py-3 text-[15px] text-navy-700 last:border-b-0"
                  >
                    <Icon name="check" size={15} strokeWidth={2.2} className="mt-1 shrink-0 text-brand-600" />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      {content.image && (
        <div className="container-x pb-4">
          <Reveal>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[8px] bg-mist">
              <Image
                src={content.image}
                alt=""
                fill
                priority
                sizes="(max-width: 1160px) 100vw, 1080px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
