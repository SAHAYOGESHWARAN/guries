// Use the same database wrapper as the backend
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
console.log('Database path:', dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create a wrapper similar to the backend
const pool = {
    query: async (sql, params) => {
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
                } catch (e) {
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
        } catch (error) {
            console.error('[DB] Database error:', error.message);
            throw error;
        }
    }
};

async function seed() {
    console.log('🌱 Seeding test data...');

    try {
        // Create assets table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_name TEXT NOT NULL,
        asset_type TEXT,
        status TEXT DEFAULT 'draft'
      )
    `);

        console.log('Table created');

        // Insert test asset
        const res = await pool.query(
            'INSERT INTO assets (asset_name, asset_type, status) VALUES (?, ?, ?)',
            ['Test Asset', 'Article', 'Pending QC Review']
        );

        console.log('Insert result:', res);

        // Query data
        const result = await pool.query('SELECT COUNT(*) as count FROM assets');
        console.log('Count result:', result);

        if (result.rows.length > 0 && result.rows[0].count > 0) {
            console.log('✅ Seeding successful!');
        } else {
            console.log('❌ No data inserted');
        }

        db.close();
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        db.close();
        process.exit(1);
    }
}

seed();
