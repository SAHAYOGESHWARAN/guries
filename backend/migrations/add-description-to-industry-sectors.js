/**
 * Migration: Add description field to industry_sectors table
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Adding description field to industry_sectors table...');

try {
    // Check if description column already exists
    const tableInfo = db.pragma('table_info(industry_sectors)');
    const hasDescription = tableInfo.some(col => col.name === 'description');

    if (!hasDescription) {
        db.exec(`
            ALTER TABLE industry_sectors 
            ADD COLUMN description TEXT
        `);
        console.log('✅ Added description column to industry_sectors table');
    } else {
        console.log('⏭️  Description column already exists');
    }

    // Verify the table structure
    const finalInfo = db.pragma('table_info(industry_sectors)');
    console.log('\n📋 Final industry_sectors table structure:');
    finalInfo.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}`);
    });

} catch (err) {
    console.error('❌ Error:', err.message);
}

db.close();
console.log('\nMigration complete');
