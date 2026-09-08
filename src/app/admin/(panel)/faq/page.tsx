"use client";
import { CrudManager, type Row } from "@/components/admin/CrudManager";

export default function FaqPage() {
  return (
    <CrudManager
      resource="faqs"
      title="Preguntas frecuentes"
      description="Las preguntas del acordeón de la portada. También alimentan el marcado FAQ para Google."
      itemLabel="Pregunta"
      emptyIcon="help"
      fields={[
        { name: "question", label: "Pregunta", type: "text", required: true, colSpan: 2 },
        { name: "answer", label: "Respuesta", type: "textarea" },
        { name: "visible", label: "Visible en la web", type: "bool", help: "Mostrar esta pregunta" },
      ]}
      renderRow={(row: Row) => (
        <div>
          <p className="font-semibold text-navy-900">{String(row.question)}</p>
          <p className="line-clamp-2 text-sm text-slate-500">{String(row.answer || "")}</p>
        </div>
      )}
    />
  );
}
