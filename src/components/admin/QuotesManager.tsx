"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { Card, ConfirmButton, EmptyState, Modal, PageHeader, Pagination, STATUS_LABELS, StatusBadge, TableSkeleton } from "./ui";
import { useToast } from "./Toast";

type Quote = {
  id: number;
  public_id: string;
  lead_id: number | null;
  project_type: string;
  price_min: number;
  price_max: number;
  monthly: number;
  days_min: number;
  days_max: number;
  status: string;
  notes: string;
  summary: string;
  created_at: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
};

const STATUSES = ["borrador", "enviado", "contactado", "aceptado", "rechazado"];

export function QuotesManager() {
  const { push } = useToast();
  const params = useSearchParams();
  const [rows, setRows] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") || "");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [detail, setDetail] = useState<Quote | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: "25" });
      if (query) qs.set("q", query);
      if (status) qs.set("status", status);
      const res = await fetch(`/api/admin/quotes-list?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRows(json.rows);
      setMeta({ pages: json.pages, total: json.total });
    } catch {
      push("No hemos podido cargar los presupuestos", "error");
    } finally {
      setLoading(false);
    }
  }, [page, query, status, push]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  async function updateStatus(id: number, value: string) {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    if (!res.ok) return push("No se ha podido cambiar el estado", "error");
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: value } : r)));
    push("Estado actualizado");
  }

  async function saveNotes() {
    if (!detail) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) return push("No se ha podido guardar", "error");
      push("Notas guardadas");
      setRows((rs) => rs.map((r) => (r.id === detail.id ? { ...r, notes } : r)));
      setDetail({ ...detail, notes });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido eliminar", "error");
    push("Presupuesto eliminado");
    load();
  }

  return (
    <>
      <PageHeader
        title="Presupuestos"
        description="Todas las estimaciones generadas desde el creador de presupuestos."
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
                placeholder="Buscar por referencia o cliente..."
                className="field w-full py-2 pl-9 text-sm sm:w-72"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="field w-full py-2 text-sm sm:w-40"
            >
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <a href="/api/admin/export?type=quotes" className="btn-secondary btn-sm">
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
            icon="file"
            title={query || status ? "Sin resultados" : "Todavía no hay presupuestos"}
            description="Se crean automáticamente cuando alguien completa el configurador de la web."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Referencia</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Proyecto</th>
                    <th className="px-4 py-3 font-semibold">Importe</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((q) => (
                    <tr key={q.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDetail(q);
                            setNotes(q.notes || "");
                          }}
                          className="font-mono text-xs font-semibold text-navy-900 hover:text-brand-600"
                        >
                          {q.public_id}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">
                          {q.name ? `${q.name} ${q.surname ?? ""}`.trim() : "Sin cliente"}
                        </p>
                        <p className="text-xs text-slate-500">{q.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{q.project_type || "—"}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">
                          {formatMoney(q.price_min)} - {formatMoney(q.price_max)}
                        </p>
                        {q.monthly > 0 && <p className="text-xs text-slate-500">+{formatMoney(q.monthly)}/mes</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(q.created_at)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={q.status}
                          onChange={(e) => updateStatus(q.id, e.target.value)}
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
                            onClick={() => {
                              setDetail(q);
                              setNotes(q.notes || "");
                            }}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                            aria-label="Ver detalle"
                          >
                            <Icon name="eye" size={16} />
                          </button>
                          <ConfirmButton onConfirm={() => remove(q.id)} message="¿Eliminar este presupuesto?" />
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

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Presupuesto ${detail?.public_id ?? ""}`} wide>
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={detail.status} />
              <span className="text-xs text-slate-500">{formatDateTime(detail.created_at)}</span>
            </div>
            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Importe estimado</p>
                <p className="mt-1 font-display text-xl font-bold text-navy-900">
                  {formatMoney(detail.price_min)} - {formatMoney(detail.price_max)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Recurrente</p>
                <p className="mt-1 font-display text-xl font-bold text-navy-900">
                  {detail.monthly > 0 ? `${formatMoney(detail.monthly)}/mes` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Plazo</p>
                <p className="mt-1 font-display text-xl font-bold text-navy-900">
                  {detail.days_min}-{detail.days_max} días
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-navy-900">Cliente</h5>
              <p className="mt-1 text-sm text-slate-600">
                {detail.name ? `${detail.name} ${detail.surname ?? ""}` : "Sin cliente asociado"}
                {detail.company ? ` · ${detail.company}` : ""}
              </p>
              <p className="text-sm text-slate-500">
                {detail.email} {detail.phone ? `· ${detail.phone}` : ""}
              </p>
            </div>

            <div>
              <h5 className="text-sm font-bold text-navy-900">Opciones seleccionadas</h5>
              <QuoteSummary summary={detail.summary} />
            </div>

            <div>
              <label className="label" htmlFor="quote-notes">
                Notas internas
              </label>
              <textarea
                id="quote-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="field resize-y text-sm"
                placeholder="Anotaciones sobre este presupuesto..."
              />
              <button type="button" onClick={saveNotes} disabled={saving} className="btn-primary btn-sm mt-3">
                {saving ? "Guardando..." : "Guardar notas"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function QuoteSummary({ summary }: { summary: string }) {
  let blocks: { group: string; items: { label: string; priceType: string }[] }[] = [];
  try {
    blocks = JSON.parse(summary || "[]");
  } catch {
    blocks = [];
  }
  if (!blocks.length) return <p className="mt-1 text-sm text-slate-500">Sin detalle disponible.</p>;

  return (
    <dl className="mt-2 divide-y divide-slate-100">
      {blocks.map((b) => (
        <div key={b.group} className="grid gap-1 py-2.5 sm:grid-cols-[200px_1fr] sm:gap-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{b.group}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {b.items.map((i) => (
              <span key={i.label} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {i.label}
                {i.priceType === "monthly" && <span className="text-slate-400">/mes</span>}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
