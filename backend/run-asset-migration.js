const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mcc_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin'
});

async function runMigration() {
    try {
        console.log('🔄 Running asset thumbnail migration...');

        const migrationPath = path.join(__dirname, 'migrations', 'add_thumbnail_url_to_assets.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('📊 Checking assets table structure...');

        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assets' 
            ORDER BY ordinal_position
        `);

        console.log('\nAssets table columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        const countResult = await pool.query('SELECT COUNT(*) as count FROM assets');
        console.log(`\n📦 Total assets in database: ${countResult.rows[0].count}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
