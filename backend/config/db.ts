import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const usePostgres = process.env.USE_PG === 'true' || process.env.DB_CLIENT === 'pg';

let pool: any;

if (usePostgres) {
    // PostgreSQL Configuration (for production on Vercel)
    console.log('[DB] Initializing PostgreSQL connection...');

    const { Pool } = require('pg');

    const connectionString = process.env.DATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: any) => {
        console.error('[DB] Unexpected error on idle client:', err);
    });

    console.log('[DB] ✅ PostgreSQL connection pool created for production');
} else {
    // SQLite Configuration (for local development)
    console.log('[DB] Initializing SQLite connection...');

    const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    pool = {
        query: async (sql: string, params?: any[]) => {
            try {
                const trimmedSql = sql.trim().toUpperCase();

                if (trimmedSql.startsWith('CREATE') || trimmedSql.startsWith('DROP') || trimmedSql.startsWith('ALTER')) {
                    try {
                        const statements = sql.split(';').filter(s => s.trim());
                        for (const stmt of statements) {
                            if (stmt.trim()) {
                                db.prepare(stmt).run();
                            }
                        }
                        return { rows: [], rowCount: 0 };
                    } catch (e: any) {
                        if (!e.message.includes('already exists')) throw e;
                        return { rows: [], rowCount: 0 };
                    }
                }

                if (trimmedSql.startsWith('SELECT')) {
                    const stmt = db.prepare(sql);
                    const rows = params ? stmt.all(...params) : stmt.all();
                    return { rows, rowCount: rows.length };
                }

                if (trimmedSql.startsWith('INSERT')) {
                    const stmt = db.prepare(sql);
                    const result = params ? stmt.run(...params) : stmt.run();
                    return {
                        rows: [{ id: Number(result.lastInsertRowid) }],
                        lastID: Number(result.lastInsertRowid),
                        changes: result.changes,
                        rowCount: result.changes
                    };
                }

                if (trimmedSql.startsWith('UPDATE')) {
                    const stmt = db.prepare(sql);
                    const result = params ? stmt.run(...params) : stmt.run();
                    return { rows: [], changes: result.changes, rowCount: result.changes };
                }

                if (trimmedSql.startsWith('DELETE')) {
                    const stmt = db.prepare(sql);
                    const result = params ? stmt.run(...params) : stmt.run();
                    return { rows: [], changes: result.changes, rowCount: result.changes };
                }

                const stmt = db.prepare(sql);
                const rows = params ? stmt.all(...params) : stmt.all();
                return { rows, rowCount: rows.length };
            } catch (error: any) {
                console.error('[DB] Database error:', error.message);
                throw error;
            }
        },
        end: async () => {
            db.close();
        }
    };

    console.log('[DB] ✅ SQLite connection created for local development');
}

export { pool };
