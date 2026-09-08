import { Reveal } from "@/components/ui/Reveal";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <Reveal>
          <span className={light ? "eyebrow border-white/15 bg-white/10 text-brand-100" : "eyebrow"}>{eyebrow}</span>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h2
          className={`mt-4 font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-[2.6rem] sm:leading-[1.12] ${
            light ? "text-white" : "text-navy-900"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={110}>
          <p className={`mt-4 text-[17px] leading-relaxed ${light ? "text-slate-300" : "text-slate-600"}`}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
