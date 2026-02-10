import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

// FORCE PostgreSQL in production - SQLite doesn't persist on Vercel
const usePostgres = process.env.NODE_ENV === 'production' || process.env.USE_PG === 'true' || process.env.DB_CLIENT === 'pg';

let pool: any;
let dbInitialized = false;

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

    // Wrap pool.query to ensure schema is initialized
    const originalQuery = pool.query.bind(pool);
    pool.query = async (sql: string, params?: any[]) => {
        // Initialize schema on first query if not already done
        if (!dbInitialized && usePostgres) {
            try {
                dbInitialized = true;
                console.log('[DB] Running schema initialization on first query...');

                const client = await pool.connect();
                try {
                    // Create all essential tables
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
                        `CREATE TABLE IF NOT EXISTS brands (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            code TEXT,
                            industry TEXT,
                            website TEXT,
                            status TEXT DEFAULT 'active',
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
                        `CREATE TABLE IF NOT EXISTS assets (
                            id SERIAL PRIMARY KEY,
                            asset_name TEXT NOT NULL,
                            asset_type TEXT,
                            asset_category TEXT,
                            asset_format TEXT,
                            status TEXT DEFAULT 'draft',
                            qc_status TEXT,
                            file_url TEXT,
                            created_by INTEGER,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS projects (
                            id SERIAL PRIMARY KEY,
                            project_name TEXT NOT NULL,
                            project_code TEXT UNIQUE,
                            description TEXT,
                            status TEXT DEFAULT 'Planned',
                            start_date DATE,
                            end_date DATE,
                            budget DECIMAL(10,2),
                            owner_id INTEGER REFERENCES users(id),
                            brand_id INTEGER REFERENCES brands(id),
                            linked_service_id INTEGER REFERENCES services(id),
                            priority TEXT DEFAULT 'Medium',
                            sub_services TEXT,
                            outcome_kpis TEXT,
                            expected_outcome TEXT,
                            team_members TEXT,
                            weekly_report INTEGER DEFAULT 1,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS campaigns (
                            id SERIAL PRIMARY KEY,
                            campaign_name TEXT NOT NULL,
                            campaign_type TEXT DEFAULT 'Content',
                            status TEXT DEFAULT 'planning',
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
                            project_id INTEGER REFERENCES projects(id),
                            campaign_id INTEGER REFERENCES campaigns(id),
                            due_date DATE,
                            campaign_type TEXT,
                            sub_campaign TEXT,
                            progress_stage TEXT DEFAULT 'Not Started',
                            qc_stage TEXT DEFAULT 'Pending',
                            estimated_hours DECIMAL(5,2),
                            tags TEXT,
                            repo_links TEXT,
                            rework_count INTEGER DEFAULT 0,
                            repo_link_count INTEGER DEFAULT 0,
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
                    console.log('[DB] ✅ Schema initialized successfully');
                } finally {
                    client.release();
                }
            } catch (err: any) {
                console.error('[DB] Schema initialization error:', err.message);
                dbInitialized = false; // Reset flag to retry
            }
        }

        // Execute the actual query
        return originalQuery(sql, params);
    };

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
