import { Icon } from "@/components/ui/Icon";

/** Composición visual premium (100% CSS/SVG, sin imágenes pesadas). */
export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-100/70 via-white to-sky-100/60 blur-2xl" />

      {/* Ventana de navegador */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-md bg-white px-2.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200">
            tunegocio.es
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded-full bg-navy-900/85" />
              <div className="h-2 w-40 rounded-full bg-slate-200" />
              <div className="h-2 w-32 rounded-full bg-slate-200" />
            </div>
            <div className="h-7 w-20 rounded-full bg-brand-600" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="h-6 w-6 rounded-lg bg-brand-100" />
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200" />
                <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-end justify-between gap-1.5">
              {[38, 58, 46, 72, 64, 88, 78].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-100 to-brand-500"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta flotante: presupuesto */}
      <div className="absolute -bottom-8 -left-4 w-[220px] rounded-2xl border border-slate-200 bg-white p-4 shadow-card animate-float sm:-left-10">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Icon name="calculator" size={14} /> Presupuesto
        </div>
        <p className="mt-2 font-display text-2xl font-extrabold text-navy-900">1.250 €</p>
        <p className="text-[11px] text-slate-500">Estimación en 2 minutos</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-sky-400" />
        </div>
      </div>

      {/* Tarjeta flotante: móvil */}
      <div
        className="absolute -right-3 top-16 w-[130px] rounded-2xl border border-slate-200 bg-white p-3 shadow-card animate-float sm:-right-8"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="rounded-xl bg-navy-900 p-2.5">
          <div className="h-1.5 w-8 rounded-full bg-white/40" />
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-white/20" />
            <div className="h-1.5 w-3/4 rounded-full bg-white/20" />
          </div>
          <div className="mt-2.5 h-4 w-12 rounded-full bg-brand-500" />
        </div>
        <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">100% responsive</p>
      </div>
    </div>
  );
}
