# Nova Studio — Web de agencia + panel de administración

Aplicación web completa para una agencia/estudio que crea páginas web para empresas,
autónomos y negocios. No es una landing estática: incluye creador de presupuestos,
captura de leads, gestión comercial y un CMS propio para editar toda la web sin tocar código.

## Índice

- [Qué incluye](#qué-incluye)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Acceso al panel](#acceso-al-panel)
- [Cómo funciona el creador de presupuestos](#cómo-funciona-el-creador-de-presupuestos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos](#base-de-datos)
- [Seguridad](#seguridad)
- [SEO](#seo)
- [Despliegue](#despliegue)
- [Integraciones opcionales](#integraciones-opcionales)

## Qué incluye

**Web pública**

- Hero con composición visual propia (sin imágenes de stock, todo CSS/SVG).
- Sección de confianza, servicios, proceso en 4 pasos, portfolio filtrable,
  testimonios, reseñas con nota media, FAQ con acordeón, CTA final y contacto.
- Creador de presupuestos tipo wizard con captura de datos antes de mostrar la estimación.
- Resultado de presupuesto con resumen, importe, plazo, solicitud en un clic y exportación a PDF (vía impresión).
- Formulario de contacto, botón flotante de WhatsApp y páginas legales editables.
- Animaciones suaves al hacer scroll, respetando `prefers-reduced-motion`.

**Panel de administración** (`/admin`)

| Sección | Qué permite |
| --- | --- |
| Dashboard | Leads, clientes, presupuestos, mensajes, importe medio, pipeline y gráficos. |
| Leads | Buscar, filtrar, ordenar, ver ficha completa, editar, notas internas, cambiar estado, eliminar, exportar CSV. |
| Clientes | Los leads en estado «Cliente». |
| Presupuestos | Listado con búsqueda y filtros, detalle con las opciones elegidas, notas y estados. |
| Mensajes | Bandeja de entrada con estados (nuevo, leído, respondido, archivado). |
| Servicios | CRUD completo con orden, visibilidad, iconos, precios e imágenes. |
| Calculadora | Precios, reglas, descuentos, pasos y opciones. Nada está escrito en el código. |
| Portfolio | CRUD de proyectos con imagen, categoría, tecnologías, enlace y marca DEMO. |
| Reseñas | CRUD de reseñas con valoración, servicio, ciudad, origen, foto, destacadas y marca DEMO. La web calcula sola la nota media y el reparto de estrellas. |
| Testimonios | CRUD con valoración, foto y marca DEMO. |
| FAQ | CRUD con orden y visibilidad. |
| Contenido | Editor de hero, confianza, proceso, títulos de sección, CTA, footer y textos legales. |
| Media | Biblioteca de imágenes con subida por arrastre y optimización automática a WebP. |
| SEO | Title, description, keywords, imagen social, favicon, indexación y vista previa. |
| Configuración | Marca, datos de contacto, redes sociales y cuenta de administrador. |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # edita DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

Necesitas una base de datos PostgreSQL (Neon, Supabase, Vercel Postgres, Railway o una local).
No hay que ejecutar ninguna migración a mano: en el primer arranque la aplicación crea las
tablas, el usuario administrador y el contenido de ejemplo (servicios, FAQ, portfolio DEMO,
testimonios DEMO y toda la configuración de la calculadora).

Para producción:

```bash
npm run build
npm run start
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Cadena de conexión de PostgreSQL. Usa el endpoint *pooled* si tu proveedor lo ofrece. También se aceptan `POSTGRES_URL` y `POSTGRES_PRISMA_URL`. |
| `AUTH_SECRET` | Recomendada | Firma la cookie de sesión del panel. Genérala con `openssl rand -base64 32`. Si no está definida, se deriva una clave estable a partir de `DATABASE_URL` para no bloquear el acceso, pero conviene definirla para poder rotarla por separado. |
| `ADMIN_EMAIL` | No | Email del administrador. Si esa cuenta no existe todavía, se crea al arrancar; si ya existe, no se toca. Por defecto `admin@novastudio.es`. |
| `ADMIN_PASSWORD` | No | Contraseña con la que se crea esa cuenta. Por defecto `admin1234` — **cámbiala**. |
| `ADMIN_NAME` | No | Nombre mostrado en el panel. |
| `ADMIN_PASSWORD_RESET` | No | Vía de emergencia. Con el valor `1`, al arrancar se restablece la contraseña de `ADMIN_EMAIL` usando `ADMIN_PASSWORD`. Elimina la variable en cuanto recuperes el acceso. |
| `PG_POOL_MAX` | No | Conexiones máximas del pool por instancia. Por defecto 5. |

Estas variables solo se leen en el servidor; ninguna clave llega al navegador.

## Acceso al panel

1. Ve a `/admin` (o al enlace «Acceso panel» del footer).
2. Entra con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Cambia la contraseña en **Configuración → Cuenta de administrador**.

La sesión dura 8 horas, se guarda en una cookie `httpOnly` firmada con HMAC-SHA256 y el
login está limitado a 8 intentos cada 15 minutos por IP. Las contraseñas se normalizan antes
de compararlas (se recortan los espacios de los extremos y se unifica la forma Unicode), de
modo que un espacio colado al copiar y pegar no deja a nadie fuera del panel.

**Si pierdes el acceso**: añade `ADMIN_PASSWORD_RESET=1` a las variables de entorno junto con
el `ADMIN_EMAIL` y el `ADMIN_PASSWORD` que quieras, vuelve a desplegar y entra con esa
contraseña. Después borra `ADMIN_PASSWORD_RESET` y despliega de nuevo.

## Cómo funciona el creador de presupuestos

1. El visitante recorre los pasos configurados en **Calculadora → Pasos**.
2. Antes de ver ningún importe debe dejar sus datos y aceptar la política de privacidad.
3. El servidor calcula el precio (el navegador nunca recibe los precios de las opciones,
   así que la estimación no se puede manipular desde el cliente).
4. Se crea el lead y el presupuesto en la base de datos y se muestra el resultado.
5. Si el visitante pulsa «Solicitar este presupuesto», el presupuesto pasa a *enviado*
   y se genera un mensaje en la bandeja del panel.

Fórmula de cálculo, íntegramente configurable desde el panel:

```
total = (precio base + suma de opciones fijas) × multiplicadores − descuentos
total = max(total, precio mínimo)
rango = total ± margen (%)
plazo = días base + días de cada opción
```

Cada opción puede ser de tipo **importe fijo**, **multiplicador** (por ejemplo un nivel de
diseño premium a ×1,25) o **cuota mensual** (mantenimiento, SEO recurrente…).

## Estructura del proyecto

```
src/
  app/
    page.tsx                 portada
    presupuesto/             creador de presupuestos
    legal/[slug]/            privacidad, cookies, aviso legal
    admin/login/             acceso al panel
    admin/(panel)/           panel protegido
    api/                     API pública (calculadora, presupuesto, contacto)
    api/admin/               API del panel (CRUD, ajustes, media, exportación, stats)
    api/media/               entrega de las imágenes guardadas en la base de datos
    sitemap.ts, robots.ts, icon.svg
  components/site/           secciones de la web pública
  components/admin/          interfaz del panel
  components/ui/             iconos y animaciones
  lib/
    db.ts                    conexión a PostgreSQL, consultas y transacciones
    schema.ts                esquema de la base de datos
    seed.ts                  contenido inicial
    content.ts               contenido editable y sus valores por defecto
    pricing.ts               motor de cálculo del presupuesto
    resources.ts             definición del CRUD genérico del panel
    auth.ts, rate-limit.ts, api.ts, utils.ts
  proxy.ts                   protección de las rutas /admin
```

## Base de datos

PostgreSQL mediante `pg`. Tablas: `users`, `settings`, `services`, `faqs`, `projects`,
`testimonials`, `reviews`, `calc_groups`, `calc_options`, `leads`, `lead_notes`, `quotes`,
`messages`, `media`.

El esquema vive en `src/lib/schema.ts` y se aplica de forma idempotente en el primer arranque
de cada instancia, protegido por un *advisory lock* para que dos arranques simultáneos no se
pisen. `src/lib/seed.ts` inserta el contenido inicial solo si las tablas están vacías, así que
nunca sobrescribe tus datos.

Las imágenes que subes desde el panel **se guardan en la propia base de datos** (columna
`media.data`) y se sirven desde `/api/media/<id>/<archivo>` con cache inmutable. Así la
aplicación funciona igual en un hosting sin disco persistente como Vercel. Si algún día
manejas muchas imágenes o muy pesadas, el punto a cambiar por un almacenamiento externo
(S3, Vercel Blob, Cloudinary) es `src/app/api/admin/media/route.ts`.

Nada relevante se guarda en `localStorage`: el navegador solo conserva un borrador temporal
del wizard en `sessionStorage` para que el usuario no pierda lo que llevaba si recarga.

## Seguridad

- Contraseñas con bcrypt; sesión en cookie `httpOnly`, `sameSite=lax` y `secure` en producción.
- Todas las rutas `/admin` y `/api/admin` verifican la sesión en el servidor.
- Validación de entrada con Zod y saneado de caracteres de control en todos los formularios.
- Consultas siempre parametrizadas (sin concatenación de valores) y tablas/columnas del CRUD
  restringidas a una lista blanca en `src/lib/resources.ts`.
- Rate limiting por IP: login (8/15 min), presupuestos (8/10 min), contacto (5/10 min).
- Campo honeypot antispam en los formularios públicos.
- Subida de imágenes limitada por tipo MIME y tamaño (8 MB), reprocesada con sharp y servida
  con `X-Content-Type-Options: nosniff`.
- Cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.
- Los textos legales editables se renderizan con un formateador propio muy limitado
  (títulos, listas, negrita y citas): no se inyecta HTML arbitrario en la página.

## SEO

Metadatos y Open Graph configurables, `sitemap.xml` y `robots.txt` generados dinámicamente,
URLs limpias, HTML semántico, datos estructurados JSON-LD (`ProfessionalService`, `FAQPage`,
`WebSite`), imágenes optimizadas a WebP con `next/image` y carga diferida, y un interruptor
para desindexar la web mientras esté en construcción.

## Despliegue

La aplicación necesita un servidor Node (no es una exportación estática) y una base de datos
PostgreSQL. No usa el disco para nada, así que funciona en hostings serverless.

**Vercel** (configuración usada actualmente):

1. Importa el repositorio. El framework se detecta solo, no hay que tocar los comandos.
2. En *Settings → Environment Variables* añade `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`
   y `ADMIN_PASSWORD` para los entornos Production, Preview y Development.
3. Vuelve a desplegar. La primera petición crea las tablas y el contenido inicial.

**VPS, Docker, Railway, Render o Fly.io**: `npm ci && npm run build && npm run start` con las
mismas variables de entorno.

Define `AUTH_SECRET` en producción (si falta, la sesión se firma con una clave derivada de
`DATABASE_URL`, que funciona pero no se puede rotar de forma independiente) y ten activadas
las copias de seguridad de tu proveedor de base de datos.

## Imágenes

Todas las imágenes se suben desde **Media** en el panel (o desde el botón «Elegir imagen» de
cada formulario) y se optimizan solas a WebP. Se pueden usar en:

- **Logotipo** (Configuración): sustituye al cuadrado con las iniciales en la cabecera y el pie.
- **Imagen principal del hero** (Contenido → Hero): sustituye a la composición gráfica.
- **Servicios**: si añades imagen, sustituye al icono de la tarjeta.
- **Portfolio**: la captura de cada proyecto.
- **Reseñas y testimonios**: la foto del cliente.
- **SEO**: imagen social (1200×630) y favicon.

## Integraciones opcionales

No hay ninguna integración externa activada: la aplicación funciona entera por sí sola y no
hay botones que aparenten hacer algo que no hacen. Si más adelante quieres añadir alguna,
estos son los puntos exactos donde encajan:

- **Aviso por email de cada lead o mensaje**: en `src/app/api/quote/route.ts` y
  `src/app/api/contact/route.ts`, justo después de guardar en la base de datos. Necesitarías
  un proveedor (Resend, SendGrid, SMTP) y sus variables, por ejemplo `RESEND_API_KEY` y
  `NOTIFICATION_EMAIL`.
- **Analítica**: añade el script en `src/app/layout.tsx`.
- **CRM externo**: mismo punto que el aviso por email, enviando el lead por webhook.
