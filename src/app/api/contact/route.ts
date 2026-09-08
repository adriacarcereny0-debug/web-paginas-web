import { z } from "zod";
import { getDb } from "@/lib/db";
import { clean, emailSchema, fail, nameSchema, ok, readJson, zodErrors } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().trim().max(30).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  project_type: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(4000),
  consent: z.union([z.literal("on"), z.literal(true)], {
    errorMap: () => ({ message: "Debes aceptar la política de privacidad" }),
  }),
  website: z.string().max(0).optional().default(""), // honeypot
});

export async function POST(req: Request) {
  const limit = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!limit.ok) return fail("Has enviado demasiados mensajes. Inténtalo de nuevo en unos minutos.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Revisa los datos del formulario", 400, zodErrors(parsed.error));
  const d = parsed.data;
  if (d.website) return fail("Solicitud no válida", 400);

  const db = getDb();
  const email = d.email.toLowerCase();

  db.transaction(() => {
    const lead = db.prepare("SELECT id FROM leads WHERE email = ?").get(email) as { id: number } | undefined;
    let leadId = lead?.id;
    if (!leadId) {
      const info = db
        .prepare(
          `INSERT INTO leads (name, company, email, phone, business_type, source, status)
           VALUES (?,?,?,?,?, 'contacto', 'nuevo')`,
        )
        .run(clean(d.name, 80), clean(d.company, 120), email, clean(d.phone, 30), clean(d.project_type, 120));
      leadId = Number(info.lastInsertRowid);
    }
    db.prepare(
      `INSERT INTO messages (name, email, phone, company, project_type, message, lead_id, status)
       VALUES (?,?,?,?,?,?,?, 'nuevo')`,
    ).run(
      clean(d.name, 80),
      email,
      clean(d.phone, 30),
      clean(d.company, 120),
      clean(d.project_type, 120),
      clean(d.message, 4000),
      leadId,
    );
  })();

  return ok({ received: true });
}
