import { query, queryOne } from "@/lib/db";
import { RESOURCES, coerce } from "@/lib/resources";
import { fail, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { revalidateResource } from "@/lib/cache";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def) return fail("Recurso no encontrado", 404);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const perPage = Math.min(200, Math.max(5, Number(url.searchParams.get("perPage")) || 25));
  const sortParam = url.searchParams.get("sort") || "";
  const dir = url.searchParams.get("dir") === "asc" ? "ASC" : "DESC";

  const where: string[] = [];
  const args: unknown[] = [];

  if (q && def.searchable.length) {
    where.push(`(${def.searchable.map((c) => `${c} ILIKE ?`).join(" OR ")})`);
    def.searchable.forEach(() => args.push(`%${q}%`));
  }
  for (const key of def.filterable) {
    const value = url.searchParams.get(key);
    if (value !== null && value !== "") {
      where.push(`${key}::text = ?`);
      args.push(value);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = def.sortable.includes(sortParam) ? `${sortParam} ${dir}` : def.defaultOrder;
  const columns = def.selectColumns ? def.selectColumns.join(", ") : "*";

  const totalRow = await queryOne<{ c: number }>(`SELECT COUNT(*)::int AS c FROM ${def.table} ${whereSql}`, args);
  const total = totalRow?.c ?? 0;
  const rows = await query(
    `SELECT ${columns} FROM ${def.table} ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
    [...args, perPage, (page - 1) * perPage],
  );

  return ok({ rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) });
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { resource } = await params;
  const def = RESOURCES[resource];
  if (!def) return fail("Recurso no encontrado", 404);
  if (!def.allowCreate) return fail("Este recurso no permite crear registros", 405);

  const body = await readJson(req);
  const cols: string[] = [];
  const vals: unknown[] = [];
  const missing: Record<string, string> = {};

  for (const field of def.fields) {
    const provided = Object.prototype.hasOwnProperty.call(body, field.name);
    const value = coerce(field, provided ? body[field.name] : field.default);
    if (field.required && (value === "" || value === null || value === undefined)) {
      missing[field.name] = "Campo obligatorio";
      continue;
    }
    cols.push(field.name);
    vals.push(value);
  }
  if (Object.keys(missing).length) return fail("Faltan campos obligatorios", 400, missing);

  try {
    const row = await queryOne(
      `INSERT INTO ${def.table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) RETURNING *`,
      vals,
    );
    revalidateResource(resource);
    return ok({ row }, { status: 201 });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "No se ha podido crear el registro", 400);
  }
}
