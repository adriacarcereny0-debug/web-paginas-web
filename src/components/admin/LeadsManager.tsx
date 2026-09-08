"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { Card, ConfirmButton, EmptyState, Modal, PageHeader, Pagination, STATUS_LABELS, StatusBadge, TableSkeleton } from "./ui";
import { useToast } from "./Toast";

export type Lead = {
  id: number;
  name: string;
  surname: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  business_type: string;
  source: string;
  status: string;
  created_at: string;
};

type Detail = {
  lead: Lead;
  quotes: { id: number; public_id: string; price_min: number; price_max: number; monthly: number; status: string; created_at: string; summary: string; project_type: string }[];
  messages: { id: number; message: string; created_at: string; status: string }[];
  notes: { id: number; body: string; author: string; created_at: string }[];
};

const STATUSES = ["nuevo", "contactado", "negociacion", "cliente", "perdido"];

export function LeadsManager({
  title,
  description,
  fixedStatus,
}: {
  title: string;
  description: string;
  fixedStatus?: string;
}) {
  const { push } = useToast();
  const params = useSearchParams();
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(fixedStatus || params.get("status") || "");
  const [sort, setSort] = useState("created_at");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [openId, setOpenId] = useState<number | null>(Number(params.get("open")) || null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: "25", sort, dir });
      if (query) qs.set("q", query);
      if (status) qs.set("status", status);
      const res = await fetch(`/api/admin/leads?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRows(json.rows);
      setMeta({ pages: json.pages, total: json.total });
    } catch {
      push("No hemos podido cargar los leads", "error");
    } finally {
      setLoading(false);
    }
  }, [page, query, status, sort, dir, push]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  async function updateStatus(id: number, value: string) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    if (!res.ok) return push("No se ha podido cambiar el estado", "error");
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: value } : r)));
    push("Estado actualizado");
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido eliminar", "error");
    push("Lead eliminado");
    load();
  }

  function toggleSort(column: string) {
    if (sort === column) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(column);
      setDir("asc");
    }
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre, email, empresa..."
                className="field w-full py-2 pl-9 text-sm sm:w-72"
              />
            </div>
            {!fixedStatus && (
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="field w-full py-2 text-sm sm:w-44"
              >
                <option value="">Todos los estados</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            )}
            <a href="/api/admin/export?type=leads" className="btn-secondary btn-sm">
              <Icon name="download" size={15} /> CSV
            </a>
          </>
        }
      />

      <Card>
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="users"
            title={query || status ? "Sin resultados" : "Todavía no hay leads"}
            description={
              query || status
                ? "Prueba a cambiar los filtros de búsqueda."
                : "Cuando alguien complete el creador de presupuestos aparecerá aquí."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <Th label="Nombre" column="name" sort={sort} dir={dir} onSort={toggleSort} />
                    <th className="px-4 py-3 font-semibold">Contacto</th>
                    <th className="px-4 py-3 font-semibold">Empresa</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <Th label="Fecha" column="created_at" sort={sort} dir={dir} onSort={toggleSort} />
                    <Th label="Estado" column="status" sort={sort} dir={dir} onSort={toggleSort} />
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((lead) => (
                    <tr key={lead.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setOpenId(lead.id)}
                          className="font-semibold text-navy-900 hover:text-brand-600"
                        >
                          {lead.name} {lead.surname}
                        </button>
                        {lead.city && <p className="text-xs text-slate-500">{lead.city}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${lead.email}`} className="block text-slate-600 hover:text-brand-600">
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="block text-xs text-slate-500 hover:text-brand-600">
                            {lead.phone}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.company || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-slate-100 text-slate-600">{lead.source}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-navy-800"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setOpenId(lead.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                            aria-label="Ver detalles"
                          >
                            <Icon name="eye" size={16} />
                          </button>
                          <ConfirmButton onConfirm={() => remove(lead.id)} message="¿Eliminar este lead y todo su historial?" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
          </>
        )}
      </Card>

      <LeadDetail id={openId} onClose={() => setOpenId(null)} onChanged={load} />
    </>
  );
}

function Th({
  label,
  column,
  sort,
  dir,
  onSort,
}: {
  label: string;
  column: string;
  sort: string;
  dir: string;
  onSort: (c: string) => void;
}) {
  return (
    <th className="px-4 py-3 font-semibold">
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 hover:text-navy-900">
        {label}
        {sort === column && <Icon name="chevron" size={12} className={dir === "asc" ? "-rotate-90" : "rotate-90"} />}
      </button>
    </th>
  );
}

function LeadDetail({ id, onClose, onChanged }: { id: number | null; onClose: () => void; onChanged: () => void }) {
  const { push } = useToast();
  const [data, setData] = useState<Detail | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  const load = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/admin/leads/${id}/detail`);
    if (!res.ok) return push("No hemos podido cargar el lead", "error");
    const json = await res.json();
    setData(json);
    setForm(json.lead);
  }, [id, push]);

  useEffect(() => {
    setData(null);
    setEditing(false);
    if (id) load();
  }, [id, load]);

  async function addNote() {
    if (note.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: note }),
      });
      if (!res.ok) return push("No se ha podido guardar la nota", "error");
      setNote("");
      await load();
      push("Nota añadida");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId: number) {
    const res = await fetch(`/api/admin/leads/${id}/notes?noteId=${noteId}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido eliminar la nota", "error");
    load();
  }

  async function saveLead() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) return push("No se ha podido guardar", "error");
      push("Lead actualizado");
      setEditing(false);
      await load();
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!id} onClose={onClose} title="Ficha del lead" wide>
      {!data ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="font-display text-xl font-bold text-navy-900">
                {data.lead.name} {data.lead.surname}
              </h4>
              <p className="text-sm text-slate-500">
                {data.lead.company || "Sin empresa"} · alta {formatDate(data.lead.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data.lead.status} />
              <button type="button" onClick={() => setEditing((v) => !v)} className="btn-secondary btn-sm">
                <Icon name="edit" size={14} /> {editing ? "Cancelar" : "Editar"}
              </button>
            </div>
          </div>

          {editing ? (
            <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Nombre"],
                  ["surname", "Apellidos"],
                  ["company", "Empresa"],
                  ["email", "Email"],
                  ["phone", "Teléfono"],
                  ["city", "Ciudad"],
                  ["business_type", "Tipo de negocio"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="label" htmlFor={`lead-${key}`}>
                    {label}
                  </label>
                  <input
                    id={`lead-${key}`}
                    value={String(form[key] ?? "")}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="field py-2 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="label" htmlFor="lead-status">
                  Estado
                </label>
                <select
                  id="lead-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="field py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="button" onClick={saveLead} disabled={saving} className="btn-primary btn-sm">
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          ) : (
            <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <Info label="Email" value={data.lead.email} href={`mailto:${data.lead.email}`} />
              <Info label="Teléfono" value={data.lead.phone || "—"} href={data.lead.phone ? `tel:${data.lead.phone}` : undefined} />
              <Info label="Ciudad" value={data.lead.city || "—"} />
              <Info label="Tipo de negocio" value={data.lead.business_type || "—"} />
              <Info label="Origen" value={data.lead.source} />
              <Info label="Alta" value={formatDateTime(data.lead.created_at)} />
            </dl>
          )}

          <section>
            <h5 className="text-sm font-bold text-navy-900">Presupuestos ({data.quotes.length})</h5>
            {data.quotes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Este lead todavía no ha creado ningún presupuesto.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.quotes.map((q) => {
                  let summary: { group: string; items: { label: string }[] }[] = [];
                  try {
                    summary = JSON.parse(q.summary || "[]");
                  } catch {
                    summary = [];
                  }
                  return (
                    <li key={q.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-navy-900">
                            {q.public_id} · {q.project_type || "Proyecto"}
                          </p>
                          <p className="text-xs text-slate-500">{formatDateTime(q.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-base font-bold text-navy-900">
                            {formatMoney(q.price_min)} - {formatMoney(q.price_max)}
                          </p>
                          {q.monthly > 0 && <p className="text-xs text-slate-500">+{formatMoney(q.monthly)}/mes</p>}
                        </div>
                        <StatusBadge status={q.status} />
                      </div>
                      {summary.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {summary.flatMap((block) =>
                            block.items.map((item) => (
                              <span key={block.group + item.label} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                {item.label}
                              </span>
                            )),
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h5 className="text-sm font-bold text-navy-900">Mensajes ({data.messages.length})</h5>
            {data.messages.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Sin mensajes.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.messages.map((m) => (
                  <li key={m.id} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                    <p className="whitespace-pre-line">{m.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDateTime(m.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h5 className="text-sm font-bold text-navy-900">Notas internas</h5>
            <div className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Añade una nota interna..."
                className="field py-2 text-sm"
              />
              <button type="button" onClick={addNote} disabled={saving || note.trim().length < 2} className="btn-primary btn-sm">
                Añadir
              </button>
            </div>
            {data.notes.length > 0 && (
              <ul className="mt-3 space-y-2">
                {data.notes.map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-3 rounded-xl bg-amber-50/70 p-3.5">
                    <div>
                      <p className="text-sm text-navy-800">{n.body}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {n.author} · {formatDateTime(n.created_at)}
                      </p>
                    </div>
                    <ConfirmButton onConfirm={() => deleteNote(n.id)} message="¿Eliminar esta nota?" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy-900">
        {href ? (
          <a href={href} className="hover:text-brand-600">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
