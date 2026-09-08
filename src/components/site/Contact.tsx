"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import type { SectionCopy, SiteInfo } from "@/lib/content";

const PROJECT_TYPES = [
  "Página web corporativa",
  "Landing page",
  "Tienda online",
  "Rediseño de web",
  "Mantenimiento",
  "Otro",
];

type State = "idle" | "loading" | "success" | "error";

export function Contact({ copy, site, services }: { copy: SectionCopy; site: SiteInfo; services: string[] }) {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const options = services.length ? services : PROJECT_TYPES;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("loading");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fieldErrors || {});
        setMessage(json.error || "No hemos podido enviar tu mensaje. Inténtalo de nuevo.");
        setState("error");
        return;
      }
      setState("success");
      form.reset();
    } catch {
      setMessage("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
      setState("error");
    }
  }

  return (
    <section id="contacto" className="scroll-mt-24 border-t border-slate-100 bg-mist py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} align="left" />

          <Reveal delay={140}>
            <ul className="mt-9 space-y-3">
              {site.email && (
                <ContactItem icon="mail" label="Email" value={site.email} href={`mailto:${site.email}`} />
              )}
              {site.phone && (
                <ContactItem icon="phone" label="Teléfono" value={site.phone} href={`tel:${site.phone.replace(/\s/g, "")}`} />
              )}
              {site.whatsapp && (
                <ContactItem
                  icon="whatsapp"
                  label="WhatsApp"
                  value="Escríbenos por WhatsApp"
                  href={`https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`}
                  external
                />
              )}
              {site.address && <ContactItem icon="pin" label="Dónde estamos" value={site.address} />}
              {site.schedule && <ContactItem icon="clock" label="Horario" value={site.schedule} />}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            {state === "success" ? (
              <div className="py-10 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon name="check" size={26} strokeWidth={2.4} />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-navy-900">Mensaje enviado</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                  Gracias por escribirnos. Te responderemos en menos de 24 horas laborables.
                </p>
                <button type="button" onClick={() => setState("idle")} className="btn-secondary btn-sm mt-6">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre *" name="name" error={errors.name} placeholder="Tu nombre" required />
                  <Field label="Email *" name="email" type="email" error={errors.email} placeholder="tu@email.com" required />
                  <Field label="Teléfono" name="phone" type="tel" error={errors.phone} placeholder="600 000 000" />
                  <Field label="Empresa" name="company" error={errors.company} placeholder="Nombre de tu negocio" />
                </div>

                <div className="mt-4">
                  <label className="label" htmlFor="project_type">
                    Tipo de proyecto
                  </label>
                  <select id="project_type" name="project_type" className="field" defaultValue="">
                    <option value="">Selecciona una opción</option>
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="label" htmlFor="message">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder="Cuéntanos brevemente qué necesitas..."
                    className="field resize-y"
                  />
                  {errors.message && <p className="error-text">{errors.message}</p>}
                </div>

                <label className="mt-5 flex items-start gap-3 text-sm text-slate-600">
                  <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    He leído y acepto la{" "}
                    <a href="/legal/privacidad" className="font-medium text-brand-600 underline underline-offset-2">
                      política de privacidad
                    </a>
                    .
                  </span>
                </label>
                {errors.consent && <p className="error-text">{errors.consent}</p>}

                {state === "error" && message && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
                )}

                <button type="submit" disabled={state === "loading"} className="btn-primary mt-6 w-full">
                  {state === "loading" ? (
                    <>
                      <Spinner /> Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensaje <Icon name="arrow" size={17} />
                    </>
                  )}
                </button>
                <p className="help text-center">Respondemos en menos de 24 horas laborables.</p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const body = (
    <span className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-soft">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon name={icon} size={19} />
      </span>
      <span>
        <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
        <span className="block text-[15px] font-semibold text-navy-900">{value}</span>
      </span>
    </span>
  );
  return (
    <li>
      {href ? (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block">
          {body}
        </a>
      ) : (
        body
      )}
    </li>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} required={required} className="field" />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
  );
}
