import { Pool, type PoolClient } from "pg";
import { runMigrations } from "./schema";
import { seedIfEmpty } from "./seed";

declare global {
  // eslint-disable-next-line no-var
  var __pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __initPromise: Promise<void> | undefined;
}

function connectionString() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_POSTGRES_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL con la cadena de conexión de PostgreSQL. " +
        "Configúrala en tu proveedor (Vercel: Settings > Environment Variables) o en .env.local.",
    );
  }
  return url;
}

/** Neon, Supabase y similares exigen TLS; un PostgreSQL local normalmente no lo tiene activado. */
function sslConfig(url: string) {
  if (/sslmode=disable/.test(url)) return undefined;
  if (/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) return undefined;
  return { rejectUnauthorized: false };
}

function getPool(): Pool {
  if (!global.__pool) {
    const url = connectionString();
    global.__pool = new Pool({
      connectionString: url,
      ssl: sslConfig(url),
      max: Number(process.env.PG_POOL_MAX) || 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
    });
    global.__pool.on("error", (err) => {
      console.error("[db] error inesperado en el pool:", err.message);
    });
  }
  return global.__pool;
}

/**
 * Crea el esquema y el contenido inicial una sola vez por instancia.
 * Un advisory lock evita que dos arranques simultáneos se pisen.
 */
export function ready(): Promise<void> {
  if (!global.__initPromise) {
    global.__initPromise = (async () => {
      const client = await getPool().connect();
      try {
        await client.query("SELECT pg_advisory_lock(918273645)");
        await runMigrations(client);
        await seedIfEmpty(client);
      } finally {
        await client.query("SELECT pg_advisory_unlock(918273645)").catch(() => {});
        client.release();
      }
    })().catch((err) => {
      global.__initPromise = undefined;
      throw err;
    });
  }
  return global.__initPromise;
}

/**
 * Convierte los marcadores `?` al formato `$n` de PostgreSQL,
 * respetando los literales entre comillas simples.
 */
export function toPgPlaceholders(sql: string) {
  let out = "";
  let index = 0;
  let inString = false;
  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    if (char === "'") {
      inString = !inString;
      out += char;
    } else if (char === "?" && !inString) {
      index += 1;
      out += `$${index}`;
    } else {
      out += char;
    }
  }
  return out;
}

export type Executor = {
  query: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  queryOne: <T>(sql: string, params?: unknown[]) => Promise<T | undefined>;
  execute: (sql: string, params?: unknown[]) => Promise<number>;
};

function makeExecutor(run: (sql: string, params: unknown[]) => Promise<{ rows: unknown[]; rowCount: number | null }>): Executor {
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const res = await run(toPgPlaceholders(sql), params);
      return res.rows as T[];
    },
    async queryOne<T>(sql: string, params: unknown[] = []) {
      const res = await run(toPgPlaceholders(sql), params);
      return res.rows[0] as T | undefined;
    },
    async execute(sql: string, params: unknown[] = []) {
      const res = await run(toPgPlaceholders(sql), params);
      return res.rowCount ?? 0;
    },
  };
}

const pooled = makeExecutor(async (sql, params) => {
  await ready();
  return getPool().query(sql, params as never[]);
});

export const query = pooled.query;
export const queryOne = pooled.queryOne;
export const execute = pooled.execute;

/** Ejecuta varias sentencias dentro de una transacción. */
export async function transaction<T>(fn: (tx: Executor) => Promise<T>): Promise<T> {
  await ready();
  const client: PoolClient = await getPool().connect();
  const tx = makeExecutor((sql, params) => client.query(sql, params as never[]));
  try {
    await client.query("BEGIN");
    const result = await fn(tx);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/* ---------- ajustes / contenido editable ---------- */

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await queryOne<{ value: unknown }>("SELECT value FROM settings WHERE key = ?", [key]);
  if (!row) return fallback;
  const parsed = typeof row.value === "string" ? safeParse(row.value) : row.value;
  if (parsed === undefined) return fallback;
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    fallback &&
    typeof fallback === "object" &&
    !Array.isArray(fallback)
  ) {
    return { ...(fallback as object), ...(parsed as object) } as T;
  }
  return parsed as T;
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export async function setSetting(key: string, value: unknown) {
  await execute(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}
