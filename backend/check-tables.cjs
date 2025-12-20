const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('📋 Checking existing tables...');

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('\n🗂️  All tables:');
tables.forEach(table => {
    console.log(`  - ${table.name}`);
});

// Check for format-related tables
const formatTables = tables.filter(table => table.name.toLowerCase().includes('format'));
console.log('\n🎯 Format-related tables:');
if (formatTables.length > 0) {
    formatTables.forEach(table => {
        console.log(`  - ${table.name}`);

        // Get table schema
        const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
        console.log('    Columns:');
        schema.forEach(col => {
            console.log(`      - ${col.name} (${col.type})`);
        });
    });
} else {
    console.log('  No format-related tables found');
}

db.close();