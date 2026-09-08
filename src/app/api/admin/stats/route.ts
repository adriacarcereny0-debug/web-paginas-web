import { getDb } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) return fail("No autorizado", 401);
  const db = getDb();
  const one = <T>(sql: string, ...args: unknown[]) => db.prepare(sql).get(...args) as T;

  const leads = one<{ c: number }>("SELECT COUNT(*) c FROM leads").c;
  const newLeads = one<{ c: number }>("SELECT COUNT(*) c FROM leads WHERE status = 'nuevo'").c;
  const clients = one<{ c: number }>("SELECT COUNT(*) c FROM leads WHERE status = 'cliente'").c;
  const quotes = one<{ c: number }>("SELECT COUNT(*) c FROM quotes").c;
  const pendingQuotes = one<{ c: number }>("SELECT COUNT(*) c FROM quotes WHERE status IN ('borrador','enviado')").c;
  const acceptedQuotes = one<{ c: number }>("SELECT COUNT(*) c FROM quotes WHERE status = 'aceptado'").c;
  const messages = one<{ c: number }>("SELECT COUNT(*) c FROM messages").c;
  const newMessages = one<{ c: number }>("SELECT COUNT(*) c FROM messages WHERE status = 'nuevo'").c;
  const projects = one<{ c: number }>("SELECT COUNT(*) c FROM projects").c;
  const avg = one<{ v: number | null }>("SELECT AVG((price_min + price_max) / 2.0) v FROM quotes").v || 0;
  const pipeline =
    one<{ v: number | null }>(
      "SELECT SUM((price_min + price_max) / 2.0) v FROM quotes WHERE status IN ('enviado','contactado')",
    ).v || 0;

  const byStatus = db
    .prepare("SELECT status, COUNT(*) c FROM leads GROUP BY status")
    .all() as { status: string; c: number }[];

  const daily = db
    .prepare(
      `SELECT date(created_at) d, COUNT(*) c FROM leads
       WHERE created_at >= datetime('now', '-29 days') GROUP BY d ORDER BY d`,
    )
    .all() as { d: string; c: number }[];

  const monthly = db
    .prepare(
      `SELECT strftime('%Y-%m', created_at) m, COUNT(*) c, AVG((price_min + price_max)/2.0) avg
       FROM quotes WHERE created_at >= datetime('now', '-6 months') GROUP BY m ORDER BY m`,
    )
    .all() as { m: string; c: number; avg: number }[];

  const recentMessages = db
    .prepare("SELECT id, name, email, message, status, created_at FROM messages ORDER BY created_at DESC LIMIT 5")
    .all();

  const recentLeads = db
    .prepare("SELECT id, name, surname, email, company, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5")
    .all();

  const recentQuotes = db
    .prepare(
      `SELECT q.id, q.public_id, q.price_min, q.price_max, q.status, q.created_at, l.name, l.surname
       FROM quotes q LEFT JOIN leads l ON l.id = q.lead_id ORDER BY q.created_at DESC LIMIT 5`,
    )
    .all();

  return ok({
    cards: { leads, newLeads, clients, quotes, pendingQuotes, acceptedQuotes, messages, newMessages, projects },
    avgQuote: Math.round(avg),
    pipeline: Math.round(pipeline),
    byStatus,
    daily,
    monthly,
    recentMessages,
    recentLeads,
    recentQuotes,
  });
}
