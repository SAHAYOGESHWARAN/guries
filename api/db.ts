import { Pool, PoolClient } from 'pg';

// Global pool for serverless environments
const globalForPg = global as any;

export const getPool = (): Pool => {
    if (!globalForPg.pgPool) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        console.log('[DB] Creating new pool with DATABASE_URL');

        globalForPg.pgPool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        globalForPg.pgPool.on('error', (err: any) => {
            console.error('[DB] Pool error:', err);
            globalForPg.pgPool = null;
        });
    }

    return globalForPg.pgPool;
};

export const initializeDatabase = async (): Promise<void> => {
    const pool = getPool();
    const client = await pool.connect();

    try {
        console.log('[DB] Initializing database schema...');

        // Create users table first (referenced by assets)
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[DB] Users table ready');

        // Create services table (referenced by assets)
        await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(255) NOT NULL,
        service_code VARCHAR(100),
        slug VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[DB] Services table ready');

        // Create sub_services table (referenced by assets)
        await client.query(`
      CREATE TABLE IF NOT EXISTS sub_services (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        sub_service_name VARCHAR(255) NOT NULL,
        sub_service_code VARCHAR(100),
        slug VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[DB] Sub-Services table ready');

        // Create keywords table (referenced by assets)
        await client.query(`
      CREATE TABLE IF NOT EXISTS keywords (
        id SERIAL PRIMARY KEY,
        keyword_name VARCHAR(255) NOT NULL,
        keyword_intent VARCHAR(100),
        keyword_type VARCHAR(100),
        language VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[DB] Keywords table ready');

        // Create comprehensive assets table
        await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        asset_name VARCHAR(255) NOT NULL,
        asset_type VARCHAR(100),
        asset_category VARCHAR(100),
        asset_format VARCHAR(100),
        content_type VARCHAR(100),
        application_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        qc_status VARCHAR(50),
        file_url TEXT,
        thumbnail_url TEXT,
        file_size INTEGER,
        file_type VARCHAR(100),
        seo_score INTEGER,
        grammar_score INTEGER,
        keywords TEXT,
        workflow_stage VARCHAR(100) DEFAULT 'draft',
        workflow_log TEXT,
        linked_service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
        linked_sub_service_id INTEGER REFERENCES sub_services(id) ON DELETE SET NULL,
        linked_service_ids TEXT,
        linked_sub_service_ids TEXT,
        static_service_links TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        repository VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[DB] Assets table ready');

        // Create indexes for faster queries
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC)
    `);

        console.log('[DB] Database schema initialized successfully');
    } catch (error: any) {
        console.error('[DB] Schema initialization error:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

export const query = async (text: string, params?: any[]): Promise<any> => {
    const pool = getPool();
    const client = await pool.connect();

    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
};
