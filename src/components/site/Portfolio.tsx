"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { SectionCopy } from "@/lib/content";

export type ProjectRow = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  tags: string;
  url: string;
  is_demo: number;
};

export function Portfolio({ copy, projects }: { copy: SectionCopy; projects: ProjectRow[] }) {
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))],
    [projects],
  );
  const [filter, setFilter] = useState("Todos");
  const visible = filter === "Todos" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="portfolio" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="container-x">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

        {projects.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            Todavía no hay proyectos publicados.
          </p>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="no-scrollbar mt-10 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      filter === c
                        ? "border-navy-900 bg-navy-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-navy-900"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => {
                let tags: string[] = [];
                try {
                  tags = JSON.parse(p.tags || "[]");
                } catch {
                  tags = [];
                }
                const Card = (
                  <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-brand-50">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="(max-width:768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      ) : (
                        <PlaceholderThumb title={p.title} />
                      )}
                      {p.is_demo === 1 && (
                        <span className="absolute left-3 top-3 rounded-full bg-navy-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      {p.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">{p.category}</span>
                      )}
                      <h3 className="mt-2 font-display text-lg font-bold text-navy-900">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
                      {tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {tags.map((t) => (
                            <span key={t} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {p.url && (
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition group-hover:gap-2.5">
                          Ver proyecto <Icon name="arrow" size={15} />
                        </span>
                      )}
                    </div>
                  </article>
                );
                return (
                  <Reveal key={p.id} delay={(i % 3) * 70}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {Card}
                      </a>
                    ) : (
                      Card
                    )}
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PlaceholderThumb({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-5">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-2/3 rounded-full bg-navy-900/15" />
        <div className="h-2 w-1/2 rounded-full bg-navy-900/10" />
        <div className="h-6 w-20 rounded-full bg-brand-500/25" />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
