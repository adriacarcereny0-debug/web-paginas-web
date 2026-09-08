import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acceso al panel", robots: { index: false, follow: false } };

export default function LoginPage() {
  const site = getContent("site");
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
              {site.brandInitials || site.brandName.charAt(0)}
            </span>
            <span className="font-display text-lg font-bold text-navy-900">{site.brandName}</span>
          </div>
          <h1 className="mt-9 font-display text-3xl font-extrabold tracking-tight text-navy-900">Acceso al panel</h1>
          <p className="mt-2 text-sm text-slate-600">Introduce tus credenciales para gestionar la web.</p>
          <LoginForm />
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-navy-900 lg:block">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -left-20 top-10 h-96 w-96 rounded-full bg-brand-600/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/20 blur-[120px]" />
        </div>
        <div className="relative flex h-full flex-col justify-center px-14">
          <p className="max-w-md font-display text-3xl font-bold leading-tight text-white">
            Gestiona leads, presupuestos y todo el contenido de la web desde un único lugar.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {["Leads y presupuestos centralizados", "Contenido editable sin tocar código", "Precios del calculador configurables"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-brand-300">✓</span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
