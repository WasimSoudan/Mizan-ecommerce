import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as typeof globalThis & { pgPool?: Pool };

export function getDbConfig() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT);
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !Number.isInteger(port) || !database || !user || password === undefined) {
    throw new Error("Set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in .env.local");
  }

  return { host, port, database, user, password };
}

export function getPool() {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool(getDbConfig());
  }

  return globalForPg.pgPool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export function pgCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;
    return typeof code === "string" ? code : null;
  }
  return null;
}
