import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import { getContent } from "@/lib/content";
import { QuoteDocument, type QuoteDocData } from "@/components/site/QuoteDocument";
import { PrintBar } from "@/components/site/PrintBar";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ publicId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { publicId } = await params;
  return {
    title: `Presupuesto ${publicId}`,
    // El documento contiene datos personales: nunca debe indexarse.
    robots: { index: false, follow: false, nocache: true },
  };
}

type QuoteRow = {
  public_id: string;
  project_type: string;
  summary: string;
  price_min: number;
  price_max: number;
  monthly: number;
  days_min: number;
  days_max: number;
  final_amount: number;
  doc_reference: string;
  created_at: string;
  name: string | null;
  surname: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
};

export default async function DocumentoPresupuesto({ params }: Params) {
  const { publicId } = await params;

  const quote = await queryOne<QuoteRow>(
    `SELECT q.*, l.name, l.surname, l.company, l.email, l.phone, l.city
     FROM quotes q LEFT JOIN leads l ON l.id = q.lead_id
     WHERE q.public_id = ?`,
    [publicId],
  );
  if (!quote) notFound();

  const [company, site] = await Promise.all([getContent("company"), getContent("site")]);

  let summary: QuoteDocData["summary"] = [];
  try {
    summary = JSON.parse(quote.summary || "[]");
  } catch {
    summary = [];
  }

  const isEstimate = !quote.final_amount;
  const base = quote.final_amount || Math.round((quote.price_min + quote.price_max) / 2 / 10) * 10;

  const data: QuoteDocData = {
    reference: quote.doc_reference || quote.public_id,
    date: new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(quote.created_at),
    ),
    paymentTerms: company.paymentTerms,
    client: {
      name: `${quote.name ?? ""} ${quote.surname ?? ""}`.trim() || "Cliente",
      company: quote.company ?? "",
      taxId: "",
      addressLines: [quote.city ?? ""],
      email: quote.email ?? "",
      phone: quote.phone ?? "",
    },
    projectType: quote.project_type,
    summary,
    base,
    isEstimate,
    priceMin: quote.price_min,
    priceMax: quote.price_max,
    monthly: quote.monthly,
    daysMin: quote.days_min,
    daysMax: quote.days_max,
  };

  return (
    <main className="min-h-dvh bg-mist py-8 print:bg-white print:py-0">
      <PrintBar reference={data.reference} />
      <div className="mx-auto max-w-[860px] px-4 print:max-w-none print:px-0">
        <div className="overflow-hidden rounded-xl bg-white shadow-card print:rounded-none print:shadow-none">
          <QuoteDocument data={data} company={company} site={site} />
        </div>
      </div>
    </main>
  );
}
