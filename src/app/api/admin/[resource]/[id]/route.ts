import { execute, queryOne } from "@/lib/db";
import { RESOURCES, coerce } from "@/lib/resources";
import { fail, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { resource, id } = await params;
  const def = RESOURCES[resource];
  if (!def) return fail("Recurso no encontrado", 404);
  const columns = def.selectColumns ? def.selectColumns.join(", ") : "*";
  const row = await queryOne(`SELECT ${columns} FROM ${def.table} WHERE id = ?`, [Number(id)]);
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

  if (["leads", "quotes"].includes(def.table)) sets.push("updated_at = now()");
  const columns = def.selectColumns ? def.selectColumns.join(", ") : "*";

  try {
    const row = await queryOne(
      `UPDATE ${def.table} SET ${sets.join(", ")} WHERE id = ? RETURNING ${columns}`,
      [...vals, Number(id)],
    );
    if (!row) return fail("Registro no encontrado", 404);
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

  const changes = await execute(`DELETE FROM ${def.table} WHERE id = ?`, [Number(id)]);
  if (changes === 0) return fail("Registro no encontrado", 404);
  return ok({ deleted: true });
}
