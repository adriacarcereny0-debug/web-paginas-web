"use client";
import Image from "next/image";
import { CrudManager, type Row } from "@/components/admin/CrudManager";
import { Icon } from "@/components/ui/Icon";

export default function ResenasPage() {
  return (
    <CrudManager
      resource="reviews"
      title="Reseñas"
      description="Las opiniones que se muestran en la web, con su nota media y el reparto de estrellas. Sustituye las marcadas como DEMO por reseñas reales."
      itemLabel="Reseña"
      emptyIcon="star"
      fields={[
        { name: "author", label: "Nombre del cliente", type: "text", required: true },
        { name: "rating", label: "Valoración (1-5)", type: "number" },
        { name: "text", label: "Reseña", type: "textarea" },
        { name: "service", label: "Servicio contratado", type: "text", placeholder: "Web corporativa" },
        { name: "location", label: "Ciudad", type: "text", placeholder: "Girona" },
        { name: "source", label: "Origen", type: "text", placeholder: "Google, WhatsApp, email..." },
        { name: "reviewed_on", label: "Fecha mostrada", type: "text", placeholder: "hace 2 semanas" },
        { name: "avatar", label: "Foto (opcional)", type: "image" },
        { name: "featured", label: "Destacada", type: "bool", help: "Se muestra la primera" },
        { name: "is_demo", label: "Contenido de ejemplo (DEMO)", type: "bool", help: "Márcala si es una reseña de muestra" },
        { name: "visible", label: "Visible en la web", type: "bool", help: "Mostrar esta reseña" },
      ]}
      renderRow={(row: Row) => (
        <div className="flex items-start gap-3">
          {row.avatar ? (
            <Image
              src={String(row.avatar)}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
              {String(row.author || "?")
                .replace(/\[DEMO\]\s*/i, "")
                .charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-navy-900">{String(row.author)}</p>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={12}
                    className={i < Number(row.rating || 0) ? "text-amber-400" : "text-slate-200"}
                    fill={i < Number(row.rating || 0) ? "currentColor" : "none"}
                  />
                ))}
              </span>
              {row.featured ? (
                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                  Destacada
                </span>
              ) : null}
              {row.is_demo ? (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                  Demo
                </span>
              ) : null}
            </div>
            <p className="line-clamp-2 text-sm text-slate-500">{String(row.text || "")}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {[row.service, row.location, row.source, row.reviewed_on].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      )}
    />
  );
}
