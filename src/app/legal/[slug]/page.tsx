import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { markdownToBlocks } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const dynamic = "force-dynamic";

const MAP = {
  privacidad: { key: "privacy" as const, title: "Política de privacidad" },
  cookies: { key: "cookies" as const, title: "Política de cookies" },
  "aviso-legal": { key: "legal" as const, title: "Aviso legal" },
};

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = MAP[slug as keyof typeof MAP];
  return { title: entry?.title ?? "Legal", robots: { index: false, follow: true } };
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const entry = MAP[slug as keyof typeof MAP];
  if (!entry) notFound();

  const [site, legal, footer] = await Promise.all([getContent("site"), getContent("legal"), getContent("footer")]);
  const blocks = markdownToBlocks(legal[entry.key] || "");

  return (
    <>
      <Header brandName={site.brandName} initials={site.brandInitials} />
      <main className="bg-white pt-[72px]">
        <div className="container-x max-w-3xl py-16 lg:py-20">
          <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
            ← Volver al inicio
          </Link>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-[-0.02em] text-navy-900">{entry.title}</h1>
          <div className="prose-legal mt-10">
            {blocks.map((b, i) => {
              if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
              if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
              if (b.type === "quote") return <blockquote key={i}>{b.text}</blockquote>;
              if (b.type === "ul")
                return (
                  <ul key={i}>
                    {b.items.map((it, j) => (
                      <li key={j}>{renderInline(it)}</li>
                    ))}
                  </ul>
                );
              return <p key={i}>{renderInline(b.text!)}</p>;
            })}
          </div>
        </div>
      </main>
      <Footer site={site} footer={footer} />
    </>
  );
}

/** Soporta únicamente **negrita** — sin HTML arbitrario. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-navy-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
