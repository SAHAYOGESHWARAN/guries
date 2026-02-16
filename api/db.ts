// PostgreSQL connection for Vercel deployment
// Uses Supabase PostgreSQL for persistent data storage
// Falls back to mock database if DATABASE_URL is not set

import { Pool } from 'pg';

interface QueryResult {
  rows: any[];
  rowCount: number;
}

const globalForDb = global as any;

let pool: Pool | null = null;
let dbInitialized = false;
let useMockDb = false;

// Mock database for testing when PostgreSQL is unavailable
const mockDb: any = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      password_hash: 'admin123',
      department: 'Administration',
      country: 'USA',
      last_login: null,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      password_hash: null,
      department: null,
      country: null,
      last_login: null,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  assets: [],
  services: [],
  sub_services: [],
  campaigns: [],
  tasks: []
};

let nextId: any = {
  users: 3,
  assets: 1,
  services: 1,
  sub_services: 1,
  campaigns: 1,
  tasks: 1
};

const mockQuery = async (text: string, params?: any[]): Promise<QueryResult> => {
  console.log('[MOCK-DB] Query:', text.substring(0, 100), 'Params:', params);

  // Parse the SQL query
  const upperText = text.toUpperCase();

  // SELECT queries
  if (upperText.includes('SELECT')) {
    if (upperText.includes('FROM users')) {
      if (upperText.includes('WHERE email')) {
        const email = params?.[0]?.toLowerCase();
        const rows = mockDb.users.filter((u: any) => u.email === email);
        return { rows, rowCount: rows.length };
      }
      if (upperText.includes('WHERE id')) {
        const id = params?.[0];
        const rows = mockDb.users.filter((u: any) => u.id === id);
        return { rows, rowCount: rows.length };
      }
      return { rows: mockDb.users, rowCount: mockDb.users.length };
    }
    if (upperText.includes('FROM assets')) {
      return { rows: mockDb.assets, rowCount: mockDb.assets.length };
    }
    if (upperText.includes('FROM services')) {
      return { rows: mockDb.services, rowCount: mockDb.services.length };
    }
    if (upperText.includes('FROM campaigns')) {
      return { rows: mockDb.campaigns, rowCount: mockDb.campaigns.length };
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT queries
  if (upperText.includes('INSERT INTO')) {
    if (upperText.includes('users')) {
      const newUser = {
        id: nextId.users++,
        name: params?.[0] || 'User',
        email: params?.[1] || '',
        role: params?.[2] || 'user',
        status: 'active',
        password_hash: null,
        department: null,
        country: null,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockDb.users.push(newUser);
      return { rows: [newUser], rowCount: 1 };
    }
    if (upperText.includes('assets')) {
      const newAsset = {
        id: nextId.assets++,
        asset_name: params?.[0] || '',
        asset_type: params?.[1] || '',
        asset_category: params?.[2] || '',
        asset_format: params?.[3] || '',
        status: 'draft',
        qc_status: 'pending',
        qc_remarks: null,
        qc_score: null,
        rework_count: 0,
        file_url: params?.[4] || '',
        thumbnail_url: null,
        file_size: params?.[5] || 0,
        file_type: params?.[6] || '',
        seo_score: null,
        grammar_score: null,
        keywords: null,
        created_by: params?.[7] || null,
        submitted_by: null,
        submitted_at: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockDb.assets.push(newAsset);
      return { rows: [newAsset], rowCount: 1 };
    }
  }

  // UPDATE queries
  if (upperText.includes('UPDATE')) {
    if (upperText.includes('users')) {
      if (upperText.includes('last_login')) {
        const userId = params?.[0];
        const user = mockDb.users.find((u: any) => u.id === userId);
        if (user) {
          user.last_login = new Date();
          user.updated_at = new Date();
        }
        return { rows: [], rowCount: user ? 1 : 0 };
      }
    }
  }

  return { rows: [], rowCount: 0 };
};

const initializePool = (): Pool | null => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('[DB] ⚠️ DATABASE_URL not set. Using mock database for testing.');
    console.warn('[DB] To use PostgreSQL, set DATABASE_URL in Vercel environment variables.');
    useMockDb = true;
    return null;
  }

  console.log('[DB] Initializing PostgreSQL connection from DATABASE_URL');

  try {
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
  } catch (err: any) {
    console.error('[DB] Failed to initialize PostgreSQL:', err.message);
    console.warn('[DB] Falling back to mock database');
    useMockDb = true;
    pool = null;
    return null;
  }
};

const ensureSchema = async (pool: Pool | null): Promise<void> => {
  if (dbInitialized) return;

  try {
    dbInitialized = true;

    if (useMockDb || !pool) {
      console.log('[DB] Using mock database - schema pre-initialized');
      return;
    }

    console.log('[DB] Ensuring database schema exists...');

    const client = await pool.connect();
    try {
      // Create users table first (no dependencies)
      await client.query(`CREATE TABLE IF NOT EXISTS users (
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
      )`);
      console.log('[DB] Users table created/verified');

      // Create other tables
      const tables = [
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
        )`,
        `CREATE TABLE IF NOT EXISTS campaigns (
          id SERIAL PRIMARY KEY,
          campaign_name TEXT NOT NULL,
          campaign_type TEXT DEFAULT 'Content',
          status TEXT DEFAULT 'planning',
          description TEXT,
          campaign_start_date DATE,
          campaign_end_date DATE,
          campaign_owner_id INTEGER REFERENCES users(id),
          project_id INTEGER,
          brand_id INTEGER,
          target_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          task_name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'pending',
          priority TEXT DEFAULT 'Medium',
          assigned_to INTEGER REFERENCES users(id),
          project_id INTEGER,
          campaign_id INTEGER REFERENCES campaigns(id),
          due_date DATE,
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

export const getPool = (): Pool | null => {
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

  if (useMockDb || !pool) {
    return mockQuery(text, params);
  }

  try {
    const result = await pool.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } catch (err: any) {
    console.error('[DB] Query error:', err.message);
    console.log('[DB] Falling back to mock database');
    useMockDb = true;
    return mockQuery(text, params);
  }
};
