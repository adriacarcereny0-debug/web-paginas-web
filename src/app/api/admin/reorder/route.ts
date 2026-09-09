import { transaction } from "@/lib/db";
import { RESOURCES } from "@/lib/resources";
import { fail, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { revalidateResource } from "@/lib/cache";

export const dynamic = "force-dynamic";

/** Reordena registros: { resource, ids: [id1, id2, ...] } */
export async function POST(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const body = await readJson(req);
  const def = RESOURCES[String(body.resource || "")];
  if (!def) return fail("Recurso no encontrado", 404);
  if (!def.fields.some((f) => f.name === "sort_order")) return fail("Este recurso no es ordenable", 400);
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];
  if (!ids.length) return fail("Lista de identificadores vacía", 400);

  await transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.execute(`UPDATE ${def.table} SET sort_order = ? WHERE id = ?`, [index, id]);
    }
  });

  revalidateResource(String(body.resource));
  return ok({ updated: ids.length });
}
