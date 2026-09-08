"use client";
import { CrudManager, type Row } from "@/components/admin/CrudManager";
import { Icon } from "@/components/ui/Icon";

export default function ServiciosPage() {
  return (
    <CrudManager
      resource="services"
      title="Servicios"
      description="Los servicios que se muestran en la portada. Puedes ordenarlos, ocultarlos y editarlos."
      itemLabel="Servicio"
      emptyIcon="layout"
      fields={[
        { name: "title", label: "Título", type: "text", required: true, placeholder: "Web corporativa" },
        { name: "price_label", label: "Etiqueta de precio", type: "text", placeholder: "Desde 900 €" },
        { name: "description", label: "Descripción", type: "textarea", placeholder: "Para empresas que..." },
        { name: "icon", label: "Icono", type: "icon" },
        { name: "price_from", label: "Precio desde (interno)", type: "number", help: "Solo informativo para tu control." },
        { name: "features", label: "Características incluidas", type: "list", placeholder: "Añade los puntos que se listan en la tarjeta." },
        { name: "image", label: "Imagen (opcional)", type: "image", help: "Si añades imagen, sustituye al icono." },
        { name: "visible", label: "Visible en la web", type: "bool", help: "Mostrar este servicio" },
      ]}
      renderRow={(row: Row) => (
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Icon name={String(row.icon || "layout")} size={19} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-navy-900">{String(row.title)}</p>
            <p className="line-clamp-1 text-sm text-slate-500">{String(row.description || "")}</p>
            {row.price_label ? (
              <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {String(row.price_label)}
              </span>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
