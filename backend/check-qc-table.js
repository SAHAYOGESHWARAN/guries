const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

// Check if asset_qc_reviews table exists
const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='asset_qc_reviews'").get();
console.log('asset_qc_reviews table exists:', !!table);

if (table) {
    const columns = db.pragma('table_info(asset_qc_reviews)');
    console.log('\nColumns:');
    columns.forEach(col => console.log('  -', col.name, '(' + col.type + ')'));

    // Check row count
    const count = db.prepare('SELECT COUNT(*) as count FROM asset_qc_reviews').get();
    console.log('\nTotal QC reviews:', count.count);
} else {
    console.log('\nTable does not exist. Creating it...');
    db.exec(`
    CREATE TABLE asset_qc_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      qc_reviewer_id INTEGER,
      qc_score INTEGER,
      checklist_completion INTEGER,
      qc_remarks TEXT,
      qc_decision VARCHAR(50),
      checklist_items TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log('Table created successfully!');
}

db.close();
