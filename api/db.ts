// PostgreSQL connection for Vercel deployment
// Uses Supabase PostgreSQL for persistent data storage

import { Pool } from 'pg';

interface QueryResult {
  rows: any[];
  rowCount: number;
}

const globalForDb = global as any;

let pool: Pool | null = null;
let dbInitialized = false;

const initializePool = (): Pool => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
  }

  console.log('[DB] Initializing PostgreSQL connection from DATABASE_URL');

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err: any) => {
    console.error('[DB] Unexpected error on idle client:', err);
  });

  return pool;
};

const ensureSchema = async (pool: Pool): Promise<void> => {
  if (dbInitialized) return;

  try {
    dbInitialized = true;
    console.log('[DB] Ensuring database schema exists...');

    const client = await pool.connect();
    try {
      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user',
          status TEXT DEFAULT 'active',
          password_hash TEXT,
          department TEXT,
          country TEXT,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS assets (
          id SERIAL PRIMARY KEY,
          asset_name TEXT NOT NULL,
          asset_type TEXT,
          asset_category TEXT,
          asset_format TEXT,
          status TEXT DEFAULT 'draft',
          qc_status TEXT DEFAULT 'pending',
          qc_remarks TEXT,
          qc_score INTEGER,
          rework_count INTEGER DEFAULT 0,
          file_url TEXT,
          thumbnail_url TEXT,
          file_size INTEGER,
          file_type TEXT,
          seo_score INTEGER,
          grammar_score INTEGER,
          keywords TEXT,
          created_by INTEGER REFERENCES users(id),
          submitted_by INTEGER REFERENCES users(id),
          submitted_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          service_name TEXT NOT NULL,
          service_code TEXT,
          slug TEXT,
          status TEXT DEFAULT 'draft',
          meta_title TEXT,
          meta_description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS sub_services (
          id SERIAL PRIMARY KEY,
          parent_service_id INTEGER REFERENCES services(id),
          sub_service_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      for (const tableSQL of tables) {
        try {
          await client.query(tableSQL);
        } catch (e: any) {
          if (!e.message.includes('already exists')) {
            console.warn('[DB] Table creation warning:', e.message.substring(0, 80));
          }
        }
      }
      console.log('[DB] ✅ Schema ensured successfully');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[DB] Schema initialization error:', err.message);
    dbInitialized = false;
    throw err;
  }
};

export const getPool = (): Pool => {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = initializePool();
  }
  return globalForDb.pgPool;
};

export const initializeDatabase = async (): Promise<void> => {
  const pool = getPool();
  await ensureSchema(pool);
};

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const pool = getPool();
  await ensureSchema(pool);
  const result = await pool.query(text, params);
  return {
    rows: result.rows,
    rowCount: result.rowCount || 0
  };
};
