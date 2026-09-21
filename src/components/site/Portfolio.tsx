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

function parseTags(raw: string) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Retícula asimétrica: el primer proyecto ocupa el ancho completo y el resto se
 * reparte en tres columnas. Las piezas no llevan marco ni sombra: manda la imagen.
 */
export function Portfolio({ copy, projects }: { copy: SectionCopy; projects: ProjectRow[] }) {
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))],
    [projects],
  );
  const [filter, setFilter] = useState("Todos");
  const visible = filter === "Todos" ? projects : projects.filter((p) => p.category === filter);
  const [lead, ...rest] = visible;

  return (
    <section id="portfolio" className="section scroll-mt-24 bg-white">
      <div className="container-x">
        <SectionHeader index="04" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

        {projects.length === 0 ? (
          <p className="mt-12 border-t border-line pt-10 text-sm text-navy-400">
            Todavía no hay proyectos publicados.
          </p>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="no-scrollbar mt-10 flex gap-6 overflow-x-auto border-b border-line pb-3">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    aria-pressed={filter === c}
                    className={`shrink-0 text-sm transition-colors ${
                      filter === c ? "font-semibold text-navy-900" : "text-navy-400 hover:text-navy-900"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {lead && (
              <Reveal>
                <ProjectItem project={lead} featured />
              </Reveal>
            )}

            {rest.length > 0 && (
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 60}>
                    <ProjectItem project={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ProjectItem({ project: p, featured = false }: { project: ProjectRow; featured?: boolean }) {
  const tags = parseTags(p.tags);

  const body = (
    <article className={featured ? "group grid gap-8 py-12 lg:grid-cols-[1.35fr_1fr] lg:items-end" : "group"}>
      <div
        className={`relative overflow-hidden rounded-[8px] bg-mist ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}
      >
        {p.image ? (
          <Image
            src={p.image}
            alt={p.title}
            fill
            sizes={featured ? "(max-width:1024px) 100vw, 660px" : "(max-width:768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading={featured ? "eager" : "lazy"}
          />
        ) : (
          <PlaceholderThumb title={p.title} />
        )}
        {p.is_demo === 1 && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-navy-600">
            Demo
          </span>
        )}
      </div>

      <div className={featured ? "" : "mt-5"}>
        {p.category && (
          <span className="eyebrow text-navy-400">{p.category}</span>
        )}
        <h3
          className={`mt-3 tracking-[-0.02em] text-navy-900 transition-colors group-hover:text-brand-700 ${
            featured ? "text-[1.9rem] leading-tight" : "text-[1.15rem] font-semibold"
          }`}
        >
          {p.title}
        </h3>
        <p className={`mt-3 text-[15px] leading-[1.65] text-navy-600 ${featured ? "max-w-[46ch]" : ""}`}>
          {p.description}
        </p>
        {tags.length > 0 && <p className="mt-3 text-[13px] text-navy-400">{tags.join(" · ")}</p>}
        {p.url && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-600 transition-all group-hover:gap-2.5">
            Ver proyecto <Icon name="arrow" size={14} />
          </span>
        )}
      </div>
    </article>
  );

  if (!p.url) return body;
  return (
    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block">
      {body}
    </a>
  );
}

function PlaceholderThumb({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="text-[13px] text-navy-400">Sin imagen</span>
      <span className="sr-only">{title}</span>
    </div>
  );
}
