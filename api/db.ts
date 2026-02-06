import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export const getPool = (): Pool => {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        pool.on('error', (err) => {
            console.error('[DB] Pool error:', err);
            pool = null;
        });
    }

    return pool;
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
