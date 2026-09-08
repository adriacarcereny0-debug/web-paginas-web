"use client";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { ReviewsSection } from "@/lib/content";

export type ReviewRow = {
  id: number;
  author: string;
  service: string;
  location: string;
  text: string;
  rating: number;
  source: string;
  avatar: string;
  reviewed_on: string;
  is_demo: number;
};

const PAGE = 6;

export function Reviews({ copy, reviews }: { copy: ReviewsSection; reviews: ReviewRow[] }) {
  const [visible, setVisible] = useState(PAGE);
  if (reviews.length === 0) return null;

  const total = reviews.length;
  const average = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const shown = reviews.slice(0, visible);

  return (
    <section id="resenas" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="container-x">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

        {copy.showSummary && (
          <Reveal delay={80}>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 rounded-2xl border border-slate-200 bg-mist p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-10 sm:p-8">
              <div className="text-center sm:text-left">
                <p className="font-display text-5xl font-extrabold tracking-tight text-navy-900">
                  {average.toFixed(1).replace(".", ",")}
                </p>
                <Stars value={average} className="mt-2 justify-center sm:justify-start" />
                <p className="mt-1.5 text-sm text-slate-500">
                  {total} {total === 1 ? "reseña" : "reseñas"}
                </p>
              </div>

              <ul className="space-y-1.5">
                {distribution.map((d) => (
                  <li key={d.star} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 text-xs font-medium text-slate-500">{d.star} ★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right text-xs text-slate-400">{d.count}</span>
                  </li>
                ))}
              </ul>

              {copy.highlightValue && (
                <div className="border-slate-200 text-center sm:border-l sm:pl-10 sm:text-left">
                  <p className="font-display text-4xl font-extrabold tracking-tight text-brand-600">
                    {copy.highlightValue}
                  </p>
                  <p className="mt-1 max-w-[9rem] text-sm text-slate-600">{copy.highlightLabel}</p>
                </div>
              )}
            </div>
          </Reveal>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((review, i) => (
            <Reveal key={review.id} delay={(i % 3) * 70}>
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div className="flex items-start gap-3">
                  {review.avatar ? (
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-base font-bold text-brand-700">
                      {review.author.replace(/\[DEMO\]\s*/i, "").charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-navy-900">{review.author}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[review.service, review.location].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {review.is_demo === 1 && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Demo
                    </span>
                  )}
                </div>

                <Stars value={review.rating} className="mt-4" />
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-700">{review.text}</p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <span>{review.reviewed_on}</span>
                  {review.source && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                      <Icon name="check" size={12} strokeWidth={3} className="text-emerald-500" />
                      {review.source}
                    </span>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {visible < total && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="btn-secondary">
              Ver más reseñas
              <span className="text-slate-400">({total - visible})</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label={`Valoración: ${value.toFixed(1)} sobre 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={15}
          className={i < Math.round(value) ? "text-amber-400" : "text-slate-200"}
          fill={i < Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
