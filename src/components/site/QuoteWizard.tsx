"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { QuoteResult } from "./QuoteResult";

type Option = { id: number; label: string; description: string; icon: string };
type Group = { key: string; title: string; subtitle: string; type: "single" | "multi"; required: boolean; options: Option[] };
type Calculator = {
  key: string;
  name: string;
  description: string;
  icon: string;
  resultNote: string;
  groups: Group[];
};
type Config = {
  enabled: boolean;
  leadGateTitle: string;
  leadGateSubtitle: string;
  resultNote: string;
  calculators: Calculator[];
};
export type QuoteResponse = {
  publicId: string;
  calculator?: string;
  calculatorName?: string;
  priceMin: number;
  priceMax: number;
  monthly: number;
  daysMin: number;
  daysMax: number;
  currency: string;
  discount: { percent: number; label: string; amount: number } | null;
  summary: { group: string; groupKey: string; items: { label: string; price: number; priceType: string }[] }[];
  projectType: string;
};

type Lead = {
  name: string;
  surname: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  businessType: string;
  consent: boolean;
};

const STORAGE_KEY = "nova_quote_draft";

/** Etiqueta corta para el indicador de pasos (el título completo es demasiado largo). */
function stepLabel(group: Group) {
  const fromKey = group.key.replace(/[-_]/g, " ").trim();
  const label = fromKey ? fromKey.charAt(0).toUpperCase() + fromKey.slice(1) : group.title;
  return label.length > 18 ? `${label.slice(0, 18)}…` : label;
}

const BUSINESS_TYPES = [
  "Autónomo / profesional",
  "Pequeña empresa",
  "Empresa mediana o grande",
  "Comercio / tienda",
  "Restauración",
  "Salud y bienestar",
  "Servicios profesionales",
  "Educación / formación",
  "Inmobiliaria / construcción",
  "Otro",
];

export function QuoteWizard() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loadError, setLoadError] = useState("");
  const [calculatorKey, setCalculatorKey] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, number[]>>({});
  const [lead, setLead] = useState<Lead>({
    name: "",
    surname: "",
    company: "",
    email: "",
    phone: "",
    city: "",
    businessType: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<QuoteResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/calculator")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((data: Config) => {
        if (!alive) return;
        setConfig(data);
        try {
          const raw = sessionStorage.getItem(STORAGE_KEY);
          if (raw) {
            const draft = JSON.parse(raw);
            if (draft?.selections) setSelections(draft.selections);
            if (draft?.lead) setLead((l) => ({ ...l, ...draft.lead, consent: false }));
          }
        } catch {
          /* draft opcional */
        }
      })
      .catch(() => alive && setLoadError("No hemos podido cargar el configurador. Recarga la página."));
    return () => {
      alive = false;
    };
  }, []);

  // Con un solo presupuesto disponible no se pregunta: se entra directo.
  useEffect(() => {
    if (!calculatorKey && config?.calculators.length === 1) setCalculatorKey(config.calculators[0].key);
  }, [config, calculatorKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selections, calculatorKey, lead: { ...lead, consent: false } }),
      );
    } catch {
      /* modo privado */
    }
  }, [selections, calculatorKey, lead]);

  const calculators = config?.calculators ?? [];
  const calculator = calculators.find((c) => c.key === calculatorKey) ?? null;
  const groups = calculator?.groups ?? [];
  const totalSteps = groups.length + 1; // + datos de contacto
  const isLeadStep = step === groups.length;
  const progress = result ? 100 : Math.round((step / totalSteps) * 100);

  const toggle = useCallback(
    (group: Group, optionId: number) => {
      setSelections((prev) => {
        const current = prev[group.key] ?? [];
        if (group.type === "single") return { ...prev, [group.key]: current[0] === optionId ? [] : [optionId] };
        return {
          ...prev,
          [group.key]: current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId],
        };
      });
      setErrors((e) => ({ ...e, [group.key]: "" }));
    },
    [],
  );

  const canContinue = useMemo(() => {
    if (isLeadStep || !groups[step]) return true;
    const g = groups[step];
    return !g.required || (selections[g.key]?.length ?? 0) > 0;
  }, [groups, step, selections, isLeadStep]);

  function next() {
    const g = groups[step];
    if (g && g.required && (selections[g.key]?.length ?? 0) === 0) {
      setErrors((e) => ({ ...e, [g.key]: "Selecciona una opción para continuar" }));
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    scrollTop();
  }

  function back() {
    if (step === 0 && calculators.length > 1) {
      setCalculatorKey(null);
      setSelections({});
      scrollTop();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  }

  function scrollTop() {
    if (typeof window !== "undefined") {
      document.getElementById("wizard-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function validateLead() {
    const e: Record<string, string> = {};
    if (lead.name.trim().length < 2) e.name = "Indica tu nombre";
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(lead.email.trim())) e.email = "Introduce un email válido";
    if (!/^[+()\d\s.-]{6,}$/.test(lead.phone.trim())) e.phone = "Introduce un teléfono válido";
    if (!lead.consent) e.consent = "Debes aceptar la política de privacidad";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validateLead()) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, selections, calculator: calculatorKey }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fieldErrors || {});
        setFormError(json.error || "No hemos podido calcular tu presupuesto.");
        return;
      }
      setResult(json as QuoteResponse);
      scrollTop();
    } catch {
      setFormError("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-700">{loadError}</p>
      </div>
    );
  }

  if (!config) return <WizardSkeleton />;

  if (!config.enabled) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-navy-900">El configurador está temporalmente desactivado</h2>
        <p className="mt-2 text-sm text-navy-600">Escríbenos y preparamos tu presupuesto personalmente.</p>
        <Link href="/#contacto" className="btn-primary mt-6">
          Hablar con nosotros
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <QuoteResult
        result={result}
        note={calculator?.resultNote || config.resultNote}
        onModify={() => {
          setResult(null);
          setStep(0);
          scrollTop();
        }}
      />
    );
  }

  // Paso previo: qué se quiere presupuestar. Con un solo presupuesto activo se
  // selecciona solo y el paso no llega a mostrarse.
  if (!calculator) {
    if (calculators.length === 1) return <WizardSkeleton />;
    if (calculators.length === 0) {
      return (
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-navy-900">El configurador está en preparación</h2>
          <p className="mt-2 text-sm text-navy-600">Escríbenos y preparamos tu presupuesto personalmente.</p>
          <Link href="/#contacto" className="btn-primary mt-6">
            Hablar con nosotros
          </Link>
        </div>
      );
    }
    return (
      <div className="animate-fade-up">
        <p className="text-sm font-semibold text-navy-900">Paso 1</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
          ¿Qué quieres presupuestar?
        </h2>
        <p className="mt-2 text-[15px] text-navy-600">Elige por dónde empezamos. Después podrás pedir el otro.</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {calculators.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setCalculatorKey(c.key);
                setSelections({});
                setStep(0);
                scrollTop();
              }}
              className="group flex items-start gap-4 rounded-[8px] border border-line bg-white p-5 text-left transition-colors duration-150 hover:border-navy-900 hover:bg-paper"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] border border-line text-brand-600 transition-colors group-hover:border-navy-900 group-hover:text-navy-900">
                <Icon name={c.icon} size={24} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold text-navy-900">{c.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-navy-600">{c.description}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-all group-hover:gap-2.5">
                  Empezar <Icon name="arrow" size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const group = groups[step];

  return (
    <div>
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-navy-900">
            Paso {step + 1} de {totalSteps}
            {calculators.length > 1 && (
              <span className="ml-2 font-normal text-navy-400">· {calculator.name}</span>
            )}
          </span>
          <span className="flex items-center gap-3">
            {calculators.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setCalculatorKey(null);
                  setSelections({});
                  setStep(0);
                  scrollTop();
                }}
                className="text-navy-400 underline-offset-2 hover:text-brand-600 hover:underline"
              >
                Cambiar
              </button>
            )}
            <span className="text-navy-400">{progress}% completado</span>
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-navy-900 transition-all duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
        <ol className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {[...groups.map((g) => stepLabel(g)), "Tus datos"].map((label, i) => (
            <li key={label + i}>
              <button
                type="button"
                onClick={() => i <= step && (setStep(i), scrollTop())}
                disabled={i > step}
                className={`shrink-0 rounded-[4px] px-3 py-1.5 text-xs font-medium transition ${
                  i === step
                    ? "bg-navy-900 text-white"
                    : i < step
                      ? "bg-navy-900 text-white"
                      : "bg-mist text-navy-400"
                }`}
              >
                {i < step && <span className="mr-1">✓</span>}
                {label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div key={isLeadStep ? "lead" : group?.key} className="animate-fade-up">
        {isLeadStep ? (
          <LeadStep
            config={config}
            lead={lead}
            setLead={setLead}
            errors={errors}
            formError={formError}
            submitting={submitting}
            onSubmit={submit}
            onBack={back}
          />
        ) : (
          group && (
            <fieldset>
              <legend className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
                {group.title}
              </legend>
              {group.subtitle && <p className="mt-2 text-[15px] text-navy-600">{group.subtitle}</p>}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {group.options.map((opt) => {
                  const active = (selections[group.key] ?? []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(group, opt.id)}
                      aria-pressed={active}
                      className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                        active
                          ? "border-navy-900 bg-paper"
                          : "border-line bg-white hover:border-brand-300 hover:bg-paper"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-all ${
                          group.type === "single" ? "rounded-full" : "rounded-md"
                        } ${active ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong bg-white text-transparent"}`}
                      >
                        <Icon name="check" size={11} strokeWidth={3} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold text-navy-900">{opt.label}</span>
                        {opt.description && (
                          <span className="mt-0.5 block text-[13px] leading-relaxed text-navy-400">{opt.description}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors[group.key] && <p className="error-text mt-3">{errors[group.key]}</p>}
              {!group.required && (
                <p className="help mt-3">Este paso es opcional: si no necesitas nada de esto, continúa sin seleccionar.</p>
              )}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0 && calculators.length <= 1}
                  className="btn-ghost"
                >
                  <Icon name="chevron" size={16} className="rotate-180" /> Atrás
                </button>
                <button type="button" onClick={next} disabled={!canContinue} className="btn-primary group">
                  Continuar
                  <Icon name="arrow" size={17} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </fieldset>
          )
        )}
      </div>
    </div>
  );
}

function LeadStep({
  config,
  lead,
  setLead,
  errors,
  formError,
  submitting,
  onSubmit,
  onBack,
}: {
  config: Config;
  lead: Lead;
  setLead: React.Dispatch<React.SetStateAction<Lead>>;
  errors: Record<string, string>;
  formError: string;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const set = (key: keyof Lead, value: string | boolean) => setLead((l) => ({ ...l, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="rounded-[8px] border border-line bg-paper p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
          <Icon name="check" size={16} strokeWidth={2.5} /> {config.leadGateTitle}
        </p>
        <p className="mt-1.5 text-sm text-brand-900/70">{config.leadGateSubtitle}</p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Input id="lead-name" label="Nombre *" value={lead.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="given-name" />
        <Input id="lead-surname" label="Apellidos" value={lead.surname} onChange={(v) => set("surname", v)} error={errors.surname} autoComplete="family-name" />
        <Input id="lead-email" label="Email *" type="email" value={lead.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
        <Input id="lead-phone" label="Teléfono *" type="tel" value={lead.phone} onChange={(v) => set("phone", v)} error={errors.phone} autoComplete="tel" />
        <Input id="lead-company" label="Empresa (opcional)" value={lead.company} onChange={(v) => set("company", v)} error={errors.company} autoComplete="organization" />
        <Input id="lead-city" label="Ciudad / país (opcional)" value={lead.city} onChange={(v) => set("city", v)} error={errors.city} />
        <div className="sm:col-span-2">
          <label className="label" htmlFor="businessType">
            Tipo de negocio
          </label>
          <select
            id="businessType"
            className="field"
            value={lead.businessType}
            onChange={(e) => set("businessType", e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {BUSINESS_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-navy-600">
        <input
          type="checkbox"
          checked={lead.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand-600 focus:ring-brand-500"
        />
        <span>
          He leído y acepto la{" "}
          <a href="/legal/privacidad" target="_blank" className="font-medium text-brand-600 underline underline-offset-2">
            política de privacidad
          </a>{" "}
          y el tratamiento de mis datos para recibir el presupuesto.
        </span>
      </label>
      {errors.consent && <p className="error-text">{errors.consent}</p>}

      {formError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        <button type="button" onClick={onBack} className="btn-ghost">
          <Icon name="chevron" size={16} className="rotate-180" /> Atrás
        </button>
        <button type="submit" disabled={submitting} className="btn-primary group">
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Calculando...
            </>
          ) : (
            <>
              Ver mi presupuesto
              <Icon name="arrow" size={17} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: unknown;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`field ${error ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : ""}`}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

function WizardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-1.5 w-full rounded-full bg-line" />
      <div className="mt-8 h-8 w-2/3 rounded-lg bg-line" />
      <div className="mt-3 h-4 w-1/2 rounded-lg bg-mist" />
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-mist" />
        ))}
      </div>
    </div>
  );
}
