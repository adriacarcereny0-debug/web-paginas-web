import { ImageResponse } from "next/og";
import { DEFAULTS, getContent } from "@/lib/content";

export const alt = "Diseño y desarrollo de páginas web profesionales";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Se genera bajo demanda: en el momento de compilar todavía no hay base de datos.
export const dynamic = "force-dynamic";

/** Imagen de vista previa al compartir el enlace, generada a partir de la marca. */
export default async function OpengraphImage() {
  // Si la base de datos no está disponible se usan los valores por defecto:
  // la imagen social nunca debe hacer fallar la página.
  const site = await getContent("site").catch(() => DEFAULTS.site);
  const seo = await getContent("seo").catch(() => DEFAULTS.seo);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 55%, #0b1524 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(255,255,255,.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            {site.brandInitials || site.brandName.charAt(0)}
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{site.brandName}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 980 }}>
            Webs profesionales que convierten visitas en clientes
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,.75)", maxWidth: 900 }}>
            {site.tagline || seo.description.slice(0, 110)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 24, color: "rgba(255,255,255,.7)" }}>
          {site.email ? <div>{site.email}</div> : null}
          {site.phone ? <div>{site.phone}</div> : null}
        </div>
      </div>
    ),
    size,
  );
}
