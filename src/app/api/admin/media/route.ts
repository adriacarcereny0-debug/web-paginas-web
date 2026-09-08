import crypto from "node:crypto";
import sharp from "sharp";
import { query, queryOne } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
const LIST_COLUMNS = "id, filename, original_name, url, mime, size, width, height, alt, created_at";

export async function GET(req: Request) {
  if (!(await getSession())) return fail("No autorizado", 401);
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  const rows = q
    ? await query(
        `SELECT ${LIST_COLUMNS} FROM media WHERE original_name ILIKE ? OR alt ILIKE ?
         ORDER BY created_at DESC LIMIT 200`,
        [`%${q}%`, `%${q}%`],
      )
    : await query(`SELECT ${LIST_COLUMNS} FROM media ORDER BY created_at DESC LIMIT 200`);
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const base =
    (file.name || "imagen")
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "imagen";
  const suffix = crypto.randomBytes(6).toString("hex");

  let output: Buffer = buffer;
  let width = 0;
  let height = 0;
  let mime = file.type;
  let filename: string;
  const raster = !["image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"].includes(file.type);

  if (raster) {
    // Optimización automática: redimensiona a un máximo razonable y convierte a WebP.
    try {
      const image = sharp(buffer, { failOn: "none" }).rotate();
      const meta = await image.metadata();
      const resized = meta.width && meta.width > 1920 ? image.resize({ width: 1920, withoutEnlargement: true }) : image;
      output = await resized.webp({ quality: 82 }).toBuffer();
      const outMeta = await sharp(output).metadata();
      width = outMeta.width || 0;
      height = outMeta.height || 0;
      mime = "image/webp";
      filename = `${base}-${suffix}.webp`;
    } catch {
      return fail("No hemos podido procesar la imagen. Prueba con otro archivo.", 400);
    }
  } else {
    filename = `${base}-${suffix}.${file.type === "image/svg+xml" ? "svg" : "ico"}`;
  }

  const created = await queryOne<{ id: number }>(
    `INSERT INTO media (filename, original_name, url, mime, size, width, height, alt, data)
     VALUES (?,?,'',?,?,?,?,'',?) RETURNING id`,
    [filename, file.name.slice(0, 160), mime, output.length, width, height, output],
  );

  const url = `/api/media/${created!.id}/${filename}`;
  const row = await queryOne(`UPDATE media SET url = ? WHERE id = ? RETURNING ${LIST_COLUMNS}`, [url, created!.id]);

  return ok({ row }, { status: 201 });
}
