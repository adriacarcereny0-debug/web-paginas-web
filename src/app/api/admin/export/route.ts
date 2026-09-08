import { getDb } from "@/lib/db";
import { fail } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { toCsv } from "@/lib/utils";

export const dynamic = "force-dynamic";

const EXPORTS: Record<string, { sql: string; columns: { key: string; label: string }[]; filename: string }> = {
  leads: {
    sql: `SELECT l.id, l.name, l.surname, l.company, l.email, l.phone, l.city, l.business_type, l.source, l.status,
                 l.created_at,
                 (SELECT COUNT(*) FROM quotes q WHERE q.lead_id = l.id) quotes,
                 (SELECT MAX((q.price_min + q.price_max)/2) FROM quotes q WHERE q.lead_id = l.id) estimated
          FROM leads l ORDER BY l.created_at DESC`,
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "surname", label: "Apellidos" },
      { key: "company", label: "Empresa" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Teléfono" },
      { key: "city", label: "Ciudad" },
      { key: "business_type", label: "Tipo de negocio" },
      { key: "source", label: "Origen" },
      { key: "status", label: "Estado" },
      { key: "quotes", label: "Presupuestos" },
      { key: "estimated", label: "Importe estimado" },
      { key: "created_at", label: "Fecha" },
    ],
    filename: "leads",
  },
  quotes: {
    sql: `SELECT q.public_id, l.name, l.surname, l.email, l.company, q.project_type, q.price_min, q.price_max,
                 q.monthly, q.days_min, q.days_max, q.status, q.created_at
          FROM quotes q LEFT JOIN leads l ON l.id = q.lead_id ORDER BY q.created_at DESC`,
    columns: [
      { key: "public_id", label: "Referencia" },
      { key: "name", label: "Nombre" },
      { key: "surname", label: "Apellidos" },
      { key: "email", label: "Email" },
      { key: "company", label: "Empresa" },
      { key: "project_type", label: "Tipo de proyecto" },
      { key: "price_min", label: "Precio mínimo" },
      { key: "price_max", label: "Precio máximo" },
      { key: "monthly", label: "Mensual" },
      { key: "days_min", label: "Días mín." },
      { key: "days_max", label: "Días máx." },
      { key: "status", label: "Estado" },
      { key: "created_at", label: "Fecha" },
    ],
    filename: "presupuestos",
  },
  messages: {
    sql: "SELECT id, name, email, phone, company, project_type, message, status, created_at FROM messages ORDER BY created_at DESC",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Teléfono" },
      { key: "company", label: "Empresa" },
      { key: "project_type", label: "Tipo de proyecto" },
      { key: "message", label: "Mensaje" },
      { key: "status", label: "Estado" },
      { key: "created_at", label: "Fecha" },
    ],
    filename: "mensajes",
  },
};

export async function GET(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const type = new URL(req.url).searchParams.get("type") || "leads";
  const def = EXPORTS[type];
  if (!def) return fail("Exportación no disponible", 404);

  const rows = getDb().prepare(def.sql).all() as Record<string, unknown>[];
  const csv = toCsv(rows, def.columns);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${def.filename}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
