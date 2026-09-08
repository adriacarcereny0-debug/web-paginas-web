import { getSetting, setSetting } from "@/lib/db";
import { DEFAULTS, type ContentKey } from "@/lib/content";
import { fail, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const KEYS = Object.keys(DEFAULTS) as ContentKey[];

export async function GET(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const key = new URL(req.url).searchParams.get("key") as ContentKey | null;
  if (key) {
    if (!KEYS.includes(key)) return fail("Clave desconocida", 404);
    return ok({ key, value: getSetting(key, DEFAULTS[key]), defaults: DEFAULTS[key] });
  }
  const all: Record<string, unknown> = {};
  for (const k of KEYS) all[k] = getSetting(k, DEFAULTS[k]);
  return ok({ settings: all, defaults: DEFAULTS });
}

export async function PUT(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const body = await readJson(req);
  const key = String(body.key || "") as ContentKey;
  if (!KEYS.includes(key)) return fail("Clave desconocida", 404);
  if (body.value === undefined) return fail("Falta el valor", 400);

  const size = JSON.stringify(body.value).length;
  if (size > 200_000) return fail("El contenido es demasiado grande", 413);

  setSetting(key, body.value);
  return ok({ key, value: getSetting(key, DEFAULTS[key]) });
}

/** Restaura una clave a sus valores por defecto. */
export async function DELETE(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const key = new URL(req.url).searchParams.get("key") as ContentKey | null;
  if (!key || !KEYS.includes(key)) return fail("Clave desconocida", 404);
  setSetting(key, DEFAULTS[key]);
  return ok({ key, value: DEFAULTS[key] });
}
