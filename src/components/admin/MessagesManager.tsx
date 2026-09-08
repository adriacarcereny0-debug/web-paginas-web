"use client";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/utils";
import { Card, ConfirmButton, EmptyState, Modal, PageHeader, Pagination, STATUS_LABELS, StatusBadge, TableSkeleton } from "./ui";
import { useToast } from "./Toast";

type Message = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  project_type: string;
  message: string;
  status: string;
  created_at: string;
};

const STATUSES = ["nuevo", "leido", "respondido", "archivado"];

export function MessagesManager() {
  const { push } = useToast();
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [detail, setDetail] = useState<Message | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: "25" });
      if (query) qs.set("q", query);
      if (status) qs.set("status", status);
      const res = await fetch(`/api/admin/messages?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRows(json.rows);
      setMeta({ pages: json.pages, total: json.total });
    } catch {
      push("No hemos podido cargar los mensajes", "error");
    } finally {
      setLoading(false);
    }
  }, [page, query, status, push]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  async function setMessageStatus(id: number, value: string) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    if (!res.ok) return push("No se ha podido actualizar", "error");
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: value } : r)));
    setDetail((d) => (d && d.id === id ? { ...d, status: value } : d));
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido eliminar", "error");
    push("Mensaje eliminado");
    setDetail(null);
    load();
  }

  function open(message: Message) {
    setDetail(message);
    if (message.status === "nuevo") setMessageStatus(message.id, "leido");
  }

  return (
    <>
      <PageHeader
        title="Mensajes"
        description="Mensajes recibidos desde el formulario de contacto y solicitudes de presupuesto."
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
                placeholder="Buscar..."
                className="field w-full py-2 pl-9 text-sm sm:w-64"
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
            <a href="/api/admin/export?type=messages" className="btn-secondary btn-sm">
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
            icon="inbox"
            title={query || status ? "Sin resultados" : "No hay mensajes"}
            description="Los mensajes del formulario de contacto aparecerán aquí."
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {rows.map((m) => (
                <li key={m.id} className={`flex gap-4 px-4 py-4 transition hover:bg-slate-50/70 ${m.status === "nuevo" ? "bg-blue-50/30" : ""}`}>
                  <button type="button" onClick={() => open(m)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy-900">{m.name}</span>
                      <StatusBadge status={m.status} />
                      {m.project_type && (
                        <span className="badge bg-slate-100 text-slate-600">{m.project_type}</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{m.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {m.email} · {formatDateTime(m.created_at)}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-start gap-1">
                    <a
                      href={`mailto:${m.email}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                      aria-label="Responder por email"
                      title="Responder por email"
                    >
                      <Icon name="mail" size={16} />
                    </a>
                    <ConfirmButton onConfirm={() => remove(m.id)} message="¿Eliminar este mensaje?" />
                  </div>
                </li>
              ))}
            </ul>
            <Pagination page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Mensaje" wide>
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-bold text-navy-900">{detail.name}</h4>
                <p className="text-sm text-slate-500">
                  {detail.email}
                  {detail.phone ? ` · ${detail.phone}` : ""}
                  {detail.company ? ` · ${detail.company}` : ""}
                </p>
              </div>
              <select
                value={detail.status}
                onChange={(e) => setMessageStatus(detail.id, e.target.value)}
                className="field w-auto py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {detail.project_type && (
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-navy-900">Tipo de proyecto:</span> {detail.project_type}
              </p>
            )}

            <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {detail.message}
            </p>
            <p className="text-xs text-slate-400">Recibido el {formatDateTime(detail.created_at)}</p>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <a href={`mailto:${detail.email}?subject=Re: tu consulta`} className="btn-primary btn-sm">
                <Icon name="mail" size={15} /> Responder por email
              </a>
              {detail.phone && (
                <a href={`tel:${detail.phone}`} className="btn-secondary btn-sm">
                  <Icon name="phone" size={15} /> Llamar
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
