"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ToastProvider } from "./Toast";

const NAV = [
  { group: "General", items: [{ href: "/admin", label: "Dashboard", icon: "chart" }] },
  {
    group: "Comercial",
    items: [
      { href: "/admin/leads", label: "Leads", icon: "users" },
      { href: "/admin/clientes", label: "Clientes", icon: "briefcase" },
      { href: "/admin/presupuestos", label: "Presupuestos", icon: "file" },
      { href: "/admin/mensajes", label: "Mensajes", icon: "inbox" },
    ],
  },
  {
    group: "Web",
    items: [
      { href: "/admin/servicios", label: "Servicios", icon: "layout" },
      { href: "/admin/calculadora", label: "Calculadora", icon: "calculator" },
      { href: "/admin/portfolio", label: "Portfolio", icon: "image" },
      { href: "/admin/testimonios", label: "Testimonios", icon: "quote" },
      { href: "/admin/faq", label: "FAQ", icon: "help" },
      { href: "/admin/contenido", label: "Contenido", icon: "edit" },
      { href: "/admin/media", label: "Media", icon: "image" },
    ],
  },
  {
    group: "Ajustes",
    items: [
      { href: "/admin/seo", label: "SEO", icon: "globe" },
      { href: "/admin/configuracion", label: "Configuración", icon: "settings" },
    ],
  },
];

export function AdminShell({
  children,
  user,
  brandName,
  initials,
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
  brandName: string;
  initials: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  const current = NAV.flatMap((g) => g.items).find(
    (i) => i.href === pathname || (i.href !== "/admin" && pathname.startsWith(i.href)),
  );

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-slate-50">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[264px] transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white">
              {initials || brandName.charAt(0)}
            </span>
            <span className="font-display text-[15px] font-bold text-navy-900">{brandName}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto text-slate-400 lg:hidden"
              aria-label="Cerrar menú"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <nav className="h-[calc(100dvh-4rem-72px)] overflow-y-auto px-3 py-4">
            {NAV.map((group) => (
              <div key={group.group} className="mb-5">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{group.group}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                          }`}
                        >
                          <Icon name={item.icon} size={18} className={active ? "text-brand-600" : "text-slate-400"} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-slate-100 p-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-navy-900">{user.name || "Administrador"}</p>
                <p className="truncate text-[11px] text-slate-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <Icon name="logout" size={17} />
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Contenido */}
        <div className="lg:pl-[264px]">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-navy-800 lg:hidden"
              aria-label="Abrir menú"
            >
              <Icon name="menu" size={18} />
            </button>
            <h1 className="font-display text-[17px] font-bold text-navy-900">{current?.label ?? "Panel"}</h1>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/" target="_blank" className="btn-secondary btn-sm">
                <Icon name="globe" size={15} /> <span className="hidden sm:inline">Ver la web</span>
              </Link>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
