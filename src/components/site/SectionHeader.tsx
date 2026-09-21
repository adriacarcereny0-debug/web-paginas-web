import { Reveal } from "@/components/ui/Reveal";

/**
 * Cabecera editorial: filete, índice numerado y título alineado a la izquierda.
 * Sustituye al patrón "píldora + título centrado + subtítulo" repetido en todas
 * las secciones.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
  className = "",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  const muted = light ? "text-white/45" : "text-navy-400";
  const accent = light ? "text-white/70" : "text-brand-600";

  return (
    <div className={`${align === "center" ? "mx-auto max-w-2xl text-center" : ""} ${className}`}>
      {(index || eyebrow) && (
        <Reveal>
          <div
            className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
          >
            {index && <span className={`section-index ${muted}`}>{index}</span>}
            {index && eyebrow && (
              <span aria-hidden className={`h-px w-6 ${light ? "bg-white/20" : "bg-line-strong"}`} />
            )}
            {eyebrow && <span className={`eyebrow ${accent}`}>{eyebrow}</span>}
          </div>
        </Reveal>
      )}

      <Reveal delay={60}>
        <h2
          className={`mt-5 max-w-[20ch] text-[1.9rem] leading-[1.14] tracking-[-0.025em] sm:text-[2.35rem] ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-white" : "text-navy-900"}`}
        >
          {title}
        </h2>
      </Reveal>

      {subtitle && (
        <Reveal delay={110}>
          <p
            className={`mt-4 max-w-[54ch] text-[16px] leading-[1.65] ${align === "center" ? "mx-auto" : ""} ${
              light ? "text-white/60" : "text-navy-600"
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
