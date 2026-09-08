import { NextResponse } from "next/server";
import { z } from "zod";

const CONTROL_CHARS = new RegExp("[\\u0000-\\u001f\\u007f]", "g");

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as object, init);
}

export function fail(error: string, status = 400, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ error, fieldErrors }, { status });
}

export function zodErrors(err: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/** Trim + elimina caracteres de control (evita basura almacenada e inyección en cabeceras de email). */
export function clean(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, " ").trim().slice(0, max);
}

export const emailSchema = z
  .string()
  .trim()
  .min(5, "Introduce un email válido")
  .max(160)
  .email("Introduce un email válido");

export const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s.-]{6,}$/, "Introduce un teléfono válido");

export const nameSchema = z.string().trim().min(2, "Indica tu nombre").max(80);

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
