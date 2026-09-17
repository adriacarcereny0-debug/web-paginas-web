import type { PoolClient } from "pg";
import { hashPassword } from "./password";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@webora.studio").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const ADMIN_PASSWORD_RESET = /^(1|true|yes|si|sí)$/i.test(process.env.ADMIN_PASSWORD_RESET || "");
const ADMIN_NAME = process.env.ADMIN_NAME || "Administrador";

export async function seedIfEmpty(db: PoolClient) {
  const count = async (t: string) => Number((await db.query(`SELECT COUNT(*)::int AS c FROM ${t}`)).rows[0].c);

  // Se crea el administrador indicado por las variables de entorno siempre que no
  // exista todavía. Así, si se añaden ADMIN_EMAIL/ADMIN_PASSWORD después del primer
  // arranque, la cuenta se crea igualmente en lugar de quedarse uno fuera del panel.
  // Nunca se toca la contraseña de un usuario que ya existe.
  const existingAdmin = await db.query("SELECT id FROM users WHERE email = $1", [ADMIN_EMAIL]);
  if (existingAdmin.rows.length === 0) {
    await db.query("INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')", [
      ADMIN_EMAIL,
      hashPassword(ADMIN_PASSWORD),
      ADMIN_NAME,
    ]);
  } else if (ADMIN_PASSWORD_RESET) {
    // Vía de emergencia para recuperar el acceso: con ADMIN_PASSWORD_RESET=1 en las
    // variables de entorno, al arrancar se restablece la contraseña de ADMIN_EMAIL
    // con el valor de ADMIN_PASSWORD. Quita la variable en cuanto puedas entrar.
    await db.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      hashPassword(ADMIN_PASSWORD),
      ADMIN_EMAIL,
    ]);
    console.warn(
      "[seed] ADMIN_PASSWORD_RESET activo: se ha restablecido la contraseña de %s. Elimina la variable de entorno.",
      ADMIN_EMAIL,
    );
  }

  if ((await count("services")) === 0) await seedServices(db);
  if ((await count("faqs")) === 0) await seedFaqs(db);
  if ((await count("projects")) === 0) await seedProjects(db);
  if ((await count("testimonials")) === 0) await seedTestimonials(db);
  if ((await count("reviews")) === 0) await seedReviews(db);
  if ((await count("calc_groups")) === 0) await seedCalculator(db);

  // Estas siembras se comprueban por separado para que también se apliquen sobre
  // bases de datos que ya existían antes de añadir el presupuesto de chatbots.
  const chatbotSteps = await db.query("SELECT 1 FROM calc_groups WHERE calculator = 'chatbot' LIMIT 1");
  if (chatbotSteps.rows.length === 0) await seedChatbotCalculator(db);
  await seedChatbotServices(db);
}

export async function seedServices(db: PoolClient) {
  const rows: [string, string, string, string, number, string, string[], string][] = [
    [
      "Web corporativa",
      "web-corporativa",
      "Para empresas y profesionales que necesitan una presencia online sólida y creíble.",
      "building",
      900,
      "Desde 900 €",
      ["Hasta 6 secciones", "Diseño a medida", "Formulario de contacto", "SEO básico"],
      "Una web corporativa es la carta de presentación de tu empresa: el sitio al que llega quien te busca por tu nombre, quien recibe tu tarjeta o quien te encuentra en Google. Su trabajo es explicar en pocos segundos qué haces, para quién y por qué eres una opción fiable.\n\nPartimos de tu negocio, no de una plantilla. Definimos las secciones que realmente necesitas, escribimos la estructura de cada página pensando en las dudas de tu cliente y diseñamos una identidad visual coherente con tu marca.\n\nCada página se construye con HTML semántico, se optimiza para móvil y se prepara para buscadores: títulos y descripciones propios, imágenes ligeras, datos estructurados y una velocidad de carga cuidada. Al entregarla te formamos para que puedas cambiar textos e imágenes por tu cuenta.",
    ],
    [
      "Landing page",
      "landing-page",
      "Páginas diseñadas con un único objetivo: conseguir contactos o ventas.",
      "target",
      550,
      "Desde 550 €",
      ["Página única de alta conversión", "Copy orientado a resultados", "Integración con analítica", "Test A/B opcional"],
      "Una landing page tiene un solo objetivo: que quien llega haga una acción concreta, ya sea pedir presupuesto, reservar una cita o comprar. Todo lo que no ayude a eso sobra, y por eso se diseña distinto a una web al uso.\n\nTrabajamos el orden de los argumentos, las objeciones que frenan a tu cliente y la llamada a la acción, y lo apoyamos con un diseño que guía la mirada hacia el formulario. Es la mejor opción si vas a invertir en publicidad, porque cada visita cuesta dinero y conviene aprovecharla.\n\nIncluimos la medición desde el primer día para saber cuánta gente llega, cuánta convierte y en qué punto se cae, de modo que las mejoras posteriores se decidan con datos.",
    ],
    [
      "Tienda online",
      "tienda-online",
      "E-commerce profesionales preparados para vender desde el primer día.",
      "cart",
      1800,
      "Desde 1.800 €",
      ["Catálogo de productos", "Pagos online seguros", "Gestión de pedidos", "Formación de uso"],
      "Montamos tiendas online pensadas para que vendas y para que gestionarlas no se convierta en un trabajo a tiempo completo. Catálogo, fichas de producto, carrito, pagos con tarjeta y gestión de pedidos, todo en un panel que se entiende sin ser informático.\n\nCuidamos especialmente el proceso de compra: cuantos menos pasos y menos dudas, más pedidos terminados. También la ficha de producto, que es la página que compite en Google con las de tu competencia.\n\nAntes de publicar hacemos pruebas reales de compra, configuramos impuestos y gastos de envío, y te formamos para dar de alta productos y atender pedidos con soltura.",
    ],
    [
      "Rediseño web",
      "rediseno-web",
      "Modernizamos páginas antiguas y mejoramos su diseño, velocidad y experiencia.",
      "refresh",
      700,
      "Desde 700 €",
      ["Auditoría inicial", "Nuevo diseño responsive", "Mejora de velocidad", "Migración de contenidos"],
      "Si tu web tiene años, probablemente carga lenta, se ve mal en el móvil y transmite una imagen que ya no corresponde con tu negocio. Un rediseño arregla las tres cosas sin empezar de cero.\n\nEmpezamos con una auditoría: qué páginas reciben visitas, cuáles posicionan, qué falla en velocidad y en experiencia de uso. A partir de ahí conservamos lo que funciona y rehacemos lo que resta.\n\nUn punto crítico es la migración: mantenemos las direcciones que ya posicionan o configuramos las redirecciones necesarias, de forma que el rediseño no te haga perder el tráfico que ya tenías.",
    ],
    [
      "Mantenimiento",
      "mantenimiento",
      "Actualizaciones, cambios, copias de seguridad y soporte continuo.",
      "shield",
      50,
      "Desde 50 €/mes",
      ["Copias de seguridad", "Actualizaciones de seguridad", "Cambios de contenido", "Soporte prioritario"],
      "Una web publicada necesita mantenimiento, igual que cualquier otra herramienta del negocio. Sin él, acaba desactualizada, con fallos de seguridad o con contenido que ya no corresponde.\n\nNuestro plan mensual cubre copias de seguridad periódicas, actualizaciones de seguridad, revisión de que todo funcione (especialmente los formularios) y un número acordado de cambios de contenido al mes.\n\nTambién vigilamos la velocidad y los errores que Google detecta, para corregirlos antes de que afecten a tu posicionamiento. Tú te ocupas de tu negocio y nosotros de que la web acompañe.",
    ],
    [
      "Servicios adicionales",
      "servicios-adicionales",
      "SEO, optimización, integraciones, formularios y automatizaciones a medida.",
      "sparkles",
      150,
      "Desde 150 €",
      ["SEO técnico y de contenidos", "Automatizaciones", "Integraciones con CRM", "Analítica avanzada"],
      "Más allá de construir la web, hay trabajo que multiplica su rendimiento: posicionamiento en buscadores, mejoras de velocidad, integraciones con las herramientas que ya usas y automatizaciones que te ahorran tareas repetitivas.\n\nEn SEO trabajamos tanto la parte técnica (estructura, velocidad, datos estructurados, indexación) como la de contenidos, creando las páginas que responden a lo que busca tu cliente.\n\nEn automatizaciones conectamos los formularios con tu correo, tu CRM o tu hoja de cálculo, para que ningún contacto se pierda y no tengas que copiar datos a mano.",
    ],
  ];
  const stmt =
    "INSERT INTO services (title, slug, description, icon, price_from, price_label, features, body, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)";
  for (const [i, r] of rows.entries()) {
    await db.query(stmt, [r[0], r[1], r[2], r[3], r[4], r[5], JSON.stringify(r[6]), r[7], i]);
  }
}

export async function seedFaqs(db: PoolClient) {
  const rows: [string, string][] = [
    ["¿Cuánto cuesta una página web?", "Depende del alcance: número de páginas, funcionalidades y nivel de diseño. Una landing sencilla parte de unos cientos de euros y una tienda online completa es una inversión mayor. La forma más rápida de saberlo es usar nuestro creador de presupuestos: en 2 minutos tendrás una estimación personalizada."],
    ["¿Cuánto tardáis en crearla?", "Una landing page suele estar lista en 1-2 semanas y una web corporativa en 3-5 semanas. Las tiendas online y los proyectos a medida requieren más tiempo. Al recibir tu presupuesto verás una estimación de plazo concreta."],
    ["¿La web será responsive y estará adaptada a móvil?", "Sí, siempre. Diseñamos primero pensando en el móvil, que es donde llega la mayoría del tráfico, y después adaptamos la experiencia a tablet y ordenador."],
    ["¿Incluye dominio y hosting?", "Podemos incluirlos como servicio adicional y encargarnos de toda la configuración, o trabajar sobre el dominio y hosting que ya tengas. Tú decides, y en ambos casos la titularidad es siempre tuya."],
    ["¿Podré modificar la web yo mismo?", "Sí. Entregamos las webs con un panel de administración desde el que puedes cambiar textos, imágenes y contenidos sin tocar código, junto con una sesión de formación para que te sientas cómodo."],
    ["¿Ofrecéis mantenimiento?", "Sí. Disponemos de planes mensuales que incluyen copias de seguridad, actualizaciones de seguridad, pequeños cambios de contenido y soporte prioritario."],
    ["¿Trabajáis con empresas de cualquier sector?", "Trabajamos con empresas, autónomos y negocios locales de sectores muy distintos. El proceso es el mismo: entender tu negocio, tu cliente y tu objetivo antes de diseñar nada."],
    ["¿Puedo pedir cambios durante el desarrollo?", "Por supuesto. El proceso incluye rondas de revisión en las fases de diseño y desarrollo. Si un cambio se sale del alcance acordado, te lo comentamos antes de hacerlo para que no haya sorpresas."],
    ["¿Qué ocurre después de publicar la web?", "Te acompañamos. Revisamos que todo funcione correctamente, te formamos en el uso del panel y puedes contratar mantenimiento para seguir mejorando la web con el tiempo."],
    ["¿Cómo son las formas de pago?", "Habitualmente se abona una parte al inicio del proyecto y el resto a la entrega. Las condiciones concretas se detallan en el presupuesto que recibes."],
  ];
  for (const [i, r] of rows.entries()) {
    await db.query("INSERT INTO faqs (question, answer, sort_order) VALUES ($1,$2,$3)", [r[0], r[1], i]);
  }
}

export async function seedProjects(db: PoolClient) {
  const rows = [
    ["[DEMO] Estudio de arquitectura Vela", "Web corporativa con portfolio de obras, fichas de proyecto y formulario de contacto cualificado.", "Web corporativa", ["Next.js", "Diseño a medida", "SEO"]],
    ["[DEMO] Clínica dental Serra", "Landing de captación con sistema de reservas de cita y seguimiento de conversiones.", "Landing page", ["Reservas", "Analítica", "Copywriting"]],
    ["[DEMO] Panadería La Espiga", "Tienda online con catálogo de productos, pagos seguros y recogida en tienda.", "Tienda online", ["E-commerce", "Pagos online", "Logística"]],
    ["[DEMO] Asesoría Nexo", "Rediseño completo de una web antigua: nueva identidad, velocidad y estructura SEO.", "Rediseño", ["Rediseño", "Migración", "Velocidad"]],
    ["[DEMO] Gimnasio Pulse", "Web con área privada para socios, planes de entrenamiento y pagos recurrentes.", "Web a medida", ["Área privada", "Suscripciones"]],
    ["[DEMO] Bufete Aroca", "Web corporativa sobria orientada a generar confianza y captar consultas cualificadas.", "Web corporativa", ["Diseño", "SEO local"]],
  ];
  for (const [i, r] of rows.entries()) {
    await db.query(
      "INSERT INTO projects (title, description, category, tags, url, is_demo, sort_order) VALUES ($1,$2,$3,$4,'',1,$5)",
      [r[0], r[1], r[2], JSON.stringify(r[3]), i],
    );
  }
}

export async function seedTestimonials(db: PoolClient) {
  const rows = [
    ["[DEMO] Marta Ruiz", "Estudio Vela", "Explicaron cada paso en un lenguaje que entendemos. La web transmite exactamente lo que somos y hemos notado más consultas serias.", 5],
    ["[DEMO] Jordi Camps", "Clínica Serra", "El proceso fue rapidísimo y muy ordenado. Tener el presupuesto claro desde el principio nos dio mucha tranquilidad.", 5],
    ["[DEMO] Laura Ferrer", "Panadería La Espiga", "Pasamos de no vender online a tener pedidos cada semana. El panel es muy fácil de usar y podemos cambiarlo todo.", 5],
  ];
  for (const [i, r] of rows.entries()) {
    await db.query("INSERT INTO testimonials (name, company, text, rating, is_demo, sort_order) VALUES ($1,$2,$3,$4,1,$5)", [
      r[0], r[1], r[2], r[3], i,
    ]);
  }
}

export async function seedReviews(db: PoolClient) {
  const rows: [string, string, string, string, number, string, string][] = [
    [
      "[DEMO] Marta Ruiz",
      "Web corporativa",
      "Girona",
      "Trato cercano y plazos cumplidos. Nos explicaron cada paso sin tecnicismos y la web quedó exactamente como la queríamos.",
      5,
      "Google",
      "hace 2 semanas",
    ],
    [
      "[DEMO] Jordi Camps",
      "Landing page",
      "Barcelona",
      "Rápidos y muy profesionales. Desde que publicamos la página recibimos consultas mucho más serias.",
      5,
      "Google",
      "hace 1 mes",
    ],
    [
      "[DEMO] Laura Ferrer",
      "Tienda online",
      "Lleida",
      "Nos montaron la tienda y nos enseñaron a gestionarla. Ahora hacemos los cambios nosotros mismos sin depender de nadie.",
      5,
      "WhatsApp",
      "hace 1 mes",
    ],
    [
      "[DEMO] Sergi Blanco",
      "Mantenimiento",
      "Tarragona",
      "Llevan el mantenimiento de nuestra web desde hace tiempo. Responden rápido y siempre está todo al día.",
      4,
      "Google",
      "hace 2 meses",
    ],
  ];
  for (const [i, r] of rows.entries()) {
    await db.query(
      `INSERT INTO reviews (author, service, location, text, rating, source, reviewed_on, is_demo, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1,$8)`,
      [r[0], r[1], r[2], r[3], r[4], r[5], r[6], i],
    );
  }
}

/** Servicios de chatbot. Solo se insertan si no existen ya por su dirección. */
export async function seedChatbotServices(db: PoolClient) {
  const rows: [string, string, string, string, number, string, string[], string][] = [
    [
      "Chatbot para WhatsApp Business",
      "chatbot-whatsapp",
      "Atiende, filtra y agenda por WhatsApp a cualquier hora, sin que tengas que estar tú.",
      "whatsapp",
      450,
      "Desde 450 €",
      ["Respuestas automáticas 24/7", "Captación de datos del cliente", "Agenda de citas", "Aviso a tu móvil"],
      "La mayoría de negocios pierde clientes por no contestar a tiempo. Un chatbot en WhatsApp Business responde al instante, a cualquier hora, y filtra lo que de verdad necesita tu atención.\n\nConfiguramos el bot con la información real de tu negocio: horarios, servicios, precios, ubicación y las preguntas que más te repiten. Puede recoger los datos del cliente, agendar una cita, enviar tu catálogo o pasarte la conversación a ti cuando el caso lo merece.\n\nSe conecta con lo que ya usas —tu calendario, tu hoja de cálculo o tu CRM— para que los contactos queden registrados sin copiar nada a mano. Y siempre queda la opción de hablar con una persona: el bot filtra, no bloquea.",
    ],
    [
      "Chatbot para tu página web",
      "chatbot-web",
      "Un asistente en tu web que resuelve dudas y convierte visitas en contactos.",
      "message",
      400,
      "Desde 400 €",
      ["Respuestas con la información de tu web", "Captación de contactos", "Derivación a WhatsApp", "Informes de uso"],
      "Quien entra en tu web y no encuentra rápido lo que busca, se va. Un chatbot bien puesto responde en el momento, resuelve la duda y recoge el contacto antes de que se marche.\n\nSe entrena con la información de tu propio negocio —tus servicios, tus precios, tus condiciones— para que responda con criterio y no invente. Cuando la conversación se pone seria, recoge los datos o la deriva directamente a tu WhatsApp.\n\nIncluye panel para ver las conversaciones y las preguntas más repetidas, que suele ser la mejor fuente de ideas para mejorar la web y la oferta.",
    ],
  ];

  const maxOrder = await db.query("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM services");
  let order = Number(maxOrder.rows[0].n);

  for (const r of rows) {
    const exists = await db.query("SELECT 1 FROM services WHERE slug = $1 LIMIT 1", [r[1]]);
    if (exists.rows.length > 0) continue;
    await db.query(
      "INSERT INTO services (title, slug, description, icon, price_from, price_label, features, body, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [r[0], r[1], r[2], r[3], r[4], r[5], JSON.stringify(r[6]), r[7], order++],
    );
  }
}

export async function seedChatbotCalculator(db: PoolClient) {
  const groups: {
    key: string;
    title: string;
    subtitle: string;
    type: "single" | "multi";
    required: number;
    options: [string, string, number, string, number][];
  }[] = [
    {
      key: "cb-canal",
      title: "¿Dónde quieres el chatbot?",
      subtitle: "Puedes empezar por un canal y ampliar más adelante.",
      type: "single",
      required: 1,
      options: [
        ["WhatsApp Business", "El canal donde ya te escriben tus clientes.", 450, "fixed", 6],
        ["En mi página web", "Un asistente en la esquina de tu web.", 400, "fixed", 5],
        ["Instagram y Facebook", "Responde los mensajes directos de tus redes.", 420, "fixed", 6],
        ["WhatsApp y web a la vez", "Las mismas respuestas en los dos canales.", 700, "fixed", 9],
        ["Aún no lo sé", "Lo decidimos juntos según tu negocio.", 450, "fixed", 6],
      ],
    },
    {
      key: "cb-funciones",
      title: "¿Qué quieres que haga?",
      subtitle: "Selecciona todo lo que te encaje. Puedes empezar por poco.",
      type: "multi",
      required: 0,
      options: [
        ["Responder preguntas frecuentes", "Horarios, precios, ubicación, condiciones...", 120, "fixed", 1],
        ["Captar datos del cliente", "Nombre, teléfono y qué necesita, guardados automáticamente.", 180, "fixed", 2],
        ["Agendar citas o reservas", "Con disponibilidad real de tu calendario.", 390, "fixed", 5],
        ["Enviar catálogo o presupuesto", "Manda precios o el PDF al momento.", 220, "fixed", 3],
        ["Tomar pedidos", "Pedidos sencillos por chat, con confirmación.", 480, "fixed", 6],
        ["Consultar el estado de un pedido", "El cliente pregunta y el bot responde solo.", 300, "fixed", 4],
        ["Pasar la conversación a una persona", "Cuando el caso lo merece, te avisa a ti.", 140, "fixed", 2],
        ["Recuperar conversaciones paradas", "Reactiva a quien se quedó a medias.", 260, "fixed", 3],
        ["Pedir reseñas después del servicio", "Mensaje automático para pedir la valoración.", 160, "fixed", 2],
      ],
    },
    {
      key: "cb-inteligencia",
      title: "¿Cómo de listo tiene que ser?",
      subtitle: "De un menú de botones a un asistente que entiende lo que le escriben.",
      type: "single",
      required: 1,
      options: [
        ["Menú de opciones", "El cliente elige entre botones. Sencillo y muy fiable.", 0.8, "multiplier", 0],
        ["Respuestas por palabras clave", "Detecta lo que preguntan y responde.", 1, "multiplier", 1],
        ["Inteligencia artificial con tu información", "Entiende lenguaje natural y responde con los datos de tu negocio.", 1.45, "multiplier", 5],
        ["Inteligencia artificial que además actúa", "Consulta tu agenda o tu sistema y hace gestiones.", 1.9, "multiplier", 10],
      ],
    },
    {
      key: "cb-integraciones",
      title: "¿Con qué se tiene que conectar?",
      subtitle: "Para que los datos lleguen solos a donde ya trabajas.",
      type: "multi",
      required: 0,
      options: [
        ["Hoja de cálculo", "Cada contacto, una fila en tu Excel o Google Sheets.", 120, "fixed", 1],
        ["Tu calendario", "Google Calendar, Outlook o similar.", 260, "fixed", 3],
        ["Tu CRM", "Los contactos entran directamente en tu CRM.", 340, "fixed", 4],
        ["Tu tienda online", "Consulta productos, stock o pedidos.", 420, "fixed", 5],
        ["Cobros online", "Enlace de pago dentro de la conversación.", 380, "fixed", 4],
        ["Aviso por email", "Te llega un correo con cada conversación.", 90, "fixed", 1],
        ["Ninguna por ahora", "El bot funciona por su cuenta.", 0, "fixed", 0],
      ],
    },
    {
      key: "cb-idiomas",
      title: "¿En cuántos idiomas?",
      subtitle: "El bot detecta el idioma del cliente y responde igual.",
      type: "single",
      required: 1,
      options: [
        ["Solo uno", "Castellano, catalán, inglés... el que uses.", 0, "fixed", 0],
        ["Dos idiomas", "Por ejemplo castellano e inglés.", 220, "fixed", 2],
        ["Tres o más", "Para negocios con clientela internacional.", 420, "fixed", 4],
      ],
    },
    {
      key: "cb-mantenimiento",
      title: "¿Quieres que nos ocupemos del día a día?",
      subtitle: "Un chatbot mejora con el uso: cada mes se afinan las respuestas.",
      type: "multi",
      required: 0,
      options: [
        ["Mantenimiento y soporte", "Que siga funcionando y responder a incidencias.", 60, "monthly", 0],
        ["Mejora continua de respuestas", "Revisamos conversaciones reales y afinamos el bot.", 90, "monthly", 0],
        ["Informe mensual", "Cuántas conversaciones, qué preguntan y cuántos contactos.", 40, "monthly", 0],
        ["Alojamiento del chatbot", "Nos encargamos del servidor y las actualizaciones.", 35, "monthly", 0],
        ["Formación para tu equipo", "Una sesión para que sepáis manejarlo.", 150, "fixed", 1],
      ],
    },
  ];

  for (const [gi, g] of groups.entries()) {
    const res = await db.query(
      "INSERT INTO calc_groups (calculator, key, title, subtitle, type, required, sort_order) VALUES ('chatbot',$1,$2,$3,$4,$5,$6) RETURNING id",
      [g.key, g.title, g.subtitle, g.type, g.required, gi],
    );
    const groupId = res.rows[0].id;
    for (const [oi, o] of g.options.entries()) {
      await db.query(
        "INSERT INTO calc_options (group_id, label, description, price, price_type, days, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [groupId, o[0], o[1], o[2], o[3], o[4], oi],
      );
    }
  }
}

export async function seedCalculator(db: PoolClient) {
  const groups: {
    key: string;
    title: string;
    subtitle: string;
    type: "single" | "multi";
    required: number;
    options: [string, string, number, string, number][]; // label, description, price, price_type, days
  }[] = [
    {
      key: "tipo",
      title: "¿Qué tipo de proyecto necesitas?",
      subtitle: "Elige el punto de partida. Podrás ajustarlo todo después.",
      type: "single",
      required: 1,
      options: [
        ["Página web corporativa", "Presenta tu empresa y genera confianza.", 900, "fixed", 12],
        ["Landing page", "Una sola página enfocada a captar clientes.", 550, "fixed", 7],
        ["Tienda online", "Vende tus productos por internet.", 1800, "fixed", 25],
        ["Rediseño de web", "Moderniza tu web actual.", 700, "fixed", 10],
        ["Web personalizada", "Un proyecto con necesidades específicas.", 2200, "fixed", 30],
        ["Otro", "Cuéntanos tu caso y lo estudiamos.", 800, "fixed", 12],
      ],
    },
    {
      key: "paginas",
      title: "¿Cuántas páginas necesitas aproximadamente?",
      subtitle: "Una estimación es suficiente, luego lo concretamos juntos.",
      type: "single",
      required: 1,
      options: [
        ["1 página", "Todo el contenido en una sola página.", 0, "fixed", 0],
        ["2-5 páginas", "Lo más habitual en negocios pequeños.", 250, "fixed", 3],
        ["6-10 páginas", "Para empresas con varios servicios.", 550, "fixed", 6],
        ["Más de 10", "Proyectos con mucho contenido.", 950, "fixed", 10],
      ],
    },
    {
      key: "funcionalidades",
      title: "¿Qué funcionalidades quieres incluir?",
      subtitle: "Selecciona todas las que necesites. Puedes dejarlo vacío.",
      type: "multi",
      required: 0,
      options: [
        ["Formulario de contacto", "Recibe consultas en tu email.", 60, "fixed", 1],
        ["WhatsApp", "Botón de contacto directo.", 40, "fixed", 1],
        ["Blog", "Publica artículos y mejora tu SEO.", 320, "fixed", 4],
        ["Reservas", "Sistema de citas o reservas online.", 480, "fixed", 6],
        ["Tienda online", "Catálogo y carrito de compra.", 900, "fixed", 12],
        ["Pagos online", "Cobra con tarjeta de forma segura.", 350, "fixed", 4],
        ["Área privada", "Zona de acceso para clientes o socios.", 750, "fixed", 10],
        ["Panel de administración", "Edita el contenido sin tocar código.", 550, "fixed", 7],
        ["SEO", "Optimización para buscadores.", 300, "fixed", 4],
        ["Redes sociales", "Integración con tus perfiles.", 80, "fixed", 1],
        ["Automatizaciones", "Conecta tu web con tus herramientas.", 420, "fixed", 5],
        ["Multiidioma", "Tu web en varios idiomas.", 500, "fixed", 6],
      ],
    },
    {
      key: "diseno",
      title: "¿Qué nivel de diseño buscas?",
      subtitle: "Afecta al acabado visual y al tiempo de desarrollo.",
      type: "single",
      required: 1,
      options: [
        ["Básico", "Plantilla adaptada a tu marca.", 0.85, "multiplier", 0],
        ["Profesional", "Diseño propio y cuidado. El más elegido.", 1, "multiplier", 3],
        ["Premium", "Diseño exclusivo con animaciones y detalle.", 1.25, "multiplier", 7],
        ["Totalmente personalizado", "Dirección de arte e ilustración a medida.", 1.55, "multiplier", 14],
      ],
    },
    {
      key: "extras",
      title: "¿Necesitas algún servicio adicional?",
      subtitle: "Nos encargamos de todo para que tú no tengas que preocuparte.",
      type: "multi",
      required: 0,
      options: [
        ["Dominio", "Registro y configuración del dominio (1 año).", 25, "fixed", 0],
        ["Hosting", "Alojamiento rápido y seguro (1 año).", 140, "fixed", 1],
        ["Mantenimiento", "Plan mensual de soporte y actualizaciones.", 50, "monthly", 0],
        ["SEO continuo", "Trabajo mensual de posicionamiento.", 190, "monthly", 0],
        ["Copywriting", "Redactamos los textos de tu web.", 380, "fixed", 5],
        ["Creación de contenido", "Contenido adicional para blog o redes.", 290, "fixed", 4],
        ["Fotografía / recursos visuales", "Banco de imágenes o sesión de fotos.", 350, "fixed", 3],
        ["Soporte prioritario", "Respuesta garantizada en 24 h.", 35, "monthly", 0],
      ],
    },
  ];

  for (const [gi, g] of groups.entries()) {
    const res = await db.query(
      "INSERT INTO calc_groups (calculator, key, title, subtitle, type, required, sort_order) VALUES ('web',$1,$2,$3,$4,$5,$6) RETURNING id",
      [g.key, g.title, g.subtitle, g.type, g.required, gi],
    );
    const groupId = res.rows[0].id;
    for (const [oi, o] of g.options.entries()) {
      await db.query(
        "INSERT INTO calc_options (group_id, label, description, price, price_type, days, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [groupId, o[0], o[1], o[2], o[3], o[4], oi],
      );
    }
  }
}

export const SEED_ADMIN = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
