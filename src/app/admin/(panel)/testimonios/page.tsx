"use client";
import { CrudManager, type Row } from "@/components/admin/CrudManager";
import { Icon } from "@/components/ui/Icon";

export default function TestimoniosPage() {
  return (
    <CrudManager
      resource="testimonials"
      title="Testimonios"
      description="Opiniones de clientes. Los marcados como DEMO son textos de ejemplo: sustitúyelos por reales."
      itemLabel="Testimonio"
      emptyIcon="quote"
      fields={[
        { name: "name", label: "Nombre", type: "text", required: true },
        { name: "company", label: "Empresa", type: "text" },
        { name: "text", label: "Testimonio", type: "textarea" },
        { name: "photo", label: "Foto (opcional)", type: "image" },
        { name: "rating", label: "Valoración (1-5)", type: "number" },
        { name: "is_demo", label: "Contenido de ejemplo (DEMO)", type: "bool", help: "Márcalo si es un texto de muestra" },
        { name: "visible", label: "Visible en la web", type: "bool", help: "Mostrar este testimonio" },
      ]}
      renderRow={(row: Row) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-navy-900">{String(row.name)}</p>
            <span className="text-xs text-slate-500">{String(row.company || "")}</span>
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
          </div>
          <p className="line-clamp-2 text-sm text-slate-500">{String(row.text || "")}</p>
        </div>
      )}
    />
  );
}
