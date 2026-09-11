import { formatAmount } from "@/lib/utils";
import type { CompanyInfo, SiteInfo } from "@/lib/content";

export type QuoteDocData = {
  reference: string;
  date: string;
  paymentTerms: string;
  client: { name: string; company: string; taxId: string; addressLines: string[]; email: string; phone: string };
  projectType: string;
  summary: { group: string; items: { label: string; priceType: string }[] }[];
  base: number;
  isEstimate: boolean;
  priceMin: number;
  priceMax: number;
  monthly: number;
  daysMin: number;
  daysMax: number;
};

/**
 * Documento de presupuesto en formato imprimible.
 * Todos los datos de la empresa salen del panel: no hay nada fijo en el código.
 */
export function QuoteDocument({
  data,
  company,
  site,
}: {
  data: QuoteDocData;
  company: CompanyInfo;
  site: SiteInfo;
}) {
  const vat = (data.base * company.vatRate) / 100;
  const total = data.base + vat;
  const legalName = company.legalName || site.brandName;

  const description = buildDescription(data);

  return (
    <div className="doc mx-auto w-full max-w-[820px] bg-white p-8 text-[11px] leading-[1.45] text-black sm:p-12">
      {/* Cabecera */}
      <header className="grid gap-6 sm:grid-cols-[1fr_1.15fr] sm:items-start">
        <div>
          {site.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logo} alt={legalName} className="mb-3 h-12 w-auto object-contain" />
          )}
          <h1 className="font-display text-[34px] font-extrabold leading-none tracking-[-0.02em] sm:text-[42px]">
            PRESUPUESTO
          </h1>
          <p className="mt-2 text-[12px] font-bold">{legalName}</p>
          {company.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {company.taxId && <p>NIF: {company.taxId}</p>}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="whitespace-nowrap border border-black px-3 py-2 text-left text-[12px] font-bold">Nº Presupuesto</th>
              <th className="border border-black px-3 py-2 text-left text-[12px] font-bold">Fecha</th>
              <th className="border border-black px-3 py-2 text-left text-[12px] font-bold">Forma de pago</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="whitespace-nowrap border border-black px-3 py-4 align-top">{data.reference}</td>
              <td className="border border-black px-3 py-4 align-top">{data.date}</td>
              <td className="border border-black px-3 py-4 align-top">{data.paymentTerms}</td>
            </tr>
          </tbody>
        </table>
      </header>

      {/* Cliente */}
      <section className="doc-gap mt-10 sm:w-[62%] sm:pl-[24%]">
        <div className="bg-black px-4 py-2 text-[13px] font-bold text-white">Cliente:</div>
        <div className="border border-t-0 border-black px-4 py-3">
          <p>{data.client.name}</p>
          {data.client.company && <p>{data.client.company}</p>}
          {data.client.taxId && <p>NIF/DNI: {data.client.taxId}</p>}
          {data.client.addressLines.filter(Boolean).map((l) => (
            <p key={l}>{l}</p>
          ))}
          {data.client.email && <p>{data.client.email}</p>}
          {data.client.phone && <p>{data.client.phone}</p>}
        </div>
      </section>

      {/* Concepto */}
      <table className="doc-gap mt-8 w-full border-collapse">
        <thead>
          <tr className="bg-black text-white">
            <th className="w-[70px] border border-black px-3 py-2 text-left text-[12px] font-bold">Ref.</th>
            <th className="border border-black px-3 py-2 text-left text-[12px] font-bold">Descripción</th>
            <th className="w-[52px] border border-black px-3 py-2 text-left text-[12px] font-bold">Unid.</th>
            <th className="w-[86px] border border-black px-3 py-2 text-left text-[12px] font-bold">Precio unit.</th>
            <th className="w-[86px] border border-black px-3 py-2 text-left text-[12px] font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-3 py-3 align-top font-bold">WEB-01</td>
            <td className="border border-black px-3 py-3 align-top">
              <p className="font-semibold">{description.title}</p>
              <p>{description.intro}</p>
              <div className="mt-2 space-y-1.5">
                {description.blocks.map((b) => (
                  <p key={b.label}>
                    <span className="font-semibold">{b.label}:</span> {b.text}
                  </p>
                ))}
              </div>
            </td>
            <td className="border border-black px-3 py-3 text-right align-top">1</td>
            <td className="border border-black px-3 py-3 text-right align-top">{formatAmount(data.base)}</td>
            <td className="border border-black px-3 py-3 text-right align-top">{formatAmount(data.base)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totales */}
      <div className="doc-gap mt-6 flex justify-end">
        <table className="w-full border-collapse sm:w-[62%]">
          <tbody>
            <tr>
              <td className="border border-black px-4 py-2 font-bold">Base imponible</td>
              <td className="border border-black px-4 py-2 text-right">{formatAmount(data.base)}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-2">% IVA</td>
              <td className="border border-black px-4 py-2 text-right">
                {company.vatRate.toFixed(2).replace(".", ",")}%
              </td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-2 font-bold">Total IVA</td>
              <td className="border border-black px-4 py-2 text-right">{formatAmount(vat)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-black px-4 py-3 text-[16px] font-extrabold">TOTAL PRESUPUESTO</td>
              <td className="border border-black px-4 py-3 text-right text-[16px] font-extrabold">
                {formatAmount(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.monthly > 0 && (
        <p className="doc-gap mt-3 text-right text-[11px]">
          Servicios recurrentes aparte: <strong>{formatAmount(data.monthly)}/mes</strong> (IVA no incluido).
        </p>
      )}

      {/* Condiciones */}
      <section className="doc-gap mt-8 border border-black px-4 py-3">
        {conditionLines(company, data).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      {company.showBankDetails && company.iban && (
        <section className="doc-gap mt-4 border border-black px-4 py-3">
          <p>Para pagos por transferencia bancaria, efectuar el pago a la cuenta de {legalName}.</p>
          <p>
            {company.bankName ? `${company.bankName} · ` : ""}
            IBAN: {company.iban}
          </p>
        </section>
      )}

      {/* Aceptación */}
      <section className="doc-gap mt-4 flex border border-black">
        <div className="w-[110px] shrink-0 border-r border-black px-4 py-4 font-bold">Descripción</div>
        <div className="flex-1 px-4 py-4">
          Presupuesto para {data.projectType ? data.projectType.toLowerCase() : "el proyecto descrito"}, según el
          alcance detallado en este documento.
        </div>
        <div className="w-[190px] shrink-0 border-l border-black px-4 py-4">
          <p>X</p>
          <p className="mt-6">{data.date}</p>
          <p className="text-[10px]">Presupuesto válido {company.validityDays} días</p>
        </div>
      </section>

      <footer className="doc-gap mt-8 flex items-center justify-between border-t border-slate-300 pt-3 text-[10px] text-slate-500">
        <span>
          {legalName}
          {company.documentFooter ? ` · ${company.documentFooter}` : ` · Presupuesto ${data.reference}`}
        </span>
        <span>Página 1</span>
      </footer>
    </div>
  );
}

function buildDescription(data: QuoteDocData) {
  const blocks = data.summary
    .filter((b) => b.items.length > 0)
    .map((b) => ({
      label: b.group.replace(/^¿|\?$/g, "").replace(/^./, (c) => c.toUpperCase()),
      text: b.items
        .map((i) => (i.priceType === "monthly" ? `${i.label} (mensual)` : i.label))
        .join("; "),
    }));

  return {
    title: `Diseño y desarrollo web · ${data.projectType || "Proyecto a medida"}`,
    intro:
      "Proyecto web profesional: diseño adaptado a la identidad del negocio, desarrollo responsive para móvil, tablet y ordenador, y publicación con configuración inicial para buscadores.",
    blocks,
  };
}

function conditionLines(company: CompanyInfo, data: QuoteDocData) {
  const lines = [...company.conditions];
  lines[0] = `El presente presupuesto tiene una validez de ${company.validityDays} días naturales a partir de la fecha indicada.`;
  if (data.daysMax > 0) {
    lines.push(
      `Plazo estimado de entrega: entre ${data.daysMin} y ${data.daysMax} días laborables desde el inicio del proyecto.`,
    );
  }
  if (data.isEstimate) {
    lines.push(
      `Importe orientativo calculado con el configurador de la web (rango estimado de ${formatAmount(data.priceMin)} a ${formatAmount(data.priceMax)}, IVA no incluido). Se confirma tras revisar el detalle del proyecto.`,
    );
  }
  return lines;
}
