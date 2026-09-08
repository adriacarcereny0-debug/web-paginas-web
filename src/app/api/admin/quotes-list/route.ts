import { query, queryOne } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Listado de presupuestos con los datos del cliente incluidos. */
export async function GET(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  const status = url.searchParams.get("status") || "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const perPage = Math.min(100, Math.max(5, Number(url.searchParams.get("perPage")) || 25));

  const where: string[] = [];
  const args: unknown[] = [];
  if (q) {
    where.push(
      "(q.public_id ILIKE ? OR l.name ILIKE ? OR l.email ILIKE ? OR l.company ILIKE ? OR q.project_type ILIKE ?)",
    );
    for (let i = 0; i < 5; i++) args.push(`%${q}%`);
  }
  if (status) {
    where.push("q.status = ?");
    args.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = await queryOne<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM quotes q LEFT JOIN leads l ON l.id = q.lead_id ${whereSql}`,
    args,
  );
  const rows = await query(
    `SELECT q.*, l.name, l.surname, l.email, l.company, l.phone, l.status AS lead_status
     FROM quotes q LEFT JOIN leads l ON l.id = q.lead_id
     ${whereSql} ORDER BY q.created_at DESC, q.id DESC LIMIT ? OFFSET ?`,
    [...args, perPage, (page - 1) * perPage],
  );

  const total = totalRow?.c ?? 0;
  return ok({ rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) });
}
