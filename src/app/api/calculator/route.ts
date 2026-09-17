import { getCalculatorConfig } from "@/lib/pricing";
import { getContent } from "@/lib/content";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Configuración pública de los presupuestos disponibles.
 * Los precios NO se exponen: el cálculo es siempre autoritativo en el servidor.
 */
export async function GET() {
  const [cfg, defs, allGroups] = await Promise.all([
    getContent("calculator"),
    getContent("calculators"),
    getCalculatorConfig(),
  ]);

  const calculators = defs
    .filter((def) => def.enabled)
    .map((def) => ({
      key: def.key,
      name: def.name,
      description: def.description,
      icon: def.icon,
      resultNote: def.resultNote || cfg.resultNote,
      groups: allGroups
        .filter((g) => g.calculator === def.key)
        .map((g) => ({
          key: g.key,
          title: g.title,
          subtitle: g.subtitle,
          type: g.type,
          required: !!g.required,
          options: g.options.map((o) => ({ id: o.id, label: o.label, description: o.description, icon: o.icon })),
        })),
    }))
    .filter((c) => c.groups.length > 0);

  return ok({
    enabled: cfg.enabled,
    leadGateTitle: cfg.leadGateTitle,
    leadGateSubtitle: cfg.leadGateSubtitle,
    resultNote: cfg.resultNote,
    calculators,
  });
}
