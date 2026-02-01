
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

type PoolLike = {
    query: (sql: string, params?: any[]) => Promise<{ rows?: any[]; info?: any }>;
    end: () => Promise<void> | void;
    on?: (evt: string, cb: any) => void;
};

let pool: any;

if ((process.env.DB_CLIENT || '').toLowerCase() === 'pg' || process.env.USE_PG === 'true') {
    // Use Postgres Pool when explicitly requested
    const { Pool } = require('pg');
    const pgPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'mcc_db',
        password: process.env.DB_PASSWORD || 'password',
        port: parseInt(process.env.DB_PORT || '5432'),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pgPool.on('error', (err: any) => {
        console.error('Unexpected Postgres pool error', err);
        if (process.env.NODE_ENV === 'production') (process as any).exit(-1);
    });

    pool = pgPool as any;
} else {
    // Default: use SQLite with better-sqlite3 and provide a pg-like `query` method
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');

    try {
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    } catch (e) {
        // ignore
    }

    const sqliteDb = new Database(dbPath);

    pool = {
        query: async (sql: string, params?: any[]) => {
            try {
                const stmt = sqliteDb.prepare(sql);
                const lower = sql.trim().toLowerCase();
                if (lower.startsWith('select') || lower.startsWith('pragma')) {
                    const rows = stmt.all(params || []);
                    return { rows };
                }
                const info = stmt.run(params || []);
                return { rows: [], info };
            } catch (err) {
                throw err;
            }
        },
        end: async () => {
            try {
                sqliteDb.close();
            } catch (e) {
                // ignore
            }
        },
        on: (_: string, __: any) => { /* noop */ }
    };
}

export { pool };

