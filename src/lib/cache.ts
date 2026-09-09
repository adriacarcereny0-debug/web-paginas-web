import { revalidateTag, unstable_cache } from "next/cache";

/** Etiquetas de caché de la web pública. */
export const TAGS = {
  content: "content",
  services: "services",
  projects: "projects",
  testimonials: "testimonials",
  reviews: "reviews",
  faqs: "faqs",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

/**
 * Envuelve una consulta para que la web pública no golpee la base de datos en cada
 * visita. El resultado se guarda hasta que el panel invalida la etiqueta, así que el
 * contenido se publica al instante pero las páginas se sirven casi siempre desde caché.
 */
export function cached<T>(key: string[], tags: CacheTag[], fn: () => Promise<T>) {
  return unstable_cache(fn, key, { tags, revalidate: 3600 })();
}

/** Qué etiquetas invalida cada recurso del panel. */
const RESOURCE_TAGS: Record<string, CacheTag[]> = {
  services: [TAGS.services],
  projects: [TAGS.projects],
  testimonials: [TAGS.testimonials],
  reviews: [TAGS.reviews],
  faqs: [TAGS.faqs],
  calc_groups: [TAGS.content],
  calc_options: [TAGS.content],
};

export function revalidateResource(resource: string) {
  for (const tag of RESOURCE_TAGS[resource] ?? []) revalidateTag(tag, { expire: 0 });
}

export function revalidateContent() {
  for (const tag of Object.values(TAGS)) revalidateTag(tag, { expire: 0 });
}
