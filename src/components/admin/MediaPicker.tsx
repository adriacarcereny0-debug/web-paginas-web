"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "./ui";
import { useToast } from "./Toast";

export type MediaRow = {
  id: number;
  url: string;
  filename: string;
  original_name: string;
  alt: string;
  size: number;
  width: number;
  height: number;
  created_at: string;
};

export function MediaPicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            <Image src={value} alt="" width={96} height={64} className="h-full w-full object-cover" unoptimized />
          ) : (
            <Icon name="image" size={20} className="text-slate-300" />
          )}
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn-secondary btn-sm">
            <Icon name="image" size={15} /> Elegir imagen
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="btn-ghost btn-sm text-slate-500">
              Quitar
            </button>
          )}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="o pega una URL"
            className="field w-full py-2 text-xs"
          />
        </div>
      </div>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setOpen(false);
        }}
      />
    </>
  );
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      setRows(json.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
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
        setRows((r) => [json.row, ...r]);
      }
      push("Imágenes subidas");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Biblioteca de imágenes" wide>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
        <Icon name="image" size={24} className="text-slate-400" />
        <span className="mt-2 text-sm font-semibold text-navy-900">
          {uploading ? "Subiendo..." : "Haz clic para subir imágenes"}
        </span>
        <span className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, AVIF o SVG · máximo 8 MB · se optimizan solas</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => upload(e.target.files)}
        />
      </label>

      <div className="mt-5 max-h-[45vh] overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Todavía no hay imágenes en la biblioteca.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row.url)}
                className="group overflow-hidden rounded-lg border border-slate-200 transition hover:border-brand-500 hover:shadow-soft"
              >
                <span className="block aspect-[4/3] overflow-hidden bg-slate-50">
                  <Image
                    src={row.url}
                    alt={row.alt || row.original_name}
                    width={200}
                    height={150}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    unoptimized
                  />
                </span>
                <span className="block truncate px-2 py-1.5 text-[11px] text-slate-500">{row.original_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
