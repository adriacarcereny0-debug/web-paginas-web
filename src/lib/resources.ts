export type FieldType = "text" | "number" | "bool" | "json" | "select";

export type FieldDef = {
  name: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  options?: string[];
  default?: unknown;
};

export type ResourceDef = {
  table: string;
  fields: FieldDef[];
  searchable: string[];
  filterable: string[];
  sortable: string[];
  defaultOrder: string;
  allowCreate: boolean;
  allowDelete: boolean;
  /** Columnas a devolver. Se usa para no arrastrar los binarios de la tabla media. */
  selectColumns?: string[];
};

const sort = { name: "sort_order", type: "number" as const, default: 0 };
const visible = { name: "visible", type: "bool" as const, default: 1 };

export const RESOURCES: Record<string, ResourceDef> = {
  services: {
    table: "services",
    fields: [
      { name: "title", type: "text", required: true, max: 120 },
      { name: "slug", type: "text", max: 120 },
      { name: "description", type: "text", max: 600 },
      { name: "icon", type: "text", max: 40 },
      { name: "image", type: "text", max: 300 },
      { name: "price_from", type: "number" },
      { name: "price_label", type: "text", max: 60 },
      { name: "features", type: "json" },
      { name: "body", type: "text", max: 6000 },
      { name: "meta_title", type: "text", max: 70 },
      { name: "meta_description", type: "text", max: 170 },
      sort,
      visible,
    ],
    searchable: ["title", "description"],
    filterable: ["visible"],
    sortable: ["sort_order", "title", "price_from", "created_at"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  faqs: {
    table: "faqs",
    fields: [
      { name: "question", type: "text", required: true, max: 300 },
      { name: "answer", type: "text", max: 3000 },
      sort,
      visible,
    ],
    searchable: ["question", "answer"],
    filterable: ["visible"],
    sortable: ["sort_order", "created_at"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  projects: {
    table: "projects",
    fields: [
      { name: "title", type: "text", required: true, max: 160 },
      { name: "description", type: "text", max: 800 },
      { name: "category", type: "text", max: 80 },
      { name: "image", type: "text", max: 300 },
      { name: "tags", type: "json" },
      { name: "url", type: "text", max: 300 },
      { name: "is_demo", type: "bool", default: 0 },
      sort,
      visible,
    ],
    searchable: ["title", "description", "category"],
    filterable: ["visible", "category"],
    sortable: ["sort_order", "title", "created_at"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  testimonials: {
    table: "testimonials",
    fields: [
      { name: "name", type: "text", required: true, max: 120 },
      { name: "company", type: "text", max: 120 },
      { name: "text", type: "text", max: 1500 },
      { name: "photo", type: "text", max: 300 },
      { name: "rating", type: "number", default: 5 },
      { name: "is_demo", type: "bool", default: 0 },
      sort,
      visible,
    ],
    searchable: ["name", "company", "text"],
    filterable: ["visible"],
    sortable: ["sort_order", "name", "created_at"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  reviews: {
    table: "reviews",
    fields: [
      { name: "author", type: "text", required: true, max: 120 },
      { name: "service", type: "text", max: 120 },
      { name: "location", type: "text", max: 120 },
      { name: "text", type: "text", max: 1500 },
      { name: "rating", type: "number", default: 5 },
      { name: "source", type: "text", max: 60 },
      { name: "avatar", type: "text", max: 300 },
      { name: "reviewed_on", type: "text", max: 60 },
      { name: "is_demo", type: "bool", default: 0 },
      { name: "featured", type: "bool", default: 0 },
      sort,
      visible,
    ],
    searchable: ["author", "text", "service", "source"],
    filterable: ["visible", "source", "rating"],
    sortable: ["sort_order", "rating", "created_at", "author"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  calc_groups: {
    table: "calc_groups",
    fields: [
      { name: "calculator", type: "text", max: 40, default: "web" },
      { name: "key", type: "text", required: true, max: 40 },
      { name: "title", type: "text", required: true, max: 200 },
      { name: "subtitle", type: "text", max: 400 },
      { name: "type", type: "select", options: ["single", "multi"], default: "single" },
      { name: "required", type: "bool", default: 1 },
      sort,
      visible,
    ],
    searchable: ["title", "key"],
    filterable: ["visible", "calculator"],
    sortable: ["sort_order"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  calc_options: {
    table: "calc_options",
    fields: [
      { name: "group_id", type: "number", required: true },
      { name: "label", type: "text", required: true, max: 160 },
      { name: "description", type: "text", max: 400 },
      { name: "icon", type: "text", max: 40 },
      { name: "price", type: "number" },
      { name: "price_type", type: "select", options: ["fixed", "multiplier", "monthly"], default: "fixed" },
      { name: "days", type: "number" },
      sort,
      visible,
    ],
    searchable: ["label", "description"],
    filterable: ["group_id", "visible"],
    sortable: ["sort_order", "price"],
    defaultOrder: "sort_order ASC, id ASC",
    allowCreate: true,
    allowDelete: true,
  },
  leads: {
    table: "leads",
    fields: [
      { name: "name", type: "text", required: true, max: 80 },
      { name: "surname", type: "text", max: 80 },
      { name: "company", type: "text", max: 120 },
      { name: "email", type: "text", required: true, max: 160 },
      { name: "phone", type: "text", max: 30 },
      { name: "city", type: "text", max: 120 },
      { name: "business_type", type: "text", max: 120 },
      { name: "source", type: "text", max: 40 },
      {
        name: "status",
        type: "select",
        options: ["nuevo", "contactado", "negociacion", "cliente", "perdido"],
        default: "nuevo",
      },
    ],
    searchable: ["name", "surname", "email", "company", "phone"],
    filterable: ["status", "source"],
    sortable: ["created_at", "name", "status"],
    defaultOrder: "created_at DESC, id DESC",
    allowCreate: true,
    allowDelete: true,
  },
  quotes: {
    table: "quotes",
    fields: [
      {
        name: "status",
        type: "select",
        options: ["borrador", "enviado", "contactado", "aceptado", "rechazado"],
        default: "borrador",
      },
      { name: "notes", type: "text", max: 3000 },
      { name: "price_min", type: "number" },
      { name: "price_max", type: "number" },
      { name: "final_amount", type: "number" },
      { name: "doc_reference", type: "text", max: 40 },
    ],
    searchable: ["public_id", "project_type"],
    filterable: ["status"],
    sortable: ["created_at", "price_max", "status"],
    defaultOrder: "created_at DESC, id DESC",
    allowCreate: false,
    allowDelete: true,
  },
  messages: {
    table: "messages",
    fields: [
      { name: "status", type: "select", options: ["nuevo", "leido", "respondido", "archivado"], default: "nuevo" },
    ],
    searchable: ["name", "email", "message", "company"],
    filterable: ["status"],
    sortable: ["created_at", "status"],
    defaultOrder: "created_at DESC, id DESC",
    allowCreate: false,
    allowDelete: true,
  },
  media: {
    table: "media",
    selectColumns: ["id", "filename", "original_name", "url", "mime", "size", "width", "height", "alt", "created_at"],
    fields: [{ name: "alt", type: "text", max: 200 }],
    searchable: ["original_name", "filename", "alt"],
    filterable: [],
    sortable: ["created_at", "size"],
    defaultOrder: "created_at DESC, id DESC",
    allowCreate: false,
    allowDelete: true,
  },
};

export function coerce(field: FieldDef, raw: unknown) {
  switch (field.type) {
    case "number": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : (field.default ?? 0);
    }
    case "bool":
      return raw === true || raw === 1 || raw === "1" || raw === "true" ? 1 : 0;
    case "json":
      if (Array.isArray(raw) || (raw && typeof raw === "object")) return JSON.stringify(raw);
      if (typeof raw === "string") {
        try {
          JSON.parse(raw);
          return raw;
        } catch {
          return JSON.stringify(
            raw
              .split(/[\n,]/)
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }
      }
      return "[]";
    case "select": {
      const v = String(raw ?? "");
      return field.options?.includes(v) ? v : String(field.default ?? field.options?.[0] ?? "");
    }
    default: {
      const s = typeof raw === "string" ? raw : raw === null || raw === undefined ? "" : String(raw);
      return s.replace(new RegExp("[\\u0000-\\u001f\\u007f]", "g"), " ").trim().slice(0, field.max ?? 2000);
    }
  }
}
