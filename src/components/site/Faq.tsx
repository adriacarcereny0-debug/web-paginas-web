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
    <section id="faq" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} align="left" />
          <Reveal delay={160}>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-mist p-6">
              <p className="text-sm font-semibold text-navy-900">¿No encuentras tu respuesta?</p>
              <p className="mt-1.5 text-sm text-slate-600">Escríbenos y te contestamos en menos de 24 h laborables.</p>
              <Link href="/#contacto" className="btn-secondary btn-sm mt-4">
                Hablar con nosotros
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {items.length === 0 && <p className="py-8 text-sm text-slate-500">No hay preguntas publicadas todavía.</p>}
          {items.map((item, i) => {
            const isOpen = open === item.id;
            return (
              <Reveal key={item.id} delay={i * 40}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className={`text-[16px] font-semibold transition-colors ${isOpen ? "text-brand-700" : "text-navy-900"}`}>
                      {item.question}
                    </span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isOpen ? "rotate-45 border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <Icon name="plus" size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${item.id}`}
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-12 text-[15px] leading-relaxed text-slate-600">{item.answer}</p>
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
