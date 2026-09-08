"use client";
import { PageHeader } from "./ui";
import { SaveBar, Section, TextArea, TextField, Toggle, useSettings } from "./SettingsForm";
import { FieldInput } from "./CrudManager";
import type { Seo } from "@/lib/content";

export function SeoManager() {
  const { value, update, save, reset, saving, dirty } = useSettings<Seo>("seo");

  return (
    <>
      <PageHeader title="SEO" description="Metadatos que ven Google y las redes sociales al compartir tu web." />
      {!value ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <div className="space-y-5">
          <Section title="Metadatos principales">
            <TextField
              label="Meta title"
              value={value.title}
              onChange={(v) => update((c) => ({ ...c, title: v }))}
              wide
              help={`${value.title.length} caracteres · lo ideal son entre 50 y 60.`}
            />
            <TextArea
              label="Meta description"
              value={value.description}
              onChange={(v) => update((c) => ({ ...c, description: v }))}
              rows={3}
              help={`${value.description.length} caracteres · lo ideal son entre 120 y 160.`}
            />
            <TextField
              label="Palabras clave"
              value={value.keywords}
              onChange={(v) => update((c) => ({ ...c, keywords: v }))}
              wide
              help="Separadas por comas."
            />
            <TextField
              label="URL del sitio"
              value={value.siteUrl}
              onChange={(v) => update((c) => ({ ...c, siteUrl: v }))}
              help="Se usa en el sitemap, en las URLs canónicas y en Open Graph."
            />
            <TextField
              label="Usuario de X / Twitter"
              value={value.twitter}
              onChange={(v) => update((c) => ({ ...c, twitter: v }))}
              help="Opcional. Ejemplo: @tuestudio"
            />
            <Toggle
              label="Permitir indexación en buscadores"
              checked={value.indexable}
              onChange={(v) => update((c) => ({ ...c, indexable: v }))}
              help="Desactívalo mientras la web esté en construcción."
            />
          </Section>

          <Section title="Imágenes" description="La imagen social es la que se ve al compartir el enlace en WhatsApp, LinkedIn o X.">
            <div className="sm:col-span-2">
              <FieldInput
                field={{ name: "ogImage", label: "Imagen social (1200×630 px)", type: "image" }}
                value={value.ogImage}
                onChange={(v) => update((c) => ({ ...c, ogImage: String(v) }))}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldInput
                field={{ name: "favicon", label: "Favicon", type: "image", help: "PNG o ICO cuadrado, idealmente 512×512." }}
                value={value.favicon}
                onChange={(v) => update((c) => ({ ...c, favicon: String(v) }))}
              />
            </div>
          </Section>

          <Section title="Vista previa en Google">
            <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">{value.siteUrl.replace(/^https?:\/\//, "")}</p>
              <p className="mt-1 text-lg text-[#1a0dab]">{value.title || "Título de tu web"}</p>
              <p className="mt-1 text-sm text-slate-600">{value.description || "Descripción de tu web"}</p>
            </div>
            <div className="sm:col-span-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
              El sitemap se genera automáticamente en <code className="font-mono">/sitemap.xml</code> y el archivo de robots en{" "}
              <code className="font-mono">/robots.txt</code>. La portada incluye datos estructurados de negocio y de FAQ.
            </div>
          </Section>

          <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
        </div>
      )}
    </>
  );
}
