import { z } from "zod";
import { clearSessionCookie, findUserByEmail, setSessionCookie, verifyPassword, getSession } from "@/lib/auth";
import { emailSchema, fail, ok, readJson, zodErrors } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({ email: emailSchema, password: z.string().min(1, "Introduce tu contraseña").max(200) });

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) return fail(`Demasiados intentos. Espera ${limit.retryAfter}s e inténtalo de nuevo.`, 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Revisa los datos introducidos", 400, zodErrors(parsed.error));

  const user = findUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return fail("Email o contraseña incorrectos", 401);
  }

  await setSessionCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
  return ok({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function DELETE() {
  await clearSessionCookie();
  return ok({ ok: true });
}

export async function GET() {
  const session = await getSession();
  return ok({ user: session });
}
