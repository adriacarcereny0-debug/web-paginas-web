"use client";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-navy-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  nuevo: "bg-blue-50 text-blue-700",
  contactado: "bg-amber-50 text-amber-700",
  negociacion: "bg-violet-50 text-violet-700",
  cliente: "bg-emerald-50 text-emerald-700",
  perdido: "bg-slate-100 text-slate-500",
  borrador: "bg-slate-100 text-slate-600",
  enviado: "bg-blue-50 text-blue-700",
  aceptado: "bg-emerald-50 text-emerald-700",
  rechazado: "bg-red-50 text-red-700",
  leido: "bg-slate-100 text-slate-600",
  respondido: "bg-emerald-50 text-emerald-700",
  archivado: "bg-slate-100 text-slate-400",
};

export const STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  negociacion: "En negociación",
  cliente: "Cliente",
  perdido: "Perdido",
  borrador: "Borrador",
  enviado: "Enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  leido: "Leído",
  respondido: "Respondido",
  archivado: "Archivado",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy-900/45 p-4 backdrop-blur-sm sm:p-8">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full animate-scale-in rounded-2xl border border-slate-200 bg-white shadow-card ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-navy-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100" aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  label = "Eliminar",
  message = "¿Seguro que quieres eliminarlo? Esta acción no se puede deshacer.",
  className = "",
  children,
}: {
  onConfirm: () => void;
  label?: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(message)) onConfirm();
      }}
      className={className || "rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"}
      title={label}
      aria-label={label}
    >
      {children ?? <Icon name="trash" size={16} />}
    </button>
  );
}

export function Pagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return <p className="px-4 py-3 text-xs text-slate-500">{total} registros</p>;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        Página {page} de {pages} · {total} registros
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary btn-sm disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="btn-secondary btn-sm disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
