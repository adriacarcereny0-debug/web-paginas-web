import type { PoolClient } from "pg";

/** Esquema de la base de datos. Se aplica de forma idempotente en cada arranque. */
export async function runMigrations(client: PoolClient) {
  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'layout',
    image TEXT NOT NULL DEFAULT '',
    price_from DOUBLE PRECISION NOT NULL DEFAULT 0,
    price_label TEXT NOT NULL DEFAULT '',
    features TEXT NOT NULL DEFAULT '[]',
    body TEXT NOT NULL DEFAULT '',
    meta_title TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    url TEXT NOT NULL DEFAULT '',
    is_demo INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5,
    is_demo INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    author TEXT NOT NULL,
    service TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5,
    source TEXT NOT NULL DEFAULT 'Web',
    avatar TEXT NOT NULL DEFAULT '',
    reviewed_on TEXT NOT NULL DEFAULT '',
    is_demo INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS calc_groups (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'single',
    required INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS calc_options (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES calc_groups(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT '',
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    price_type TEXT NOT NULL DEFAULT 'fixed',
    days INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    business_type TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'calculadora',
    status TEXT NOT NULL DEFAULT 'nuevo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

  CREATE TABLE IF NOT EXISTS lead_notes (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    public_id TEXT NOT NULL UNIQUE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    selections TEXT NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL DEFAULT '[]',
    project_type TEXT NOT NULL DEFAULT '',
    price_min DOUBLE PRECISION NOT NULL DEFAULT 0,
    price_max DOUBLE PRECISION NOT NULL DEFAULT 0,
    monthly DOUBLE PRECISION NOT NULL DEFAULT 0,
    days_min INTEGER NOT NULL DEFAULT 0,
    days_max INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'borrador',
    notes TEXT NOT NULL DEFAULT '',
    final_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    doc_reference TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    project_type TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'nuevo',
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    mime TEXT NOT NULL DEFAULT '',
    size INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 0,
    height INTEGER NOT NULL DEFAULT 0,
    alt TEXT NOT NULL DEFAULT '',
    data BYTEA,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_quotes_lead ON quotes(lead_id);
  CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
  CREATE INDEX IF NOT EXISTS idx_calc_options_group ON calc_options(group_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(visible, sort_order);

  -- Columnas añadidas después de la primera versión del esquema.
  ALTER TABLE services ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '';
  ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_title TEXT NOT NULL DEFAULT '';
  ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '';
  ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE quotes ADD COLUMN IF NOT EXISTS final_amount DOUBLE PRECISION NOT NULL DEFAULT 0;
  ALTER TABLE quotes ADD COLUMN IF NOT EXISTS doc_reference TEXT NOT NULL DEFAULT '';
  CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug) WHERE slug <> '';
  `);
}
