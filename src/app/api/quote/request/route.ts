import { z } from "zod";
import { queryOne, transaction } from "@/lib/db";
import { clean, fail, ok, readJson, zodErrors } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  publicId: z.string().trim().min(4).max(40),
  message: z.string().trim().max(2000).optional().default(""),
});

/** El usuario confirma que quiere este presupuesto: pasa a "enviado" y genera un mensaje en el panel. */
export async function POST(req: Request) {
  const limit = rateLimit(`quote-request:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!limit.ok) return fail("Demasiadas solicitudes. Inténtalo más tarde.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Solicitud no válida", 400, zodErrors(parsed.error));

  const quote = await queryOne<{
    id: number;
    lead_id: number | null;
    public_id: string;
    price_min: number;
    price_max: number;
    project_type: string;
  }>("SELECT * FROM quotes WHERE public_id = ?", [parsed.data.publicId]);
  if (!quote) return fail("No hemos encontrado ese presupuesto", 404);

  const lead = quote.lead_id
    ? await queryOne<{ name: string; surname: string; email: string; phone: string; company: string }>(
        "SELECT * FROM leads WHERE id = ?",
        [quote.lead_id],
      )
    : undefined;

  await transaction(async (tx) => {
    await tx.execute("UPDATE quotes SET status = 'enviado', updated_at = now() WHERE id = ?", [quote.id]);
    if (lead) {
      await tx.execute(
        `INSERT INTO messages (name, email, phone, company, project_type, message, lead_id, status)
         VALUES (?,?,?,?,?,?,?, 'nuevo')`,
        [
          `${lead.name} ${lead.surname}`.trim(),
          lead.email,
          lead.phone,
          lead.company,
          quote.project_type,
          clean(parsed.data.message, 2000) ||
            `Solicitud del presupuesto ${quote.public_id} (${quote.price_min} - ${quote.price_max} €).`,
          quote.lead_id,
        ],
      );
    }
  });

  return ok({ status: "enviado" });
}
