"use client";
import { useState } from "react";
import { PageHeader } from "./ui";
import { RepeaterList, SaveBar, Section, TextArea, TextField, Toggle, useSettings } from "./SettingsForm";
import { FieldInput } from "./CrudManager";
import type {
  CtaSection,
  FooterContent,
  Hero,
  LegalContent,
  ReviewsSection,
  SectionCopy,
  StepsSection,
  TrustSection,
} from "@/lib/content";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "trust", label: "Confianza" },
  { key: "steps", label: "Cómo trabajamos" },
  { key: "resenas", label: "Reseñas" },
  { key: "secciones", label: "Títulos de sección" },
  { key: "cta", label: "CTA final" },
  { key: "footer", label: "Footer" },
  { key: "legal", label: "Textos legales" },
] as const;

export function ContentManager() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("hero");

  return (
    <>
      <PageHeader
        title="Contenido"
        description="Edita los textos de la web sin tocar código. Los cambios se publican al guardar."
      />

      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroEditor />}
      {tab === "trust" && <TrustEditor />}
      {tab === "steps" && <StepsEditor />}
      {tab === "resenas" && <ReviewsCopyEditor />}
      {tab === "secciones" && <SectionCopyEditor />}
      {tab === "cta" && <CtaEditor />}
      {tab === "footer" && <FooterEditor />}
      {tab === "legal" && <LegalEditor />}
    </>
  );
}

function Loading() {
  return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;
}

function HeroEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<Hero>("hero");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section title="Primera pantalla" description="Lo primero que ve un visitante. Sé claro y concreto.">
        <TextField label="Etiqueta superior" value={value.badge} onChange={(v) => update((c) => ({ ...c, badge: v }))} wide />
        <TextField label="Titular" value={value.title} onChange={(v) => update((c) => ({ ...c, title: v }))} />
        <TextField
          label="Parte destacada del titular"
          value={value.highlight}
          onChange={(v) => update((c) => ({ ...c, highlight: v }))}
          help="Se muestra en azul degradado."
        />
        <TextArea label="Subtítulo" value={value.subtitle} onChange={(v) => update((c) => ({ ...c, subtitle: v }))} />
        <TextField label="Botón principal" value={value.primaryCta} onChange={(v) => update((c) => ({ ...c, primaryCta: v }))} />
        <TextField label="Botón secundario" value={value.secondaryCta} onChange={(v) => update((c) => ({ ...c, secondaryCta: v }))} />
        <div className="sm:col-span-2">
          <FieldInput
            field={{
              name: "image",
              label: "Imagen principal (opcional)",
              type: "image",
              help: "Si subes una imagen sustituye a la composición gráfica de la derecha. Ideal apaisada, mínimo 1200 px de ancho.",
            }}
            value={value.image}
            onChange={(v) => update((c) => ({ ...c, image: String(v) }))}
          />
        </div>
        <RepeaterList
          label="Puntos rápidos bajo los botones"
          items={value.bullets.map((b) => ({ text: b }))}
          onChange={(items) => update((c) => ({ ...c, bullets: items.map((i) => i.text) }))}
          empty="Sin puntos añadidos."
          create={() => ({ text: "" })}
          render={(item, patch) => <TextField label="Texto" value={item.text} onChange={(v) => patch({ text: v })} wide />}
        />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function TrustEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<TrustSection>("trust");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section title="Sección de confianza">
        <TextField label="Etiqueta" value={value.eyebrow} onChange={(v) => update((c) => ({ ...c, eyebrow: v }))} />
        <TextField label="Título" value={value.title} onChange={(v) => update((c) => ({ ...c, title: v }))} />
        <TextArea label="Subtítulo" value={value.subtitle} onChange={(v) => update((c) => ({ ...c, subtitle: v }))} />
        <RepeaterList
          label="Bloques"
          items={value.items}
          onChange={(items) => update((c) => ({ ...c, items }))}
          empty="Sin bloques."
          create={() => ({ title: "", text: "", icon: "sparkles" })}
          render={(item, patch) => (
            <>
              <TextField label="Título" value={item.title} onChange={(v) => patch({ title: v })} />
              <div>
                <FieldInput
                  field={{ name: "icon", label: "Icono", type: "icon" }}
                  value={item.icon}
                  onChange={(v) => patch({ icon: String(v) })}
                />
              </div>
              <TextArea label="Texto" value={item.text} onChange={(v) => patch({ text: v })} rows={2} />
            </>
          )}
        />
        <RepeaterList
          label="Estadísticas"
          items={value.stats}
          onChange={(stats) => update((c) => ({ ...c, stats }))}
          empty="Sin estadísticas. Añade solo datos reales."
          create={() => ({ value: "", label: "" })}
          render={(item, patch) => (
            <>
              <TextField label="Valor" value={item.value} onChange={(v) => patch({ value: v })} />
              <TextField label="Etiqueta" value={item.label} onChange={(v) => patch({ label: v })} />
            </>
          )}
        />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function StepsEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<StepsSection>("steps");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section title="Cómo trabajamos">
        <TextField label="Etiqueta" value={value.eyebrow} onChange={(v) => update((c) => ({ ...c, eyebrow: v }))} />
        <TextField label="Título" value={value.title} onChange={(v) => update((c) => ({ ...c, title: v }))} />
        <TextArea label="Subtítulo" value={value.subtitle} onChange={(v) => update((c) => ({ ...c, subtitle: v }))} />
        <RepeaterList
          label="Pasos"
          items={value.steps}
          onChange={(steps) => update((c) => ({ ...c, steps }))}
          empty="Sin pasos."
          create={() => ({ number: "", title: "", text: "" })}
          render={(item, patch) => (
            <>
              <TextField label="Número" value={item.number} onChange={(v) => patch({ number: v })} />
              <TextField label="Título" value={item.title} onChange={(v) => patch({ title: v })} />
              <TextArea label="Texto" value={item.text} onChange={(v) => patch({ text: v })} rows={2} />
            </>
          )}
        />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function CopyBlock({ settingsKey, title }: { settingsKey: string; title: string }) {
  const { value, update, save, reset, saving, dirty } = useSettings<SectionCopy>(settingsKey);
  if (!value) return <Loading />;
  return (
    <div className="space-y-3">
      <Section title={title}>
        <TextField label="Etiqueta" value={value.eyebrow} onChange={(v) => update((c) => ({ ...c, eyebrow: v }))} />
        <TextField label="Título" value={value.title} onChange={(v) => update((c) => ({ ...c, title: v }))} />
        <TextArea label="Subtítulo" value={value.subtitle} onChange={(v) => update((c) => ({ ...c, subtitle: v }))} rows={2} />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function ReviewsCopyEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<ReviewsSection>("reviewsCopy");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section
        title="Sección de reseñas"
        description="Las reseñas se gestionan en el apartado “Reseñas” del menú. Aquí controlas los textos y el resumen."
      >
        <TextField label="Etiqueta" value={value.eyebrow} onChange={(v) => update((c) => ({ ...c, eyebrow: v }))} />
        <TextField label="Título" value={value.title} onChange={(v) => update((c) => ({ ...c, title: v }))} />
        <TextArea label="Subtítulo" value={value.subtitle} onChange={(v) => update((c) => ({ ...c, subtitle: v }))} rows={2} />
        <Toggle
          label="Mostrar el resumen de valoraciones"
          checked={value.showSummary}
          onChange={(v) => update((c) => ({ ...c, showSummary: v }))}
          help="Nota media, reparto de estrellas y dato destacado."
        />
        <TextField
          label="Dato destacado"
          value={value.highlightValue}
          onChange={(v) => update((c) => ({ ...c, highlightValue: v }))}
          help="Por ejemplo: +200"
        />
        <TextField
          label="Texto del dato destacado"
          value={value.highlightLabel}
          onChange={(v) => update((c) => ({ ...c, highlightLabel: v }))}
          help="Por ejemplo: servicios realizados"
        />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function SectionCopyEditor() {
  return (
    <div className="space-y-8">
      <CopyBlock settingsKey="servicesCopy" title="Servicios" />
      <CopyBlock settingsKey="portfolioCopy" title="Portfolio" />
      <CopyBlock settingsKey="testimonialsCopy" title="Testimonios" />
      <CopyBlock settingsKey="faqCopy" title="Preguntas frecuentes" />
      <CopyBlock settingsKey="contactCopy" title="Contacto" />
    </div>
  );
}

function CtaEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<CtaSection>("cta");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section title="Llamada a la acción final" description="El bloque azul justo antes del footer.">
        <TextField label="Título" value={value.title} onChange={(v) => update((c) => ({ ...c, title: v }))} wide />
        <TextArea label="Subtítulo" value={value.subtitle} onChange={(v) => update((c) => ({ ...c, subtitle: v }))} rows={2} />
        <TextField label="Botón principal" value={value.button} onChange={(v) => update((c) => ({ ...c, button: v }))} />
        <TextField label="Botón secundario" value={value.secondary} onChange={(v) => update((c) => ({ ...c, secondary: v }))} />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function FooterEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<FooterContent>("footer");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section title="Footer">
        <TextArea label="Descripción" value={value.description} onChange={(v) => update((c) => ({ ...c, description: v }))} rows={2} />
        <TextField label="Texto de copyright" value={value.copyright} onChange={(v) => update((c) => ({ ...c, copyright: v }))} wide />
        <RepeaterList
          label="Columnas de enlaces"
          items={value.columns}
          onChange={(columns) => update((c) => ({ ...c, columns }))}
          empty="Sin columnas."
          create={() => ({ title: "Nueva columna", links: [] })}
          render={(column, patch) => (
            <>
              <TextField label="Título de la columna" value={column.title} onChange={(v) => patch({ title: v })} wide />
              <RepeaterList
                label="Enlaces"
                items={column.links}
                onChange={(links) => patch({ links })}
                empty="Sin enlaces."
                create={() => ({ label: "", href: "/" })}
                render={(link, patchLink) => (
                  <>
                    <TextField label="Texto" value={link.label} onChange={(v) => patchLink({ label: v })} />
                    <TextField label="Enlace" value={link.href} onChange={(v) => patchLink({ href: v })} />
                  </>
                )}
              />
            </>
          )}
        />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}

function LegalEditor() {
  const { value, update, save, reset, saving, dirty } = useSettings<LegalContent>("legal");
  if (!value) return <Loading />;
  return (
    <div className="space-y-5">
      <Section
        title="Textos legales"
        description="Admite formato sencillo: ## para títulos, - para listas, ** para negrita y > para notas destacadas."
      >
        <TextArea label="Política de privacidad" value={value.privacy} onChange={(v) => update((c) => ({ ...c, privacy: v }))} rows={12} />
        <TextArea label="Política de cookies" value={value.cookies} onChange={(v) => update((c) => ({ ...c, cookies: v }))} rows={10} />
        <TextArea label="Aviso legal" value={value.legal} onChange={(v) => update((c) => ({ ...c, legal: v }))} rows={10} />
      </Section>
      <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}
