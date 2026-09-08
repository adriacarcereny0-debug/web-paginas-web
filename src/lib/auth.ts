import crypto from "node:crypto";
import { cookies } from "next/headers";
import { queryOne } from "./db";
import { hashPassword, normalizePassword, verifyPassword } from "./password";

export { hashPassword, normalizePassword, verifyPassword };

const COOKIE = "nova_session";
const MAX_AGE = 60 * 60 * 8; // 8h

export type SessionUser = { id: number; email: string; name: string; role: string };

let cachedSecret: string | null = null;

/**
 * Clave con la que se firma la cookie de sesión.
 *
 * Lo recomendable es definir AUTH_SECRET. Si no está, en lugar de dejar el panel
 * inaccesible se deriva una clave estable a partir de la cadena de conexión de la
 * base de datos, que ya es un secreto del entorno y no cambia entre despliegues
 * (así las sesiones abiertas siguen siendo válidas). Nunca se usa un valor
 * predecible desde fuera.
 */
function secret(): string {
  if (cachedSecret) return cachedSecret;

  const configured = process.env.AUTH_SECRET;
  if (configured && configured.length >= 16) {
    cachedSecret = configured;
    return cachedSecret;
  }

  const derivedFrom =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_POSTGRES_URL;

  if (derivedFrom) {
    console.warn(
      "[auth] AUTH_SECRET no está configurado: se usa una clave derivada de DATABASE_URL. " +
        "Define AUTH_SECRET en las variables de entorno para poder rotarla de forma independiente.",
    );
    cachedSecret = crypto.createHash("sha256").update(`nova-session-v1:${derivedFrom}`).digest("hex");
    return cachedSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No se puede firmar la sesión: define AUTH_SECRET (o DATABASE_URL) en las variables de entorno.",
    );
  }

  cachedSecret = "dev-only-insecure-secret-change-me";
  return cachedSecret;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(user: SessionUser) {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return { id: data.id, email: data.email, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE, createToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new UnauthorizedError();
  return s;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("No autorizado");
  }
}

export function findUserByEmail(email: string) {
  return queryOne<{ id: number; email: string; name: string; role: string; password_hash: string }>(
    "SELECT * FROM users WHERE email = ?",
    [email.toLowerCase().trim()],
  );
}

export const SESSION_COOKIE = COOKIE;
