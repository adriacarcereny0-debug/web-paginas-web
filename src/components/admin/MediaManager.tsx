"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Card, ConfirmButton, EmptyState, PageHeader } from "./ui";
import { useToast } from "./Toast";
import type { MediaRow } from "./MediaPicker";

export function MediaManager() {
  const { push } = useToast();
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      const json = await res.json();
      setRows(json.rows || []);
    } catch {
      push("No hemos podido cargar la biblioteca", "error");
    } finally {
      setLoading(false);
    }
  }, [query, push]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  async function upload(files: FileList | File[] | null) {
    if (!files || !("length" in files) || files.length === 0) return;
    setUploading(true);
    let okCount = 0;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) {
          push(json.error || `No se ha podido subir ${file.name}`, "error");
          continue;
        }
        okCount += 1;
        setRows((r) => [json.row, ...r]);
      }
      if (okCount) push(`${okCount} imagen(es) subida(s) y optimizada(s)`);
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) return push("No se ha podido eliminar", "error");
    setRows((r) => r.filter((x) => x.id !== id));
    push("Imagen eliminada");
  }

  async function saveAlt(id: number, alt: string) {
    await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
  }

  function copy(url: string) {
    const absolute = `${window.location.origin}${url}`;
    navigator.clipboard?.writeText(absolute).then(
      () => push("Enlace copiado"),
      () => push("No se ha podido copiar", "error"),
    );
  }

  return (
    <>
      <PageHeader
        title="Biblioteca de imágenes"
        description="Sube las imágenes que uses en servicios, portfolio o testimonios. Se optimizan y convierten a WebP automáticamente."
        actions={
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar imagen..."
              className="field w-full py-2 pl-9 text-sm sm:w-64"
            />
          </div>
        }
      />

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50/40"
        }`}
      >
        <Icon name="image" size={26} className="text-slate-400" />
        <span className="mt-3 text-sm font-semibold text-navy-900">
          {uploading ? "Subiendo imágenes..." : "Arrastra imágenes aquí o haz clic para seleccionarlas"}
        </span>
        <span className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, AVIF o SVG · máximo 8 MB por archivo</span>
        <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
      </label>

      <Card className="mt-5">
        {loading ? (
          <div className="grid gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="image"
            title={query ? "Sin resultados" : "La biblioteca está vacía"}
            description="Sube tu primera imagen arrastrándola sobre el recuadro superior."
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((row) => (
              <figure key={row.id} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="aspect-[4/3] bg-slate-50">
                  <Image
                    src={row.url}
                    alt={row.alt || row.original_name}
                    width={320}
                    height={240}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <figcaption className="space-y-2 p-3">
                  <p className="truncate text-xs font-medium text-navy-900" title={row.original_name}>
                    {row.original_name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {row.width}×{row.height} · {(row.size / 1024).toFixed(0)} KB
                  </p>
                  <input
                    defaultValue={row.alt}
                    onBlur={(e) => saveAlt(row.id, e.target.value)}
                    placeholder="Texto alternativo (SEO)"
                    className="field py-1.5 text-xs"
                  />
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => copy(row.url)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
                    >
                      Copiar enlace
                    </button>
                    <ConfirmButton
                      onConfirm={() => remove(row.id)}
                      message="¿Eliminar esta imagen? Dejará de verse allí donde esté usada."
                    />
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
