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
      <div className="rounded-[8px] border border-line bg-white print:border-0">
        <div className="border-b border-line bg-navy-900 px-7 py-9 text-white sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-white/45">Tu proyecto</p>
              <h2 className="mt-3 text-[1.9rem] leading-tight tracking-[-0.025em] sm:text-[2.35rem]">
                {result.projectType || "Presupuesto personalizado"}
              </h2>
              <p className="mt-2 text-sm text-white/55">Referencia {result.publicId}</p>
            </div>
            <span className="rounded-[4px] border border-white/25 px-2.5 py-1 text-xs font-medium text-white/70">
              Estimación orientativa
            </span>
          </div>

          <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="eyebrow text-white/45">Presupuesto estimado</p>
              <p className="tnum mt-3 text-[2.1rem] leading-none tracking-[-0.035em] sm:text-[2.8rem]">
                {result.priceMin === result.priceMax
                  ? formatMoney(result.priceMax, result.currency)
                  : `${formatMoney(result.priceMin, result.currency)} — ${formatMoney(result.priceMax, result.currency)}`}
              </p>
              {result.monthly > 0 && (
                <p className="mt-2.5 text-sm text-white/60">
                  + {formatMoney(result.monthly, result.currency)}/mes en servicios recurrentes
                </p>
              )}
              {result.discount && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <Icon name="check" size={12} strokeWidth={3} /> {result.discount.label} (-{result.discount.percent}%)
                </p>
              )}
            </div>
            <div className="sm:border-l sm:border-white/15 sm:pl-8">
              <p className="eyebrow text-white/45">Tiempo estimado</p>
              <p className="tnum mt-3 text-[1.6rem] leading-none tracking-[-0.03em]">
                {result.daysMin}-{result.daysMax} días
              </p>
              <p className="mt-2.5 text-xs text-white/55">laborables desde el inicio</p>
            </div>
          </div>
        </div>

        <div className="px-7 py-8 sm:px-10">
          <h3 className="text-lg font-semibold text-navy-900">Resumen de tu configuración</h3>
          <dl className="mt-5 divide-y divide-line">
            {result.summary.map((block) => (
              <div key={block.groupKey} className="grid gap-1.5 py-4 sm:grid-cols-[240px_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-navy-400">{block.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {block.items.map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-mist px-2.5 py-1.5 text-[13px] font-medium text-navy-800"
                    >
                      <Icon name="check" size={12} strokeWidth={3} className="text-brand-600" />
                      {item.label}
                      {item.priceType === "monthly" && <span className="text-[11px] text-navy-400">/mes</span>}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>

          {note && (
            <p className="mt-6 rounded-xl border border-line bg-mist p-4 text-[13px] leading-relaxed text-navy-600">
              <Icon name="help" size={15} className="mr-1.5 inline align-[-2px] text-brand-600" />
              {note}
            </p>
          )}

          {state === "sent" ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center print:hidden">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon name="check" size={24} strokeWidth={2.4} />
              </span>
              <h4 className="mt-4 text-lg font-semibold text-emerald-900">Presupuesto solicitado</h4>
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

          <a
            href={`/presupuesto/${result.publicId}`}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy-400 transition hover:text-navy-900 print:hidden"
          >
            <Icon name="download" size={16} /> Descargar el presupuesto en PDF
          </a>
        </div>
      </div>
    </div>
  );
}
