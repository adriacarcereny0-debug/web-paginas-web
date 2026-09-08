"use client";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Card } from "./ui";
import { useToast } from "./Toast";

export function useSettings<T>(key: string) {
  const { push } = useToast();
  const [value, setValue] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/settings?key=${key}`);
    if (!res.ok) return push("No hemos podido cargar la configuración", "error");
    const json = await res.json();
    setValue(json.value);
    setDirty(false);
  }, [key, push]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback((updater: (current: T) => T) => {
    setValue((v) => (v === null ? v : updater(v)));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    if (value === null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        push(j.error || "No se ha podido guardar", "error");
        return;
      }
      push("Cambios guardados");
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [key, value, push]);

  const reset = useCallback(async () => {
    if (!window.confirm("¿Restaurar el contenido por defecto de esta sección?")) return;
    const res = await fetch(`/api/admin/settings?key=${key}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido restaurar", "error");
    const json = await res.json();
    setValue(json.value);
    setDirty(false);
    push("Contenido restaurado");
  }, [key, push]);

  return { value, update, save, reset, saving, dirty, reload: load };
}

export function SaveBar({
  saving,
  dirty,
  onSave,
  onReset,
}: {
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur">
      <p className="text-xs text-slate-500">
        {dirty ? "Tienes cambios sin guardar." : "Todo guardado."}
      </p>
      <div className="flex gap-2">
        {onReset && (
          <button type="button" onClick={onReset} className="btn-secondary btn-sm">
            <Icon name="refresh" size={14} /> Restaurar
          </button>
        )}
        <button type="button" onClick={onSave} disabled={saving || !dirty} className="btn-primary btn-sm">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export function TextField({
  label,
  value,
  onChange,
  help,
  placeholder,
  wide,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  help?: string;
  placeholder?: string;
  wide?: boolean;
  type?: string;
}) {
  const id = `s-${label.replace(/\W/g, "")}`;
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field" />
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  help?: string;
}) {
  const id = `s-${label.replace(/\W/g, "")}`;
  return (
    <div className="sm:col-span-2">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="field resize-y" />
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span>
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        {help && <span className="block text-xs text-slate-500">{help}</span>}
      </span>
    </label>
  );
}

export function RepeaterList<T>({
  label,
  items,
  onChange,
  empty,
  create,
  render,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  empty: string;
  create: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <div className="sm:col-span-2">
      <p className="label">{label}</p>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500">{empty}</p>}
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">#{i + 1}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (i === 0) return;
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    onChange(next);
                  }}
                  disabled={i === 0}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Subir"
                >
                  <Icon name="chevron" size={13} className="-rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (i === items.length - 1) return;
                    const next = [...items];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    onChange(next);
                  }}
                  disabled={i === items.length - 1}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Bajar"
                >
                  <Icon name="chevron" size={13} className="rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, create()])} className="btn-secondary btn-sm mt-3">
        <Icon name="plus" size={14} /> Añadir
      </button>
    </div>
  );
}
