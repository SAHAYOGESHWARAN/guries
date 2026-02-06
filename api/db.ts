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

        // Create assets table
        await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        asset_name VARCHAR(255) NOT NULL,
        asset_type VARCHAR(100),
        asset_category VARCHAR(100),
        asset_format VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        repository VARCHAR(255),
        application_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[DB] Assets table ready');

        // Create index for faster queries
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)
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
