import { execute, queryOne } from "@/lib/db";
import { clean, fail, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return fail("No autorizado", 401);
  const { id } = await params;
  const body = await readJson(req);
  const text = clean(body.body, 3000);
  if (text.length < 2) return fail("La nota está vacía", 400, { body: "Escribe una nota" });

  const lead = await queryOne("SELECT id FROM leads WHERE id = ?", [Number(id)]);
  if (!lead) return fail("Lead no encontrado", 404);

  const row = await queryOne(
    "INSERT INTO lead_notes (lead_id, body, author) VALUES (?,?,?) RETURNING *",
    [Number(id), text, session.name || session.email],
  );
  return ok({ row }, { status: 201 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { id } = await params;
  const noteId = Number(new URL(req.url).searchParams.get("noteId"));
  if (!noteId) return fail("Falta el identificador de la nota", 400);
  const changes = await execute("DELETE FROM lead_notes WHERE id = ? AND lead_id = ?", [noteId, Number(id)]);
  if (!changes) return fail("Nota no encontrada", 404);
  return ok({ deleted: true });
}
