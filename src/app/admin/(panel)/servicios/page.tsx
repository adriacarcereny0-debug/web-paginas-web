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
        {
          name: "slug",
          label: "Dirección de la página",
          type: "text",
          help: "Crea la página /servicios/lo-que-escribas. Sin acentos ni espacios. Déjalo vacío para no publicar página propia.",
        },
        {
          name: "body",
          label: "Texto de la página del servicio",
          type: "textarea",
          help: "Es el contenido que lee Google. Separa los párrafos con una línea en blanco. Cuanto más concreto y útil, mejor posiciona.",
        },
        {
          name: "meta_title",
          label: "Título para Google (opcional)",
          type: "text",
          help: "Lo ideal, entre 50 y 60 caracteres. Si lo dejas vacío se usa el título del servicio.",
        },
        {
          name: "meta_description",
          label: "Descripción para Google (opcional)",
          type: "textarea",
          help: "Entre 120 y 160 caracteres. Es el texto que aparece bajo el título en los resultados de búsqueda.",
        },
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
            {row.slug ? (
              <p className="mt-0.5 font-mono text-[11px] text-brand-600">/servicios/{String(row.slug)}</p>
            ) : (
              <p className="mt-0.5 text-[11px] text-amber-600">Sin página propia (rellena la dirección para crearla)</p>
            )}
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
