import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSession, hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { emailSchema, fail, ok, readJson, zodErrors } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre").max(80),
  email: emailSchema,
  currentPassword: z.string().max(200).optional().default(""),
  newPassword: z.string().max(200).optional().default(""),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return fail("No autorizado", 401);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Revisa los datos", 400, zodErrors(parsed.error));
  const { name, email, currentPassword, newPassword } = parsed.data;

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.id) as
    | { id: number; password_hash: string }
    | undefined;
  if (!user) return fail("Usuario no encontrado", 404);

  if (newPassword) {
    if (newPassword.length < 8) return fail("La contraseña debe tener al menos 8 caracteres", 400, { newPassword: "Mínimo 8 caracteres" });
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return fail("La contraseña actual no es correcta", 400, { currentPassword: "Contraseña incorrecta" });
    }
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), user.id);
  }

  try {
    db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email.toLowerCase(), user.id);
  } catch {
    return fail("Ese email ya está en uso", 400, { email: "Email no disponible" });
  }

  await setSessionCookie({ id: session.id, email: email.toLowerCase(), name, role: session.role });
  return ok({ updated: true });
}
