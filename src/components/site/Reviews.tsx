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
    <section id="resenas" className="section scroll-mt-24 bg-white">
      <div className="container-x">
        <SectionHeader index="06" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

        {copy.showSummary && (
          <Reveal delay={80}>
            <div className="mt-12 grid gap-8 border-y border-line py-8 sm:grid-cols-[auto_1fr] sm:gap-14 lg:grid-cols-[auto_1fr_auto]">
              <div>
                <p className="tnum text-[3.25rem] leading-none tracking-[-0.04em] text-navy-900">
                  {average.toFixed(1).replace(".", ",")}
                </p>
                <Stars value={average} className="mt-3" />
                <p className="mt-2 text-sm text-navy-400">
                  {total} {total === 1 ? "reseña" : "reseñas"}
                </p>
              </div>

              <ul className="max-w-sm space-y-2 self-center">
                {distribution.map((d) => (
                  <li key={d.star} className="flex items-center gap-3">
                    <span className="tnum w-6 shrink-0 text-xs text-navy-400">{d.star}</span>
                    <span className="h-px flex-1 bg-line">
                      <span
                        className="block h-px bg-navy-900"
                        style={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="tnum w-6 shrink-0 text-right text-xs text-navy-400">{d.count}</span>
                  </li>
                ))}
              </ul>

              {copy.highlightValue && (
                <div className="self-center lg:border-l lg:border-line lg:pl-14">
                  <p className="tnum text-[2rem] leading-none tracking-[-0.03em] text-navy-900">
                    {copy.highlightValue}
                  </p>
                  <p className="mt-2 max-w-[14rem] text-sm text-navy-600">{copy.highlightLabel}</p>
                </div>
              )}
            </div>
          </Reveal>
        )}

        <div className="mt-2 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((review, i) => (
            <Reveal key={review.id} delay={(i % 3) * 60}>
              <article className="flex h-full flex-col border-b border-line py-7">
                <div className="flex items-start gap-3">
                  {review.avatar ? (
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-xs font-semibold text-navy-700">
                      {review.author.replace(/\[DEMO\]\s*/i, "").charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-navy-900">{review.author}</p>
                    <p className="truncate text-xs text-navy-400">
                      {[review.service, review.location].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {review.is_demo === 1 && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-navy-400">Demo</span>
                  )}
                </div>

                <Stars value={review.rating} className="mt-4" />
                <p className="mt-3 flex-1 text-[15px] leading-[1.65] text-navy-700">{review.text}</p>

                <div className="mt-5 flex items-center justify-between text-xs text-navy-400">
                  <span>{review.reviewed_on}</span>
                  {review.source && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="check" size={11} strokeWidth={3} className="text-brand-600" />
                      {review.source}
                    </span>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {visible < total && (
          <div className="mt-10">
            <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="btn-secondary">
              Ver más reseñas
              <span className="tnum text-navy-400">({total - visible})</span>
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
          size={14}
          className={i < Math.round(value) ? "text-navy-900" : "text-line-strong"}
          fill={i < Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
