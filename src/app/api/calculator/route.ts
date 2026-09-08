import { getCalculatorConfig } from "@/lib/pricing";
import { getContent } from "@/lib/content";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Configuración pública del calculador.
 * Los precios NO se exponen: el cálculo es siempre autoritativo en el servidor.
 */
export async function GET() {
  const [cfg, config] = await Promise.all([getContent("calculator"), getCalculatorConfig()]);
  const groups = config.map((g) => ({
    key: g.key,
    title: g.title,
    subtitle: g.subtitle,
    type: g.type,
    required: !!g.required,
    options: g.options.map((o) => ({ id: o.id, label: o.label, description: o.description, icon: o.icon })),
  }));
  return ok({
    enabled: cfg.enabled,
    leadGateTitle: cfg.leadGateTitle,
    leadGateSubtitle: cfg.leadGateSubtitle,
    resultNote: cfg.resultNote,
    groups,
  });
}
