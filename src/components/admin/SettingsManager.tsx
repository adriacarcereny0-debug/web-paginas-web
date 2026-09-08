"use client";
import { useState } from "react";
import { PageHeader, Card } from "./ui";
import { RepeaterList, SaveBar, Section, TextField, useSettings } from "./SettingsForm";
import { useToast } from "./Toast";
import type { SiteInfo } from "@/lib/content";

export function SettingsManager({ user }: { user: { name: string; email: string } }) {
  const { value, update, save, reset, saving, dirty } = useSettings<SiteInfo>("site");

  return (
    <>
      <PageHeader title="Configuración" description="Datos de contacto, marca y cuenta de administrador." />

      {!value ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <div className="space-y-5">
          <Section title="Marca">
            <TextField label="Nombre de la agencia" value={value.brandName} onChange={(v) => update((c) => ({ ...c, brandName: v }))} />
            <TextField
              label="Iniciales del logo"
              value={value.brandInitials}
              onChange={(v) => update((c) => ({ ...c, brandInitials: v }))}
              help="1 o 2 letras que se muestran en el cuadrado azul."
            />
            <TextField label="Lema" value={value.tagline} onChange={(v) => update((c) => ({ ...c, tagline: v }))} wide />
          </Section>

          <Section title="Datos de contacto" description="Se muestran en el footer y en la sección de contacto.">
            <TextField label="Email" value={value.email} onChange={(v) => update((c) => ({ ...c, email: v }))} />
            <TextField label="Teléfono" value={value.phone} onChange={(v) => update((c) => ({ ...c, phone: v }))} />
            <TextField
              label="WhatsApp"
              value={value.whatsapp}
              onChange={(v) => update((c) => ({ ...c, whatsapp: v }))}
              help="Con prefijo internacional. Déjalo vacío para ocultar el botón flotante."
            />
            <TextField label="Ubicación" value={value.address} onChange={(v) => update((c) => ({ ...c, address: v }))} />
            <TextField label="Horario" value={value.schedule} onChange={(v) => update((c) => ({ ...c, schedule: v }))} wide />
            <RepeaterList
              label="Redes sociales"
              items={value.social}
              onChange={(social) => update((c) => ({ ...c, social }))}
              empty="Sin redes sociales configuradas."
              create={() => ({ label: "", url: "https://" })}
              render={(item, patch) => (
                <>
                  <TextField label="Nombre" value={item.label} onChange={(v) => patch({ label: v })} />
                  <TextField label="Enlace" value={item.url} onChange={(v) => patch({ url: v })} />
                </>
              )}
            />
          </Section>

          <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
        </div>
      )}

      <div className="mt-8">
        <AccountSection user={user} />
      </div>
    </>
  );
}

function AccountSection({ user }: { user: { name: string; email: string } }) {
  const { push } = useToast();
  const [form, setForm] = useState({ name: user.name, email: user.email, currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fieldErrors || {});
        push(json.error || "No se ha podido guardar", "error");
        return;
      }
      push("Cuenta actualizada");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="font-display text-base font-bold text-navy-900">Cuenta de administrador</h3>
      <p className="mt-1 text-sm text-slate-500">Cambia tu nombre, tu email de acceso o tu contraseña.</p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="acc-name">
            Nombre
          </label>
          <input
            id="acc-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="field"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="acc-email">
            Email de acceso
          </label>
          <input
            id="acc-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="field"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="acc-current">
            Contraseña actual
          </label>
          <input
            id="acc-current"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className="field"
            placeholder="Solo si cambias la contraseña"
          />
          {errors.currentPassword && <p className="error-text">{errors.currentPassword}</p>}
        </div>
        <div>
          <label className="label" htmlFor="acc-new">
            Nueva contraseña
          </label>
          <input
            id="acc-new"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            className="field"
            placeholder="Mínimo 8 caracteres"
          />
          {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary btn-sm">
            {saving ? "Guardando..." : "Guardar cuenta"}
          </button>
        </div>
      </form>
    </Card>
  );
}
