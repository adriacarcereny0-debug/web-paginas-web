import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-mist px-6">
      <div className="text-center">
        <p className="text-6xl font-semibold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-navy-900">Página no encontrada</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-navy-600">
          La página que buscas no existe o se ha movido. Vuelve al inicio y sigue navegando.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
