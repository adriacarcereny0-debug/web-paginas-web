import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "nova_session";

/**
 * Comprobación rápida de sesión para rutas del panel.
 * La verificación criptográfica real se hace en el servidor (layout y rutas de API).
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (hasCookie) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!hasCookie) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
