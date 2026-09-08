"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { Card, EmptyState, PageHeader, StatusBadge } from "./ui";

type Stats = {
  cards: Record<string, number>;
  avgQuote: number;
  pipeline: number;
  byStatus: { status: string; c: number }[];
  daily: { d: string; c: number }[];
  monthly: { m: string; c: number; avg: number }[];
  recentMessages: { id: number; name: string; email: string; message: string; status: string; created_at: string }[];
  recentLeads: { id: number; name: string; surname: string; email: string; company: string; status: string; created_at: string }[];
  recentQuotes: {
    id: number;
    public_id: string;
    price_min: number;
    price_max: number;
    status: string;
    created_at: string;
    name: string;
    surname: string;
  }[];
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then(setStats)
      .catch(() => setError("No hemos podido cargar las estadísticas."));
  }, []);

  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!stats) {
    return (
      <>
        <PageHeader title="Dashboard" description="Resumen de la actividad de tu web." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </>
    );
  }

  const c = stats.cards;
  const cards = [
    { label: "Leads totales", value: c.leads, icon: "users", accent: "bg-brand-50 text-brand-600", href: "/admin/leads" },
    { label: "Leads nuevos", value: c.newLeads, icon: "sparkles", accent: "bg-blue-50 text-blue-600", href: "/admin/leads?status=nuevo" },
    { label: "Clientes", value: c.clients, icon: "briefcase", accent: "bg-emerald-50 text-emerald-600", href: "/admin/clientes" },
    { label: "Presupuestos", value: c.quotes, icon: "file", accent: "bg-violet-50 text-violet-600", href: "/admin/presupuestos" },
    { label: "Pendientes", value: c.pendingQuotes, icon: "clock", accent: "bg-amber-50 text-amber-600", href: "/admin/presupuestos" },
    { label: "Aceptados", value: c.acceptedQuotes, icon: "check", accent: "bg-emerald-50 text-emerald-600", href: "/admin/presupuestos?status=aceptado" },
    { label: "Mensajes sin leer", value: c.newMessages, icon: "inbox", accent: "bg-sky-50 text-sky-600", href: "/admin/mensajes" },
    { label: "Proyectos", value: c.projects, icon: "image", accent: "bg-slate-100 text-slate-600", href: "/admin/portfolio" },
  ];

  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.c));

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen de la actividad de tu web." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${card.accent}`}>
                <Icon name={card.icon} size={19} />
              </span>
              <Icon name="arrow" size={15} className="text-slate-300 transition group-hover:text-brand-500" />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900">{card.value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-navy-900">Leads de los últimos 30 días</h3>
            <span className="text-xs text-slate-500">{stats.daily.reduce((a, b) => a + b.c, 0)} en total</span>
          </div>
          {stats.daily.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Todavía no hay datos suficientes.</p>
          ) : (
            <div className="mt-6 flex h-40 items-end gap-1">
              {stats.daily.map((d) => (
                <div key={d.d} className="group flex h-full flex-1 items-end" title={`${d.d}: ${d.c}`}>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-brand-200 to-brand-500 transition-all group-hover:from-brand-300 group-hover:to-brand-600"
                    style={{ height: `${Math.max(4, (d.c / maxDaily) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-navy-900">Importes</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Presupuesto medio</dt>
                <dd className="font-display text-lg font-bold text-navy-900">{formatMoney(stats.avgQuote)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">En negociación</dt>
                <dd className="font-display text-lg font-bold text-navy-900">{formatMoney(stats.pipeline)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-bold text-navy-900">Leads por estado</h3>
            <ul className="mt-4 space-y-2.5">
              {stats.byStatus.length === 0 && <li className="text-sm text-slate-500">Sin datos.</li>}
              {stats.byStatus.map((s) => {
                const total = stats.byStatus.reduce((a, b) => a + b.c, 0) || 1;
                return (
                  <li key={s.status}>
                    <div className="flex items-center justify-between text-sm">
                      <StatusBadge status={s.status} />
                      <span className="font-semibold text-navy-900">{s.c}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(s.c / total) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <Header title="Últimos leads" href="/admin/leads" />
          {stats.recentLeads.length === 0 ? (
            <EmptyState icon="users" title="Sin leads todavía" description="Aparecerán aquí en cuanto alguien use el configurador." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentLeads.map((l) => (
                <li key={l.id} className="px-5 py-3.5">
                  <Link href={`/admin/leads?open=${l.id}`} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-navy-900">
                        {l.name} {l.surname}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{l.company || l.email}</span>
                    </span>
                    <StatusBadge status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <Header title="Últimos presupuestos" href="/admin/presupuestos" />
          {stats.recentQuotes.length === 0 ? (
            <EmptyState icon="file" title="Sin presupuestos" description="Los presupuestos creados aparecerán aquí." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentQuotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-navy-900">
                      {q.name ? `${q.name} ${q.surname}` : q.public_id}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatMoney(q.price_min)} - {formatMoney(q.price_max)}
                    </span>
                  </span>
                  <StatusBadge status={q.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <Header title="Mensajes recientes" href="/admin/mensajes" />
          {stats.recentMessages.length === 0 ? (
            <EmptyState icon="inbox" title="Sin mensajes" description="Los mensajes del formulario aparecerán aquí." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentMessages.map((m) => (
                <li key={m.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-navy-900">{m.name}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{m.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(m.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Header({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
      <Link href={href} className="text-xs font-semibold text-brand-600 hover:underline">
        Ver todo
      </Link>
    </div>
  );
}
