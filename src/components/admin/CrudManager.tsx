"use client";
import { useCallback, useEffect, useState } from "react";
import { Icon, ICON_NAMES } from "@/components/ui/Icon";
import { Card, ConfirmButton, EmptyState, Modal, PageHeader, TableSkeleton } from "./ui";
import { useToast } from "./Toast";
import { MediaPicker } from "./MediaPicker";

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "bool" | "select" | "list" | "image" | "icon";
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
  required?: boolean;
  hideInForm?: boolean;
  colSpan?: 1 | 2;
};

export type Row = Record<string, unknown> & { id: number };

export function CrudManager({
  resource,
  title,
  description,
  fields,
  itemLabel,
  renderRow,
  extraQuery = "",
  reorderable = true,
  emptyIcon = "layout",
  defaults,
  onChanged,
}: {
  resource: string;
  title: string;
  description?: string;
  fields: CrudField[];
  itemLabel: string;
  renderRow: (row: Row) => React.ReactNode;
  extraQuery?: string;
  reorderable?: boolean;
  emptyIcon?: string;
  defaults?: Record<string, unknown>;
  onChanged?: () => void;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/${resource}?perPage=200${query ? `&q=${encodeURIComponent(query)}` : ""}${extraQuery}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRows(json.rows);
    } catch {
      push("No hemos podido cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  }, [resource, query, extraQuery, push]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  function openCreate() {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      initial[f.name] = f.type === "bool" ? 1 : f.type === "number" ? 0 : f.type === "list" ? [] : f.options?.[0]?.value ?? "";
    }
    setForm({ ...initial, ...(defaults || {}) });
    setErrors({});
    setCreating(true);
    setEditing(null);
  }

  function openEdit(row: Row) {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      const value = row[f.name];
      initial[f.name] =
        f.type === "list"
          ? (() => {
              try {
                return JSON.parse(String(value || "[]"));
              } catch {
                return [];
              }
            })()
          : value;
    }
    setForm(initial);
    setErrors({});
    setEditing(row);
    setCreating(false);
  }

  function close() {
    setEditing(null);
    setCreating(false);
  }

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const payload = { ...form };
      const res = await fetch(editing ? `/api/admin/${resource}/${editing.id}` : `/api/admin/${resource}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fieldErrors || {});
        push(json.error || "No se ha podido guardar", "error");
        return;
      }
      push(editing ? "Cambios guardados" : `${itemLabel} creado`);
      close();
      await load();
      onChanged?.();
    } catch {
      push("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido eliminar", "error");
    push("Registro eliminado");
    await load();
    onChanged?.();
  }

  async function toggleVisible(row: Row) {
    const res = await fetch(`/api/admin/${resource}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: row.visible ? 0 : 1 }),
    });
    if (!res.ok) return push("No se ha podido actualizar", "error");
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, visible: row.visible ? 0 : 1 } : r)));
    onChanged?.();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const res = await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, ids: next.map((r) => r.id) }),
    });
    if (!res.ok) {
      push("No se ha podido reordenar", "error");
      await load();
      return;
    }
    onChanged?.();
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <div className="relative">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="field w-full py-2 pl-9 text-sm sm:w-56"
              />
            </div>
            <button type="button" onClick={openCreate} className="btn-primary btn-sm">
              <Icon name="plus" size={16} /> Añadir
            </button>
          </>
        }
      />

      <Card>
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={query ? "Sin resultados" : `Todavía no hay ${title.toLowerCase()}`}
            description={query ? "Prueba con otra búsqueda." : `Crea el primer registro con el botón "Añadir".`}
            action={
              !query && (
                <button type="button" onClick={openCreate} className="btn-primary btn-sm">
                  <Icon name="plus" size={16} /> Añadir {itemLabel.toLowerCase()}
                </button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <li key={row.id} className="flex items-start gap-4 px-4 py-4 transition hover:bg-slate-50/70">
                {reorderable && (
                  <div className="flex flex-col gap-0.5 pt-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-slate-300 transition hover:bg-slate-100 hover:text-navy-800 disabled:opacity-30"
                      aria-label="Subir"
                    >
                      <Icon name="chevron" size={14} className="-rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                      className="rounded p-1 text-slate-300 transition hover:bg-slate-100 hover:text-navy-800 disabled:opacity-30"
                      aria-label="Bajar"
                    >
                      <Icon name="chevron" size={14} className="rotate-90" />
                    </button>
                  </div>
                )}

                <div className="min-w-0 flex-1">{renderRow(row)}</div>

                <div className="flex shrink-0 items-center gap-1">
                  {"visible" in row && (
                    <button
                      type="button"
                      onClick={() => toggleVisible(row)}
                      className={`rounded-lg p-2 transition ${
                        row.visible ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-100"
                      }`}
                      title={row.visible ? "Visible en la web" : "Oculto"}
                      aria-label={row.visible ? "Ocultar" : "Mostrar"}
                    >
                      <Icon name={row.visible ? "eye" : "eyeoff"} size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                    aria-label="Editar"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <ConfirmButton onConfirm={() => remove(row.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={creating || !!editing}
        onClose={close}
        title={editing ? `Editar ${itemLabel.toLowerCase()}` : `Nuevo ${itemLabel.toLowerCase()}`}
        wide
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {fields
              .filter((f) => !f.hideInForm)
              .map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  error={errors[field.name]}
                  onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
                />
              ))}
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="button" onClick={close} className="btn-secondary btn-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: CrudField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const span = field.colSpan === 2 || ["textarea", "list", "image"].includes(field.type) ? "sm:col-span-2" : "";
  const id = `field-${field.name}`;

  return (
    <div className={span}>
      <label className="label" htmlFor={id}>
        {field.label}
        {field.required && " *"}
      </label>

      {field.type === "textarea" && (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field resize-y"
        />
      )}

      {field.type === "text" && (
        <input
          id={id}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      )}

      {field.type === "number" && (
        <input
          id={id}
          type="number"
          step="any"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      )}

      {field.type === "bool" && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(Number(value ?? 0))}
            onChange={(e) => onChange(e.target.checked ? 1 : 0)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-600">{field.help || "Activado"}</span>
        </label>
      )}

      {field.type === "select" && (
        <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field">
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "list" && <ListInput value={value} onChange={onChange} placeholder={field.placeholder} />}

      {field.type === "image" && <MediaPicker value={String(value ?? "")} onChange={(v) => onChange(v)} />}

      {field.type === "icon" && <IconPicker value={String(value ?? "")} onChange={onChange} />}

      {field.help && field.type !== "bool" && <p className="help">{field.help}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

function ListInput({
  value,
  onChange,
  placeholder,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const items: string[] = Array.isArray(value)
    ? (value as string[])
    : (() => {
        try {
          const parsed = JSON.parse(String(value || "[]"));
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onChange(items.map((it, j) => (j === i ? e.target.value : it)))}
            className="field py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="rounded-lg px-3 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Quitar"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="btn-secondary btn-sm">
        <Icon name="plus" size={14} /> Añadir elemento
      </button>
      {placeholder && items.length === 0 && <p className="help">{placeholder}</p>}
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-12">
      {ICON_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          title={name}
          className={`grid aspect-square place-items-center rounded-lg border transition ${
            value === name ? "border-brand-600 bg-brand-50 text-brand-700" : "border-transparent text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Icon name={name} size={17} />
        </button>
      ))}
    </div>
  );
}
