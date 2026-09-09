"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/servicios" },
  { label: "Cómo trabajamos", href: "/#proceso" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Reseñas", href: "/#resenas" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contacto", href: "/#contacto" },
];

export function Header({ brandName, initials, logo = "" }: { brandName: string; initials: string; logo?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isHome) return;
    const ids = ["inicio", "servicios", "proceso", "portfolio", "resenas", "faq", "contacto"];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [isHome]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 print:hidden ${
        scrolled ? "border-b border-slate-200/80 bg-white/85 backdrop-blur-xl" : "border-b border-transparent bg-white/0"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Link href="/#inicio" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {logo ? (
            <Image src={logo} alt={brandName} width={140} height={36} className="h-9 w-auto object-contain" priority />
          ) : (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,.9)]">
                {initials || brandName.charAt(0)}
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight text-navy-900">{brandName}</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV.map((item) => {
            const id = item.href.split("#")[1] ?? "";
            // Fuera de la portada el elemento activo lo marca la ruta, no el scroll.
            const isActive = isHome
              ? active === id
              : item.href !== "/#inicio" && pathname.startsWith(item.href.split("#")[0]);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-100 text-navy-900" : "text-slate-600 hover:text-navy-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/presupuesto" className="btn-primary btn-sm">
            Solicitar presupuesto
            <Icon name="arrow" size={16} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-navy-800 lg:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`fixed inset-x-0 top-[72px] bottom-0 origin-top bg-white transition-all duration-300 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <div className="container-x flex h-full flex-col pb-8 pt-4">
            <nav className="flex flex-col" aria-label="Navegación móvil">
              {NAV.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: `${open ? i * 35 : 0}ms` }}
                  className={`border-b border-slate-100 py-4 text-lg font-semibold text-navy-900 transition-all duration-300 ${
                    open ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-3 pt-6">
              <Link href="/presupuesto" onClick={() => setOpen(false)} className="btn-primary w-full">
                Solicitar presupuesto
              </Link>
              <Link href="/#contacto" onClick={() => setOpen(false)} className="btn-secondary w-full">
                Hablar con nosotros
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
