import { getSetting } from "./db";

export type SiteInfo = {
  brandName: string;
  brandInitials: string;
  logo: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  schedule: string;
  social: { label: string; url: string }[];
  currency: string;
};

export type Seo = {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  favicon: string;
  siteUrl: string;
  twitter: string;
  indexable: boolean;
};

export type Hero = {
  image: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  bullets: string[];
};

export type TrustSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { title: string; text: string; icon: string }[];
  stats: { value: string; label: string }[];
};

export type StepsSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: { number: string; title: string; text: string }[];
};

export type SectionCopy = { eyebrow: string; title: string; subtitle: string };

export type ReviewsSection = SectionCopy & {
  showSummary: boolean;
  highlightValue: string;
  highlightLabel: string;
};

export type CtaSection = { title: string; subtitle: string; button: string; secondary: string };

export type FooterContent = {
  description: string;
  copyright: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
};

export type LegalContent = { privacy: string; cookies: string; legal: string };

export const DEFAULTS = {
  site: {
    brandName: "Nova Studio",
    brandInitials: "N",
    logo: "",
    tagline: "Estudio de diseño y desarrollo web",
    email: "hola@novastudio.es",
    phone: "+34 623 41 27 96",
    whatsapp: "+34623412796",
    address: "Barcelona, España",
    schedule: "Lunes a viernes, 9:00 - 18:00",
    social: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "Instagram", url: "https://instagram.com" },
    ],
    currency: "€",
  } satisfies SiteInfo,

  seo: {
    title: "Nova Studio | Diseño y desarrollo de páginas web profesionales",
    description:
      "Creamos páginas web modernas, rápidas y orientadas a conversión para empresas, autónomos y negocios. Calcula tu presupuesto en 2 minutos.",
    keywords: "diseño web, páginas web para empresas, desarrollo web, tienda online, landing page",
    ogImage: "",
    favicon: "",
    siteUrl: "https://www.novastudio.es",
    twitter: "",
    indexable: true,
  } satisfies Seo,

  hero: {
    image: "",
    badge: "Disponibilidad para nuevos proyectos",
    title: "Webs profesionales que convierten",
    highlight: "visitas en clientes",
    subtitle:
      "Creamos páginas web modernas, rápidas y diseñadas para ayudar a tu negocio a crecer. Sin tecnicismos, sin sorpresas y con un presupuesto claro desde el primer día.",
    primaryCta: "Crear mi presupuesto",
    secondaryCta: "Ver cómo trabajamos",
    bullets: ["Presupuesto en 2 minutos", "Diseño a medida", "Soporte cercano"],
  } satisfies Hero,

  trust: {
    eyebrow: "Por qué importa",
    title: "Una web profesional es mucho más que una página bonita",
    subtitle:
      "Cada detalle está pensado para que tu negocio transmita confianza, aparezca en Google y convierta a quien te visita en un cliente real.",
    items: [
      { title: "Diseño profesional", text: "Una identidad visual cuidada que posiciona tu negocio por encima de la competencia.", icon: "sparkles" },
      { title: "Adaptada a móvil", text: "Diseñamos primero para móvil, donde está la mayoría de tus visitas.", icon: "smartphone" },
      { title: "Optimizada para velocidad", text: "Cada segundo cuenta: webs ligeras que cargan al instante.", icon: "zap" },
      { title: "SEO básico incluido", text: "Estructura, metadatos y contenido preparados para buscadores.", icon: "search" },
      { title: "Seguridad", text: "Certificado SSL, buenas prácticas y protección de formularios.", icon: "shield" },
      { title: "Experiencia de usuario", text: "Navegación clara para que nadie se pierda por el camino.", icon: "compass" },
      { title: "Orientada a conversión", text: "Llamadas a la acción estratégicas en cada sección.", icon: "target" },
      { title: "Acompañamiento", text: "Te explicamos cada paso en un lenguaje que se entiende.", icon: "handshake" },
    ],
    stats: [
      { value: "100%", label: "Diseño a medida" },
      { value: "2 min", label: "Para tener tu presupuesto" },
      { value: "0 €", label: "Coste de la primera consulta" },
    ],
  } satisfies TrustSection,

  servicesCopy: {
    eyebrow: "Servicios",
    title: "Todo lo que tu negocio necesita para vender online",
    subtitle: "Elige el punto de partida. Nosotros nos encargamos del resto, de principio a fin.",
  } satisfies SectionCopy,

  steps: {
    eyebrow: "Cómo trabajamos",
    title: "Un proceso simple y transparente",
    subtitle: "Cuatro pasos, cero sorpresas. Siempre sabrás en qué punto está tu proyecto.",
    steps: [
      { number: "01", title: "Cuéntanos tu proyecto", text: "Nos explicas qué necesitas y a quién quieres llegar. Sin tecnicismos." },
      { number: "02", title: "Calculamos tu presupuesto", text: "Usa nuestro creador de presupuestos y recibe una estimación personalizada al momento." },
      { number: "03", title: "Diseñamos y desarrollamos", text: "Creamos el diseño, lo validamos contigo y construimos tu web." },
      { number: "04", title: "Publicamos y te acompañamos", text: "Ponemos tu web online y seguimos a tu lado con soporte y mantenimiento." },
    ],
  } satisfies StepsSection,

  portfolioCopy: {
    eyebrow: "Portfolio",
    title: "Proyectos que hablan por nosotros",
    subtitle: "Una selección de trabajos y del tipo de resultado que puedes esperar.",
  } satisfies SectionCopy,

  reviewsCopy: {
    eyebrow: "Reseñas",
    title: "Lo que opinan quienes ya han trabajado con nosotros",
    subtitle: "Opiniones reales de clientes, recogidas tras entregar cada proyecto.",
    showSummary: true,
    highlightValue: "+200",
    highlightLabel: "servicios realizados",
  } satisfies ReviewsSection,

  testimonialsCopy: {
    eyebrow: "Testimonios",
    title: "Lo que dicen de trabajar con nosotros",
    subtitle: "Relaciones largas construidas sobre resultados y comunicación clara.",
  } satisfies SectionCopy,

  faqCopy: {
    eyebrow: "Preguntas frecuentes",
    title: "Resolvemos tus dudas",
    subtitle: "Y si queda alguna en el aire, escríbenos: respondemos rápido.",
  } satisfies SectionCopy,

  contactCopy: {
    eyebrow: "Contacto",
    title: "Hablemos de tu proyecto",
    subtitle: "Cuéntanos qué necesitas y te respondemos en menos de 24 horas laborables.",
  } satisfies SectionCopy,

  cta: {
    title: "¿Listo para llevar tu negocio al siguiente nivel?",
    subtitle: "Cuéntanos tu proyecto y descubre en 2 minutos cuánto podría costar tu nueva web.",
    button: "Crear mi presupuesto",
    secondary: "Hablar con nosotros",
  } satisfies CtaSection,

  footer: {
    description: "Estudio digital especializado en páginas web profesionales para empresas, autónomos y negocios locales.",
    copyright: "Todos los derechos reservados.",
    columns: [
      {
        title: "Navegación",
        links: [
          { label: "Inicio", href: "/#inicio" },
          { label: "Servicios", href: "/#servicios" },
          { label: "Cómo trabajamos", href: "/#proceso" },
          { label: "Portfolio", href: "/#portfolio" },
          { label: "Reseñas", href: "/#resenas" },
          { label: "FAQ", href: "/#faq" },
        ],
      },
      {
        title: "Servicios",
        links: [
          { label: "Web corporativa", href: "/#servicios" },
          { label: "Landing page", href: "/#servicios" },
          { label: "Tienda online", href: "/#servicios" },
          { label: "Rediseño web", href: "/#servicios" },
          { label: "Mantenimiento", href: "/#servicios" },
        ],
      },
    ],
  } satisfies FooterContent,

  legal: {
    privacy:
      "## Política de privacidad\n\nEsta política explica cómo tratamos los datos que nos facilitas a través de los formularios de esta web.\n\n**Responsable:** completa aquí la razón social, NIF y dirección.\n\n**Finalidad:** gestionar tu solicitud de presupuesto o de información y mantener el contacto comercial derivado de la misma.\n\n**Legitimación:** consentimiento del interesado al enviar el formulario.\n\n**Conservación:** los datos se conservan mientras exista interés mutuo o hasta que solicites su supresión.\n\n**Destinatarios:** no se ceden datos a terceros salvo obligación legal o proveedores tecnológicos necesarios para prestar el servicio.\n\n**Derechos:** puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a nuestro email de contacto.\n\n> Texto de ejemplo editable desde el panel de administración. Revísalo con un asesor legal antes de publicar.",
    cookies:
      "## Política de cookies\n\nEsta web utiliza únicamente las cookies técnicas necesarias para su funcionamiento y para mantener la sesión del panel de administración.\n\n**Cookies técnicas:** imprescindibles para la navegación y la autenticación. No requieren consentimiento.\n\n**Cookies analíticas o de marketing:** actualmente no se utilizan. Si en el futuro se incorporan, se solicitará tu consentimiento previo.\n\nPuedes bloquear o eliminar las cookies desde la configuración de tu navegador.\n\n> Texto de ejemplo editable desde el panel de administración.",
    legal:
      "## Aviso legal\n\n**Titular del sitio web:** completa aquí la razón social o nombre del profesional.\n\n**NIF / CIF:** pendiente de completar.\n\n**Domicilio:** pendiente de completar.\n\n**Email de contacto:** el indicado en la sección de contacto.\n\n**Condiciones de uso:** el acceso a este sitio implica la aceptación de las presentes condiciones. Los contenidos, textos y elementos gráficos son titularidad de la empresa salvo indicación en contrario.\n\n**Responsabilidad:** no se garantiza la ausencia de interrupciones o errores en el acceso, si bien se emplean los medios razonables para evitarlos.\n\n> Texto de ejemplo editable desde el panel de administración.",
  } satisfies LegalContent,

  calculator: {
    enabled: true,
    basePrice: 0,
    baseDays: 5,
    rangeMargin: 0.15,
    minPrice: 300,
    currency: "€",
    leadGateTitle: "Ya tenemos todo lo necesario para calcular tu proyecto",
    leadGateSubtitle: "Déjanos tus datos y te mostramos tu estimación personalizada al instante.",
    resultNote:
      "Esta estimación es orientativa y se confirma tras una llamada de 15 minutos en la que revisamos los detalles de tu proyecto.",
    discounts: [] as { minItems: number; percent: number; label: string }[],
  },
};

export type ContentKey = keyof typeof DEFAULTS;

export function getContent<K extends ContentKey>(key: K): Promise<(typeof DEFAULTS)[K]> {
  return getSetting(key, DEFAULTS[key]);
}
