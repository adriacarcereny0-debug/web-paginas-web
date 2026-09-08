import { queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Sirve las imágenes de la biblioteca. Se cachean de forma indefinida: la URL incluye un id único. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; name: string }> }) {
  const { id } = await params;
  const mediaId = Number(id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) return new Response("No encontrado", { status: 404 });

  const row = await queryOne<{ data: Buffer | null; mime: string; filename: string }>(
    "SELECT data, mime, filename FROM media WHERE id = ?",
    [mediaId],
  );
  if (!row?.data) return new Response("No encontrado", { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime || "application/octet-stream",
      "Content-Length": String(row.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${row.filename.replace(/[^\w.-]/g, "_")}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
