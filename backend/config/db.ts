import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const pool = {
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
            console.error('Database error:', error.message);
            throw error;
        }
    },
    end: async () => {
        db.close();
    }
};

export { pool };
