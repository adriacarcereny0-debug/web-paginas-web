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
  testimonios, FAQ con acordeón, CTA final y contacto.
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
| Testimonios | CRUD con valoración, foto y marca DEMO. |
| FAQ | CRUD con orden y visibilidad. |
| Contenido | Editor de hero, confianza, proceso, títulos de sección, CTA, footer y textos legales. |
| Media | Biblioteca de imágenes con subida por arrastre y optimización automática a WebP. |
| SEO | Title, description, keywords, imagen social, favicon, indexación y vista previa. |
| Configuración | Marca, datos de contacto, redes sociales y cuenta de administrador. |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # edita AUTH_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

La base de datos SQLite se crea sola en `data/app.db` en el primer arranque, junto con el
usuario administrador y el contenido de ejemplo (servicios, FAQ, portfolio DEMO,
testimonios DEMO y toda la configuración de la calculadora).

Para producción:

```bash
npm run build
npm run start
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `AUTH_SECRET` | Sí en producción | Firma la cookie de sesión del panel. Genérala con `openssl rand -base64 32`. Sin ella, la aplicación no arranca en producción. |
| `ADMIN_EMAIL` | No | Email del primer administrador. Por defecto `admin@novastudio.es`. |
| `ADMIN_PASSWORD` | No | Contraseña del primer administrador. Por defecto `admin1234` — **cámbiala**. |
| `ADMIN_NAME` | No | Nombre mostrado en el panel. |
| `DATABASE_PATH` | No | Ruta del fichero SQLite. Por defecto `./data/app.db`. |
| `DATA_DIR` | No | Carpeta de datos. Por defecto `./data`. |

Estas variables solo se leen en el servidor; ninguna clave llega al navegador.

## Acceso al panel

1. Ve a `/admin` (o al enlace «Acceso panel» del footer).
2. Entra con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Cambia la contraseña en **Configuración → Cuenta de administrador**.

La sesión dura 8 horas, se guarda en una cookie `httpOnly` firmada con HMAC-SHA256 y el
login está limitado a 8 intentos cada 15 minutos por IP.

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
    sitemap.ts, robots.ts, icon.svg
  components/site/           secciones de la web pública
  components/admin/          interfaz del panel
  components/ui/             iconos y animaciones
  lib/
    db.ts                    conexión SQLite, esquema y migraciones
    seed.ts                  contenido inicial
    content.ts               contenido editable y sus valores por defecto
    pricing.ts               motor de cálculo del presupuesto
    resources.ts             definición del CRUD genérico del panel
    auth.ts, rate-limit.ts, api.ts, utils.ts
  proxy.ts                   protección de las rutas /admin
data/app.db                  base de datos (se crea sola, no se versiona)
public/uploads/              imágenes subidas desde el panel
```

## Base de datos

SQLite mediante `better-sqlite3`, en modo WAL y con claves foráneas activas. Tablas:
`users`, `settings`, `services`, `faqs`, `projects`, `testimonials`, `calc_groups`,
`calc_options`, `leads`, `lead_notes`, `quotes`, `messages`, `media`.

El esquema se crea y migra solo al arrancar (`src/lib/db.ts`). Nada relevante se guarda en
`localStorage`: el navegador solo conserva un borrador temporal del wizard en `sessionStorage`
para que el usuario no pierda lo que llevaba si recarga.

Si prefieres PostgreSQL o MySQL, el único punto a sustituir es `src/lib/db.ts`
(el resto del código usa consultas SQL estándar a través de ese módulo).

## Seguridad

- Contraseñas con bcrypt; sesión en cookie `httpOnly`, `sameSite=lax` y `secure` en producción.
- Todas las rutas `/admin` y `/api/admin` verifican la sesión en el servidor.
- Validación de entrada con Zod y saneado de caracteres de control en todos los formularios.
- Consultas siempre parametrizadas (sin concatenación de valores) y tablas/columnas del CRUD
  restringidas a una lista blanca en `src/lib/resources.ts`.
- Rate limiting por IP: login (8/15 min), presupuestos (8/10 min), contacto (5/10 min).
- Campo honeypot antispam en los formularios públicos.
- Subida de imágenes limitada por tipo MIME y tamaño (8 MB), con nombre de fichero saneado.
- Cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.
- Los textos legales editables se renderizan con un formateador propio muy limitado
  (títulos, listas, negrita y citas): no se inyecta HTML arbitrario en la página.

## SEO

Metadatos y Open Graph configurables, `sitemap.xml` y `robots.txt` generados dinámicamente,
URLs limpias, HTML semántico, datos estructurados JSON-LD (`ProfessionalService`, `FAQPage`,
`WebSite`), imágenes optimizadas a WebP con `next/image` y carga diferida, y un interruptor
para desindexar la web mientras esté en construcción.

## Despliegue

La aplicación necesita un servidor Node (no exportación estática) y **un disco persistente**
para `data/` y `public/uploads/`.

- **VPS / Docker / Railway / Render / Fly.io**: `npm ci && npm run build && npm run start`,
  montando un volumen en `data/` y en `public/uploads/`.
- **Vercel**: el sistema de ficheros es efímero, así que ahí habría que mover la base de datos
  a un servicio gestionado (Postgres, Turso…) y las imágenes a un almacenamiento externo.
  Solo hay que adaptar `src/lib/db.ts` y la ruta `src/app/api/admin/media/route.ts`.

Recuerda definir `AUTH_SECRET` en el entorno de producción y hacer copias de seguridad
periódicas del fichero `data/app.db`.

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
