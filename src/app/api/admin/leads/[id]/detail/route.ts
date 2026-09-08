import { getDb } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { id } = await params;
  const db = getDb();
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(Number(id));
  if (!lead) return fail("Lead no encontrado", 404);

  return ok({
    lead,
    quotes: db.prepare("SELECT * FROM quotes WHERE lead_id = ? ORDER BY created_at DESC").all(Number(id)),
    messages: db.prepare("SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at DESC").all(Number(id)),
    notes: db.prepare("SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC").all(Number(id)),
  });
}
