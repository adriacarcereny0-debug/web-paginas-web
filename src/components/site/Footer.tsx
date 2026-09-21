import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { FooterContent, SiteInfo } from "@/lib/content";

export function Footer({ site, footer }: { site: SiteInfo; footer: FooterContent }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-900 text-white/70 print:hidden">
      <div className="container-x py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {site.logo ? (
                <>
                  <Image
                    src={site.logo}
                    alt={site.brandName}
                    width={200}
                    height={48}
                    className="h-10 w-auto max-w-[180px] object-contain"
                  />
                  {site.logoLayout === "con-nombre" && (
                    <span className="text-[16px] font-semibold text-white">{site.brandName}</span>
                  )}
                </>
              ) : (
                <>
                  <span className="grid h-8 w-8 place-items-center rounded-[5px] border border-white/25 text-[13px] font-semibold text-white">
                    {site.brandInitials || site.brandName.charAt(0)}
                  </span>
                  <span className="text-[16px] font-semibold text-white">{site.brandName}</span>
                </>
              )}
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">{footer.description}</p>
            {site.social?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {site.social.map((s) => (
                  <a
                    key={s.label + s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="rounded-[4px] border border-white/20 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/50 hover:text-white"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {footer.columns?.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label + l.href}>
                    <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 transition-colors hover:text-white">
                    <Icon name="mail" size={16} /> {site.email}
                  </a>
                </li>
              )}
              {site.phone && (
                <li>
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 transition-colors hover:text-white">
                    <Icon name="phone" size={16} /> {site.phone}
                  </a>
                </li>
              )}
              {site.address && (
                <li className="flex items-center gap-2.5">
                  <Icon name="pin" size={16} /> {site.address}
                </li>
              )}
              {site.schedule && (
                <li className="flex items-center gap-2.5">
                  <Icon name="clock" size={16} /> {site.schedule}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.brandName}. {footer.copyright}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/legal/privacidad" className="transition-colors hover:text-white">
              Política de privacidad
            </Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-white">
              Política de cookies
            </Link>
            <Link href="/legal/aviso-legal" className="transition-colors hover:text-white">
              Aviso legal
            </Link>
            <Link href="/admin" className="transition-colors hover:text-white">
              Acceso panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
