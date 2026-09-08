import crypto from "node:crypto";
import { z } from "zod";
import { transaction } from "@/lib/db";
import { computeQuote, getCalculatorConfig, type Selections } from "@/lib/pricing";
import { clean, emailSchema, fail, nameSchema, ok, phoneSchema, readJson, zodErrors } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: nameSchema,
  surname: z.string().trim().max(80).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  email: emailSchema,
  phone: phoneSchema,
  city: z.string().trim().max(120).optional().default(""),
  businessType: z.string().trim().max(120).optional().default(""),
  consent: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la política de privacidad" }) }),
  website: z.string().max(0).optional().default(""), // honeypot
  selections: z.record(z.string(), z.array(z.number().int().positive()).max(40)),
});

export async function POST(req: Request) {
  const limit = rateLimit(`quote:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!limit.ok) return fail("Demasiadas solicitudes. Vuelve a intentarlo en unos minutos.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Revisa los datos del formulario", 400, zodErrors(parsed.error));
  const data = parsed.data;
  if (data.website) return fail("Solicitud no válida", 400);

  const groups = await getCalculatorConfig();
  const result = await computeQuote(data.selections as Selections, groups);
  if (!result.valid) return fail(result.errors[0] || "Faltan opciones por seleccionar", 400);

  const email = data.email.toLowerCase();
  const publicId = `P-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  await transaction(async (tx) => {
    const existing = await tx.queryOne<{ id: number }>("SELECT id FROM leads WHERE email = ?", [email]);
    let leadId: number;
    if (existing) {
      leadId = existing.id;
      await tx.execute(
        // Solo se sobrescriben los campos que llegan con valor: un segundo
        // presupuesto no debe borrar los datos que ya teníamos del lead.
        `UPDATE leads SET
           name = ?,
           surname = COALESCE(NULLIF(?, ''), surname),
           company = COALESCE(NULLIF(?, ''), company),
           phone = COALESCE(NULLIF(?, ''), phone),
           city = COALESCE(NULLIF(?, ''), city),
           business_type = COALESCE(NULLIF(?, ''), business_type),
           updated_at = now()
         WHERE id = ?`,
        [
          clean(data.name, 80),
          clean(data.surname, 80),
          clean(data.company, 120),
          clean(data.phone, 30),
          clean(data.city, 120),
          clean(data.businessType, 120),
          leadId,
        ],
      );
    } else {
      const created = await tx.queryOne<{ id: number }>(
        `INSERT INTO leads (name, surname, company, email, phone, city, business_type, source, status)
         VALUES (?,?,?,?,?,?,?, 'calculadora', 'nuevo') RETURNING id`,
        [
          clean(data.name, 80),
          clean(data.surname, 80),
          clean(data.company, 120),
          email,
          clean(data.phone, 30),
          clean(data.city, 120),
          clean(data.businessType, 120),
        ],
      );
      leadId = created!.id;
    }

    await tx.execute(
      `INSERT INTO quotes (public_id, lead_id, selections, summary, project_type, price_min, price_max, monthly,
        days_min, days_max, status) VALUES (?,?,?,?,?,?,?,?,?,?, 'borrador')`,
      [
        publicId,
        leadId,
        JSON.stringify(data.selections),
        JSON.stringify(result.summary),
        result.projectType,
        result.priceMin,
        result.priceMax,
        result.monthly,
        result.daysMin,
        result.daysMax,
      ],
    );
  });

  return ok({
    publicId,
    priceMin: result.priceMin,
    priceMax: result.priceMax,
    monthly: result.monthly,
    daysMin: result.daysMin,
    daysMax: result.daysMax,
    currency: result.currency,
    discount: result.discount,
    summary: result.summary,
    projectType: result.projectType,
  });
}
