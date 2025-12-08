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
        console.log('🔄 Running asset fields migration...');

        const migrationPath = path.join(__dirname, 'migrations', 'add_asset_fields.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('📊 Checking content_repository table structure...');

        const result = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'content_repository' 
            AND column_name IN ('asset_category', 'asset_format', 'linked_page_ids', 'mapped_to', 'qc_score')
            ORDER BY ordinal_position
        `);

        console.log('\nAsset fields in content_repository table:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'none'})`);
        });

        const countResult = await pool.query('SELECT COUNT(*) as count FROM content_repository');
        console.log(`\n📦 Total assets in database: ${countResult.rows[0].count}`);

        // Show sample data
        const sampleResult = await pool.query(`
            SELECT 
                id, 
                content_title_clean,
                asset_type,
                asset_category,
                asset_format,
                qc_score,
                status
            FROM content_repository 
            LIMIT 3
        `);

        if (sampleResult.rows.length > 0) {
            console.log('\n📋 Sample assets with new fields:');
            sampleResult.rows.forEach(row => {
                console.log(`  - ${row.content_title_clean || 'Untitled'}:`);
                console.log(`    Type: ${row.asset_type || 'N/A'}`);
                console.log(`    Category: ${row.asset_category || 'N/A'}`);
                console.log(`    Format: ${row.asset_format || 'N/A'}`);
                console.log(`    QC Score: ${row.qc_score || 'Not set'}`);
                console.log(`    Status: ${row.status || 'N/A'}`);
            });
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
