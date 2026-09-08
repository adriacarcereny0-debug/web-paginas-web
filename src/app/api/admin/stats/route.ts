import { query, queryOne } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) return fail("No autorizado", 401);

  const count = async (sql: string) => (await queryOne<{ c: number }>(sql))?.c ?? 0;

  const [
    leads,
    newLeads,
    clients,
    quotes,
    pendingQuotes,
    acceptedQuotes,
    messages,
    newMessages,
    projects,
  ] = await Promise.all([
    count("SELECT COUNT(*)::int AS c FROM leads"),
    count("SELECT COUNT(*)::int AS c FROM leads WHERE status = 'nuevo'"),
    count("SELECT COUNT(*)::int AS c FROM leads WHERE status = 'cliente'"),
    count("SELECT COUNT(*)::int AS c FROM quotes"),
    count("SELECT COUNT(*)::int AS c FROM quotes WHERE status IN ('borrador','enviado')"),
    count("SELECT COUNT(*)::int AS c FROM quotes WHERE status = 'aceptado'"),
    count("SELECT COUNT(*)::int AS c FROM messages"),
    count("SELECT COUNT(*)::int AS c FROM messages WHERE status = 'nuevo'"),
    count("SELECT COUNT(*)::int AS c FROM projects"),
  ]);

  const [avgRow, pipelineRow, byStatus, daily, monthly, recentMessages, recentLeads, recentQuotes] = await Promise.all([
    queryOne<{ v: number | null }>("SELECT AVG((price_min + price_max) / 2.0)::float8 AS v FROM quotes"),
    queryOne<{ v: number | null }>(
      "SELECT SUM((price_min + price_max) / 2.0)::float8 AS v FROM quotes WHERE status IN ('enviado','contactado')",
    ),
    query<{ status: string; c: number }>("SELECT status, COUNT(*)::int AS c FROM leads GROUP BY status"),
    query<{ d: string; c: number }>(
      `SELECT to_char(created_at, 'YYYY-MM-DD') AS d, COUNT(*)::int AS c FROM leads
       WHERE created_at >= now() - interval '29 days' GROUP BY d ORDER BY d`,
    ),
    query<{ m: string; c: number; avg: number }>(
      `SELECT to_char(created_at, 'YYYY-MM') AS m, COUNT(*)::int AS c,
              AVG((price_min + price_max)/2.0)::float8 AS avg
       FROM quotes WHERE created_at >= now() - interval '6 months' GROUP BY m ORDER BY m`,
    ),
    query("SELECT id, name, email, message, status, created_at FROM messages ORDER BY created_at DESC LIMIT 5"),
    query("SELECT id, name, surname, email, company, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5"),
    query(
      `SELECT q.id, q.public_id, q.price_min, q.price_max, q.status, q.created_at, l.name, l.surname
       FROM quotes q LEFT JOIN leads l ON l.id = q.lead_id ORDER BY q.created_at DESC LIMIT 5`,
    ),
  ]);

  return ok({
    cards: { leads, newLeads, clients, quotes, pendingQuotes, acceptedQuotes, messages, newMessages, projects },
    avgQuote: Math.round(avgRow?.v || 0),
    pipeline: Math.round(pipelineRow?.v || 0),
    byStatus,
    daily,
    monthly,
    recentMessages,
    recentLeads,
    recentQuotes,
  });
}
