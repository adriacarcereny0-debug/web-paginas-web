import { query } from "./db";
import { getContent, type CalculatorDef } from "./content";

export type CalcOption = {
  id: number;
  group_id: number;
  label: string;
  description: string;
  icon: string;
  price: number;
  price_type: "fixed" | "multiplier" | "monthly" | "per_page";
  days: number;
  sort_order: number;
  visible: number;
};

export type CalcGroup = {
  id: number;
  calculator: string;
  key: string;
  title: string;
  subtitle: string;
  type: "single" | "multi";
  required: number;
  sort_order: number;
  visible: number;
  options: CalcOption[];
};

/** Pasos de un presupuesto concreto. Sin `calculator` devuelve los de todos. */
export async function getCalculatorConfig(calculator?: string, includeHidden = false): Promise<CalcGroup[]> {
  const where: string[] = [];
  const args: unknown[] = [];
  if (!includeHidden) where.push("visible = 1");
  if (calculator) {
    where.push("calculator = ?");
    args.push(calculator);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [groups, options] = await Promise.all([
    query<Omit<CalcGroup, "options">>(`SELECT * FROM calc_groups ${whereSql} ORDER BY sort_order, id`, args),
    query<CalcOption>(
      `SELECT * FROM calc_options ${includeHidden ? "" : "WHERE visible = 1"} ORDER BY sort_order, id`,
    ),
  ]);
  return groups.map((g) => ({ ...g, options: options.filter((o) => o.group_id === g.id) }));
}

/** Definición de un presupuesto, con sus precios propios. */
export async function getCalculatorDef(key: string): Promise<CalculatorDef | undefined> {
  const list = await getContent("calculators");
  return list.find((c) => c.key === key);
}

export type Selections = Record<string, number[]>; // group key -> option ids

export type QuoteResult = {
  valid: boolean;
  errors: string[];
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

/**
 * Single source of truth for pricing. Used by the API (authoritative) and,
 * with the same config payload, by the client for the live preview.
 */
export async function computeQuote(
  selections: Selections,
  groups: CalcGroup[],
  def?: CalculatorDef,
): Promise<QuoteResult> {
  const global = await getContent("calculator");
  // Los importes de partida salen del presupuesto concreto; el resto de reglas
  // (moneda, descuentos) son comunes a todos.
  const cfg = {
    ...global,
    basePrice: def ? def.basePrice : global.basePrice,
    baseDays: def ? def.baseDays : global.baseDays,
    minPrice: def ? def.minPrice : global.minPrice,
    rangeMargin: def ? def.rangeMargin : global.rangeMargin,
  };
  const errors: string[] = [];
  let base = Number(cfg.basePrice) || 0;
  let monthly = 0;
  let days = Number(cfg.baseDays) || 0;
  let multiplier = 1;
  let selectedCount = 0;
  const summary: QuoteResult["summary"] = [];
  let projectType = "";

  for (const g of groups) {
    const chosen = (selections[g.key] || []).filter((id) => g.options.some((o) => o.id === id));
    if (g.required && chosen.length === 0) errors.push(`Selecciona una opción en "${g.title}"`);
    if (g.type === "single" && chosen.length > 1) errors.push(`Solo puedes elegir una opción en "${g.title}"`);
    const items: { label: string; price: number; priceType: string }[] = [];
    for (const id of chosen) {
      const opt = g.options.find((o) => o.id === id)!;
      selectedCount += 1;
      if (opt.price_type === "multiplier") multiplier *= opt.price || 1;
      else if (opt.price_type === "monthly") monthly += opt.price;
      else base += opt.price;
      days += opt.days || 0;
      items.push({ label: opt.label, price: opt.price, priceType: opt.price_type });
      if (g.sort_order === 0 && !projectType) projectType = opt.label;
    }
    if (items.length) summary.push({ group: g.title, groupKey: g.key, items });
  }

  let total = base * multiplier;

  const discounts = [...(cfg.discounts || [])].sort((a, b) => b.minItems - a.minItems);
  const applicable = discounts.find((d) => selectedCount >= d.minItems);
  let discount: QuoteResult["discount"] = null;
  if (applicable && applicable.percent > 0) {
    const amount = (total * applicable.percent) / 100;
    total -= amount;
    discount = { percent: applicable.percent, label: applicable.label, amount };
  }

  if (cfg.minPrice && total < cfg.minPrice) total = cfg.minPrice;

  const margin = Number(cfg.rangeMargin) || 0;
  const round = (n: number) => Math.max(0, Math.round(n / 10) * 10);

  return {
    valid: errors.length === 0,
    errors,
    priceMin: round(total * (1 - margin)),
    priceMax: round(total * (1 + margin)),
    monthly: Math.round(monthly),
    daysMin: Math.max(1, Math.round(days * 0.85)),
    daysMax: Math.max(2, Math.round(days * 1.25)),
    currency: cfg.currency || "€",
    discount,
    summary,
    projectType,
  };
}
