"use client";
import Image from "next/image";
import { CrudManager, type Row } from "@/components/admin/CrudManager";
import { Icon } from "@/components/ui/Icon";

export default function PortfolioPage() {
  return (
    <CrudManager
      resource="projects"
      title="Portfolio"
      description="Los proyectos que se muestran en la web. Marca como demo los que sean de ejemplo."
      itemLabel="Proyecto"
      emptyIcon="image"
      fields={[
        { name: "title", label: "Nombre del proyecto", type: "text", required: true },
        { name: "category", label: "Categoría", type: "text", placeholder: "Web corporativa" },
        { name: "description", label: "Descripción", type: "textarea" },
        { name: "image", label: "Imagen", type: "image" },
        { name: "tags", label: "Tecnologías / servicios", type: "list" },
        { name: "url", label: "Enlace a la web", type: "text", placeholder: "https://..." },
        { name: "is_demo", label: "Contenido de ejemplo (DEMO)", type: "bool", help: "Muestra la etiqueta DEMO sobre la imagen" },
        { name: "visible", label: "Visible en la web", type: "bool", help: "Mostrar este proyecto" },
      ]}
      renderRow={(row: Row) => (
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
            {row.image ? (
              <Image src={String(row.image)} alt="" width={64} height={48} className="h-full w-full object-cover" unoptimized />
            ) : (
              <Icon name="image" size={18} className="text-slate-300" />
            )}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-navy-900">
              {String(row.title)}
              {row.is_demo ? (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">Demo</span>
              ) : null}
            </p>
            <p className="line-clamp-1 text-sm text-slate-500">{String(row.description || "")}</p>
            {row.category ? <p className="text-xs text-brand-600">{String(row.category)}</p> : null}
          </div>
        </div>
      )}
    />
  );
}
