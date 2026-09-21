"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { SectionCopy } from "@/lib/content";

export type FaqRow = { id: number; question: string; answer: string };

export function Faq({ copy, items }: { copy: SectionCopy; items: FaqRow[] }) {
  const [open, setOpen] = useState<number | null>(items[0]?.id ?? null);

  return (
    <section id="faq" className="section scroll-mt-24 bg-paper">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <SectionHeader index="07" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
          <Reveal delay={160}>
            <div className="mt-10 border-t border-line pt-6">
              <p className="text-sm text-navy-600">
                ¿No encuentras tu respuesta? Escríbenos y te contestamos en menos de 24 h laborables.
              </p>
              <Link
                href="/#contacto"
                className="link-underline mt-3 inline-block pb-0.5 text-sm font-medium text-navy-900"
              >
                Hablar con nosotros
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="border-t border-line-strong">
          {items.length === 0 && <p className="py-8 text-sm text-navy-400">No hay preguntas publicadas todavía.</p>}
          {items.map((item, i) => {
            const isOpen = open === item.id;
            return (
              <Reveal key={item.id} delay={i * 30}>
                <h3 className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span
                      className={`text-[16px] font-medium transition-colors ${
                        isOpen ? "text-navy-900" : "text-navy-700"
                      }`}
                    >
                      {item.question}
                    </span>
                    <Icon
                      name="chevron"
                      size={16}
                      className={`mt-1 shrink-0 transition-transform duration-200 ${
                        isOpen ? "-rotate-90 text-brand-600" : "rotate-90 text-navy-400"
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${item.id}`}
                  className="grid border-b border-line transition-all duration-200 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    borderBottomWidth: isOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 text-[15px] leading-[1.7] text-navy-600">{item.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
