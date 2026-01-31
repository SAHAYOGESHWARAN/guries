/**
 * Migration: Fix Asset Master Tables
 * Creates asset_category_master and asset_type_master tables if they don't exist
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');
const db = new Database(dbPath);

try {
    console.log('🔍 Checking for asset_category_master table...');
    const categoryTable = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='asset_category_master'"
    ).get();

    if (!categoryTable) {
        console.log('📦 Creating asset_category_master table...');
        db.exec(`
            CREATE TABLE asset_category_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_name VARCHAR(255) NOT NULL,
                word_count INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ asset_category_master table created');
    } else {
        console.log('✅ asset_category_master table already exists');
        // Check if brand column exists
        const columns = db.pragma('table_info(asset_category_master)');
        const hasBrand = columns.some(col => col.name === 'brand');
        if (hasBrand) {
            console.log('   ✓ brand column exists');
        } else {
            console.log('   ⚠ brand column missing - this is expected for current schema');
        }
    }

    console.log('\n🔍 Checking for asset_type_master table...');
    const typeTable = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='asset_type_master'"
    ).get();

    if (!typeTable) {
        console.log('📦 Creating asset_type_master table...');
        db.exec(`
            CREATE TABLE asset_type_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_type_name VARCHAR(255) NOT NULL,
                word_count INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ asset_type_master table created');
    } else {
        console.log('✅ asset_type_master table already exists');
        // Check if brand column exists
        const columns = db.pragma('table_info(asset_type_master)');
        const hasBrand = columns.some(col => col.name === 'brand');
        if (hasBrand) {
            console.log('   ✓ brand column exists');
        } else {
            console.log('   ⚠ brand column missing - this is expected for current schema');
        }
    }

    db.close();
    console.log('\n✅ Migration completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    db.close();
    process.exit(1);
}
