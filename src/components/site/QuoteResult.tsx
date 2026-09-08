"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/utils";
import type { QuoteResponse } from "./QuoteWizard";

export function QuoteResult({
  result,
  note,
  onModify,
}: {
  result: QuoteResponse;
  note: string;
  onModify: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function request() {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/quote/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: result.publicId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "No hemos podido enviar tu solicitud.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setState("error");
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-card print:border-0 print:shadow-none">
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-navy-900 px-7 py-9 text-white sm:px-10">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Tu proyecto</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {result.projectType || "Presupuesto personalizado"}
              </h2>
              <p className="mt-2 text-sm text-brand-100">Referencia {result.publicId}</p>
            </div>
            <span className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold">
              Estimación orientativa
            </span>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-100">Presupuesto estimado</p>
              <p className="mt-1.5 font-display text-3xl font-extrabold tracking-tight sm:text-[2.6rem]">
                {result.priceMin === result.priceMax
                  ? formatMoney(result.priceMax, result.currency)
                  : `${formatMoney(result.priceMin, result.currency)} - ${formatMoney(result.priceMax, result.currency)}`}
              </p>
              {result.monthly > 0 && (
                <p className="mt-1 text-sm text-brand-100">
                  + {formatMoney(result.monthly, result.currency)}/mes en servicios recurrentes
                </p>
              )}
              {result.discount && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                  <Icon name="check" size={12} strokeWidth={3} /> {result.discount.label} (-{result.discount.percent}%)
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-100">Tiempo estimado</p>
              <p className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">
                {result.daysMin}-{result.daysMax} días
              </p>
              <p className="mt-1 text-xs text-brand-100">laborables desde el inicio</p>
            </div>
          </div>
        </div>

        <div className="px-7 py-8 sm:px-10">
          <h3 className="font-display text-lg font-bold text-navy-900">Resumen de tu configuración</h3>
          <dl className="mt-5 divide-y divide-slate-100">
            {result.summary.map((block) => (
              <div key={block.groupKey} className="grid gap-1.5 py-4 sm:grid-cols-[240px_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-slate-500">{block.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {block.items.map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[13px] font-medium text-navy-800"
                    >
                      <Icon name="check" size={12} strokeWidth={3} className="text-brand-600" />
                      {item.label}
                      {item.priceType === "monthly" && <span className="text-[11px] text-slate-500">/mes</span>}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>

          {note && (
            <p className="mt-6 rounded-xl border border-slate-200 bg-mist p-4 text-[13px] leading-relaxed text-slate-600">
              <Icon name="help" size={15} className="mr-1.5 inline align-[-2px] text-brand-600" />
              {note}
            </p>
          )}

          {state === "sent" ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center print:hidden">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon name="check" size={24} strokeWidth={2.4} />
              </span>
              <h4 className="mt-4 font-display text-lg font-bold text-emerald-900">Presupuesto solicitado</h4>
              <p className="mx-auto mt-2 max-w-md text-sm text-emerald-800">
                Hemos recibido tu solicitud con la referencia <strong>{result.publicId}</strong>. Te contactaremos en menos
                de 24 horas laborables para concretar los detalles.
              </p>
              <Link href="/" className="btn-secondary btn-sm mt-5">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
              <button type="button" onClick={request} disabled={state === "loading"} className="btn-primary group flex-1">
                {state === "loading" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Solicitar este presupuesto
                    <Icon name="arrow" size={17} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <Link href="/#contacto" className="btn-secondary flex-1">
                Hablar con nosotros
              </Link>
              <button type="button" onClick={onModify} className="btn-ghost">
                <Icon name="refresh" size={16} /> Volver a modificar
              </button>
            </div>
          )}

          {state === "error" && error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">{error}</p>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-navy-900 print:hidden"
          >
            <Icon name="download" size={16} /> Descargar en PDF
          </button>
        </div>
      </div>
    </div>
  );
}
