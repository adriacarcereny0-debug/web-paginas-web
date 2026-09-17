"use client";
import { useEffect, useState } from "react";
import { CrudManager, FieldInput, type Row } from "./CrudManager";
import { PageHeader, Card } from "./ui";
import { RepeaterList, SaveBar, Section, TextArea, TextField, Toggle, useSettings } from "./SettingsForm";
import { formatMoney } from "@/lib/utils";

type CalcSettings = {
  enabled: boolean;
  basePrice: number;
  baseDays: number;
  rangeMargin: number;
  minPrice: number;
  currency: string;
  leadGateTitle: string;
  leadGateSubtitle: string;
  resultNote: string;
  discounts: { minItems: number; percent: number; label: string }[];
};

type Group = { id: number; key: string; title: string; type: string; visible: number; calculator: string };

type CalculatorDef = {
  key: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  basePrice: number;
  baseDays: number;
  minPrice: number;
  rangeMargin: number;
  resultNote: string;
};

const PRICE_TYPES = [
  { value: "fixed", label: "Importe fijo (se suma)" },
  { value: "multiplier", label: "Multiplicador (x sobre el total)" },
  { value: "monthly", label: "Cuota mensual" },
];

export function CalculatorManager() {
  const { value, update, save, reset, saving, dirty } = useSettings<CalcSettings>("calculator");
  const defs = useSettings<CalculatorDef[]>("calculators");
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeCalc, setActiveCalc] = useState("web");
  const [tab, setTab] = useState<"presupuestos" | "precios" | "pasos" | "opciones">("presupuestos");

  const calcGroups = groups.filter((g) => (g.calculator || "web") === activeCalc);

  async function loadGroups() {
    const res = await fetch("/api/admin/calc_groups?perPage=200");
    if (!res.ok) return;
    const json = await res.json();
    setGroups(json.rows);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  // Al cambiar de presupuesto, el paso seleccionado deja de ser válido.
  useEffect(() => {
    const first = groups.find((g) => (g.calculator || "web") === activeCalc);
    setActiveGroup(first?.id ?? null);
  }, [activeCalc, groups]);

  return (
    <>
      <PageHeader
        title="Calculadora de presupuestos"
        description="Configura los pasos, las opciones y los precios que usa el creador de presupuestos. Nada está escrito en el código."
      />

      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {(
          [
            ["presupuestos", "Presupuestos"],
            ["precios", "Reglas comunes"],
            ["pasos", "Pasos"],
            ["opciones", "Opciones y precios"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === key ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "presupuestos" && (
        <>
          {!defs.value ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <div className="space-y-5">
              <Section
                title="Presupuestos disponibles"
                description="Cada uno tiene sus propios pasos y su propio precio de partida. Si hay más de uno activo, la web pregunta al visitante cuál quiere antes de empezar."
              >
                <RepeaterList
                  label="Presupuestos"
                  items={defs.value}
                  onChange={(items) => defs.update(() => items)}
                  empty="Sin presupuestos configurados."
                  create={() => ({
                    key: "nuevo",
                    name: "Nuevo presupuesto",
                    description: "",
                    icon: "layout",
                    enabled: true,
                    basePrice: 0,
                    baseDays: 3,
                    minPrice: 200,
                    rangeMargin: 0.15,
                    resultNote: "",
                  })}
                  render={(item, patch) => (
                    <>
                      <TextField label="Nombre" value={item.name} onChange={(v) => patch({ name: v })} />
                      <TextField
                        label="Clave interna"
                        value={item.key}
                        onChange={(v) => patch({ key: v })}
                        help="Sin espacios. Es la que enlaza con los pasos."
                      />
                      <TextArea label="Descripción" value={item.description} onChange={(v) => patch({ description: v })} rows={2} />
                      <TextField label="Precio base" type="number" value={item.basePrice} onChange={(v) => patch({ basePrice: Number(v) })} />
                      <TextField label="Precio mínimo" type="number" value={item.minPrice} onChange={(v) => patch({ minPrice: Number(v) })} />
                      <TextField label="Días base" type="number" value={item.baseDays} onChange={(v) => patch({ baseDays: Number(v) })} />
                      <TextField
                        label="Margen del rango (0-1)"
                        type="number"
                        value={item.rangeMargin}
                        onChange={(v) => patch({ rangeMargin: Number(v) })}
                      />
                      <TextArea
                        label="Nota bajo el resultado"
                        value={item.resultNote}
                        onChange={(v) => patch({ resultNote: v })}
                        rows={2}
                      />
                      <div className="sm:col-span-2">
                        <FieldInput
                          field={{ name: "icon", label: "Icono", type: "icon" }}
                          value={item.icon}
                          onChange={(v: unknown) => patch({ icon: String(v) })}
                        />
                      </div>
                      <Toggle
                        label="Activo"
                        checked={item.enabled}
                        onChange={(v) => patch({ enabled: v })}
                        help="Si lo desactivas deja de ofrecerse en la web."
                      />
                    </>
                  )}
                />
              </Section>
              <SaveBar saving={defs.saving} dirty={defs.dirty} onSave={defs.save} onReset={defs.reset} />
            </div>
          )}
        </>
      )}

      {tab === "precios" && (
        <>
          {!value ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <div className="space-y-5">
              <Section
                title="Reglas de cálculo"
                description="El precio final se calcula así: (precio base + opciones fijas) × multiplicadores − descuentos, con un margen a cada lado para mostrar un rango."
              >
                <Toggle
                  label="Calculador activo"
                  checked={value.enabled}
                  onChange={(v) => update((c) => ({ ...c, enabled: v }))}
                  help="Si lo desactivas, la página de presupuesto invita a contactar directamente."
                />
                <TextField
                  label="Precio base"
                  type="number"
                  value={value.basePrice}
                  onChange={(v) => update((c) => ({ ...c, basePrice: Number(v) }))}
                  help="Importe de partida antes de sumar opciones."
                />
                <TextField
                  label="Precio mínimo"
                  type="number"
                  value={value.minPrice}
                  onChange={(v) => update((c) => ({ ...c, minPrice: Number(v) }))}
                  help="Ninguna estimación bajará de este importe."
                />
                <TextField
                  label="Días base"
                  type="number"
                  value={value.baseDays}
                  onChange={(v) => update((c) => ({ ...c, baseDays: Number(v) }))}
                  help="Días de trabajo antes de sumar los de cada opción."
                />
                <TextField
                  label="Margen del rango (0-1)"
                  type="number"
                  value={value.rangeMargin}
                  onChange={(v) => update((c) => ({ ...c, rangeMargin: Number(v) }))}
                  help="0.15 = mostrar ±15% alrededor del precio calculado."
                />
                <TextField
                  label="Símbolo de moneda"
                  value={value.currency}
                  onChange={(v) => update((c) => ({ ...c, currency: v }))}
                />
                <div className="sm:col-span-2">
                  <PricePreview settings={value} />
                </div>
              </Section>

              <Section title="Descuentos por volumen" description="Se aplica el descuento con el mayor número de opciones que cumpla el cliente.">
                <RepeaterList
                  label="Reglas de descuento"
                  items={value.discounts || []}
                  onChange={(items) => update((c) => ({ ...c, discounts: items }))}
                  empty="Sin descuentos configurados."
                  create={() => ({ minItems: 5, percent: 5, label: "Descuento por proyecto completo" })}
                  render={(item, patch) => (
                    <>
                      <TextField label="Opciones mínimas" type="number" value={item.minItems} onChange={(v) => patch({ minItems: Number(v) })} />
                      <TextField label="Descuento (%)" type="number" value={item.percent} onChange={(v) => patch({ percent: Number(v) })} />
                      <TextField label="Texto mostrado" value={item.label} onChange={(v) => patch({ label: v })} wide />
                    </>
                  )}
                />
              </Section>

              <Section title="Textos del configurador">
                <TextField
                  label="Título antes de pedir los datos"
                  value={value.leadGateTitle}
                  onChange={(v) => update((c) => ({ ...c, leadGateTitle: v }))}
                  wide
                />
                <TextArea
                  label="Subtítulo del paso de datos"
                  value={value.leadGateSubtitle}
                  onChange={(v) => update((c) => ({ ...c, leadGateSubtitle: v }))}
                  rows={2}
                />
                <TextArea
                  label="Nota bajo el resultado"
                  value={value.resultNote}
                  onChange={(v) => update((c) => ({ ...c, resultNote: v }))}
                  rows={3}
                />
              </Section>

              <SaveBar saving={saving} dirty={dirty} onSave={save} onReset={reset} />
            </div>
          )}
        </>
      )}

      {(tab === "pasos" || tab === "opciones") && defs.value && defs.value.length > 1 && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-sm font-semibold text-navy-900">Presupuesto que estás editando</p>
          <div className="flex flex-wrap gap-2">
            {defs.value.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setActiveCalc(d.key)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  activeCalc === d.key
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === "pasos" && (
        <CrudManager
          key={activeCalc}
          resource="calc_groups"
          extraQuery={`&calculator=${activeCalc}`}
          defaults={{ calculator: activeCalc }}
          title="Pasos del configurador"
          description="Cada paso es una pregunta del wizard. El orden aquí es el orden en el que se muestran."
          itemLabel="Paso"
          emptyIcon="calculator"
          onChanged={loadGroups}
          fields={[
            { name: "title", label: "Pregunta", type: "text", required: true, colSpan: 2 },
            { name: "subtitle", label: "Texto de ayuda", type: "textarea" },
            { name: "key", label: "Clave interna", type: "text", required: true, help: "Sin espacios y distinta de cualquier otra. Ej: funcionalidades" },
            { name: "calculator", label: "Presupuesto", type: "text", hideInForm: true },
            {
              name: "type",
              label: "Tipo de selección",
              type: "select",
              options: [
                { value: "single", label: "Una sola opción" },
                { value: "multi", label: "Varias opciones" },
              ],
            },
            { name: "required", label: "Obligatorio", type: "bool", help: "El usuario debe elegir para continuar" },
            { name: "visible", label: "Visible", type: "bool", help: "Mostrar este paso" },
          ]}
          renderRow={(row: Row) => (
            <div>
              <p className="font-semibold text-navy-900">{String(row.title)}</p>
              <p className="text-xs text-slate-500">
                clave: {String(row.key)} · {row.type === "single" ? "una opción" : "varias opciones"} ·{" "}
                {row.required ? "obligatorio" : "opcional"}
              </p>
            </div>
          )}
        />
      )}

      {tab === "opciones" && (
        <>
          <Card className="mb-4 p-4">
            <p className="mb-2 text-sm font-semibold text-navy-900">Paso</p>
            <div className="flex flex-wrap gap-2">
              {calcGroups.length === 0 && (
                <p className="text-sm text-slate-500">Crea primero un paso en la pestaña “Pasos”.</p>
              )}
              {calcGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGroup(g.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    activeGroup === g.id
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>
          </Card>

          {activeGroup && (
            <CrudManager
              key={activeGroup}
              resource="calc_options"
              title="Opciones del paso"
              description="Cada opción suma (o multiplica) sobre el presupuesto y añade días al plazo estimado."
              itemLabel="Opción"
              emptyIcon="calculator"
              extraQuery={`&group_id=${activeGroup}`}
              defaults={{ group_id: activeGroup }}
              fields={[
                { name: "label", label: "Nombre de la opción", type: "text", required: true },
                { name: "price", label: "Precio", type: "number", help: "En multiplicador usa 1.25 para +25%." },
                { name: "description", label: "Descripción", type: "textarea" },
                { name: "price_type", label: "Tipo de precio", type: "select", options: PRICE_TYPES },
                { name: "days", label: "Días de trabajo que añade", type: "number" },
                { name: "group_id", label: "Paso", type: "number", hideInForm: true },
                { name: "visible", label: "Visible", type: "bool", help: "Mostrar esta opción" },
              ]}
              renderRow={(row: Row) => (
                <div>
                  <p className="font-semibold text-navy-900">{String(row.label)}</p>
                  <p className="text-xs text-slate-500">{String(row.description || "")}</p>
                  <p className="mt-1 text-xs font-medium text-brand-600">
                    {row.price_type === "multiplier"
                      ? `x${Number(row.price)}`
                      : row.price_type === "monthly"
                        ? `${formatMoney(Number(row.price))}/mes`
                        : formatMoney(Number(row.price))}
                    {Number(row.days) > 0 ? ` · +${Number(row.days)} días` : ""}
                  </p>
                </div>
              )}
            />
          )}
        </>
      )}
    </>
  );
}

function PricePreview({ settings }: { settings: CalcSettings }) {
  const example = Math.max(settings.minPrice, settings.basePrice + 900);
  const min = Math.round((example * (1 - settings.rangeMargin)) / 10) * 10;
  const max = Math.round((example * (1 + settings.rangeMargin)) / 10) * 10;
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
      <span className="font-semibold text-navy-900">Vista previa: </span>
      un proyecto que sume {formatMoney(example, settings.currency)} se mostraría como{" "}
      <strong className="text-navy-900">
        {formatMoney(min, settings.currency)} - {formatMoney(max, settings.currency)}
      </strong>
      .
    </div>
  );
}
