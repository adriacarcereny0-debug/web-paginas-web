"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function PrintBar({ reference }: { reference: string }) {
  return (
    <div className="mx-auto mb-5 flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
      <div>
        <p className="font-display text-lg font-bold text-navy-900">Presupuesto {reference}</p>
        <p className="text-sm text-slate-500">Descárgalo en PDF o imprímelo. También puedes guardarlo desde aquí.</p>
      </div>
      <div className="flex gap-2">
        <Link href="/" className="btn-secondary btn-sm">
          Volver a la web
        </Link>
        <button type="button" onClick={() => window.print()} className="btn-primary btn-sm">
          <Icon name="download" size={15} /> Descargar en PDF
        </button>
      </div>
    </div>
  );
}
