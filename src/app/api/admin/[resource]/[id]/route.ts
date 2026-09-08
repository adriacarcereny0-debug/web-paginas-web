import { getDb } from "@/lib/db";
import { RESOURCES, coerce } from "@/lib/resources";
import { fail, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) return fail("Recurso no encontrado", 404);
  const row = getDb().prepare(`SELECT * FROM ${def.table} WHERE id = ?`).get(Number(id));
  if (!row) return fail("Registro no encontrado", 404);
  return ok({ row });
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) return fail("Recurso no encontrado", 404);

  const body = await readJson(req);
  const sets: string[] = [];
  const vals: unknown[] = [];
  const errors: Record<string, string> = {};

  for (const field of def.fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field.name)) continue;
    const value = coerce(field, body[field.name]);
    if (field.required && (value === "" || value === null)) {
      errors[field.name] = "Campo obligatorio";
      continue;
    }
    sets.push(`${field.name} = ?`);
    vals.push(value);
  }
  if (Object.keys(errors).length) return fail("Revisa los campos", 400, errors);
  if (!sets.length) return fail("No hay cambios que guardar", 400);

  const hasUpdatedAt = ["leads", "quotes"].includes(def.table);
  if (hasUpdatedAt) sets.push("updated_at = datetime('now')");

  try {
    const info = getDb()
      .prepare(`UPDATE ${def.table} SET ${sets.join(", ")} WHERE id = ?`)
      .run(...vals, Number(id));
    if (info.changes === 0) return fail("Registro no encontrado", 404);
    const row = getDb().prepare(`SELECT * FROM ${def.table} WHERE id = ?`).get(Number(id));
    return ok({ row });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "No se ha podido guardar", 400);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) return fail("Recurso no encontrado", 404);
  if (!def.allowDelete) return fail("Este recurso no permite eliminar registros", 405);

  if (resource === "media") {
    const row = getDb().prepare("SELECT filename FROM media WHERE id = ?").get(Number(id)) as
      | { filename: string }
      | undefined;
    if (row?.filename) {
      const safe = path.basename(row.filename);
      try {
        fs.unlinkSync(path.join(process.cwd(), "public", "uploads", safe));
      } catch {
        /* el fichero ya no existe */
      }
    }
  }

  const info = getDb().prepare(`DELETE FROM ${def.table} WHERE id = ?`).run(Number(id));
  if (info.changes === 0) return fail("Registro no encontrado", 404);
  return ok({ deleted: true });
}
