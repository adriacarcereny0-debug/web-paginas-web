import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { getDb } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  const rows = q
    ? getDb()
        .prepare("SELECT * FROM media WHERE original_name LIKE ? OR alt LIKE ? ORDER BY created_at DESC LIMIT 200")
        .all(`%${q}%`, `%${q}%`)
    : getDb().prepare("SELECT * FROM media ORDER BY created_at DESC LIMIT 200").all();
  return ok({ rows });
}

export async function POST(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("No se ha recibido ningún archivo", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail("No se ha recibido ningún archivo", 400);
  if (file.size > MAX_BYTES) return fail("El archivo supera el límite de 8 MB", 413);
  if (!ALLOWED.includes(file.type)) return fail("Formato no permitido. Usa JPG, PNG, WebP, AVIF, SVG o ICO.", 415);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomBytes(8).toString("hex");
  const base = (file.name || "imagen")
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "imagen";

  let filename: string;
  let output: Buffer = buffer;
  let width = 0;
  let height = 0;
  const raster = !["image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"].includes(file.type);

  if (raster) {
    // Optimización automática: redimensiona a un máximo razonable y convierte a WebP.
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const meta = await image.metadata();
    const resized = meta.width && meta.width > 1920 ? image.resize({ width: 1920, withoutEnlargement: true }) : image;
    output = await resized.webp({ quality: 82 }).toBuffer();
    const outMeta = await sharp(output).metadata();
    width = outMeta.width || 0;
    height = outMeta.height || 0;
    filename = `${base}-${id}.webp`;
  } else {
    const ext = file.type === "image/svg+xml" ? "svg" : "ico";
    filename = `${base}-${id}.${ext}`;
  }

  await fs.writeFile(path.join(UPLOAD_DIR, filename), output);

  const url = `/uploads/${filename}`;
  const info = getDb()
    .prepare(
      "INSERT INTO media (filename, original_name, url, mime, size, width, height, alt) VALUES (?,?,?,?,?,?,?,?)",
    )
    .run(filename, file.name.slice(0, 160), url, raster ? "image/webp" : file.type, output.length, width, height, "");

  const row = getDb().prepare("SELECT * FROM media WHERE id = ?").get(info.lastInsertRowid);
  return ok({ row }, { status: 201 });
}
