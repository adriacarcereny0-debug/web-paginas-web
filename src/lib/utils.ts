export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(value: number, currency = "€") {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.round(value))} ${currency}`;
}

export function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z")) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function formatDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z")) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Minimal, safe subset renderer for admin-editable legal texts (no raw HTML). */
export function markdownToBlocks(md: string) {
  return md.split(/\n{2,}/).map((raw) => {
    const block = raw.trim();
    if (block.startsWith("## ")) return { type: "h2" as const, text: block.slice(3) };
    if (block.startsWith("### ")) return { type: "h3" as const, text: block.slice(4) };
    if (block.startsWith("> ")) return { type: "quote" as const, text: block.slice(2) };
    if (/^[-*] /m.test(block) && block.split("\n").every((l) => /^[-*] /.test(l.trim())))
      return { type: "ul" as const, items: block.split("\n").map((l) => l.trim().replace(/^[-*] /, "")) };
    return { type: "p" as const, text: block };
  });
}

export function escapeCsv(value: unknown) {
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const head = columns.map((c) => escapeCsv(c.label)).join(";");
  const body = rows.map((r) => columns.map((c) => escapeCsv(r[c.key])).join(";")).join("\n");
  return `﻿${head}\n${body}`;
}
