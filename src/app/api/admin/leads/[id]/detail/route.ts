import { query, queryOne } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const { id } = await params;
  const leadId = Number(id);

  const lead = await queryOne("SELECT * FROM leads WHERE id = ?", [leadId]);
  if (!lead) return fail("Lead no encontrado", 404);

  const [quotes, messages, notes] = await Promise.all([
    query("SELECT * FROM quotes WHERE lead_id = ? ORDER BY created_at DESC", [leadId]),
    query("SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at DESC", [leadId]),
    query("SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC", [leadId]),
  ]);

  return ok({ lead, quotes, messages, notes });
}
