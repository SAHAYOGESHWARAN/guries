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
        console.log('🔄 Running linking fields migration...');

        const migrationPath = path.join(__dirname, 'migrations', 'add_linking_fields_to_services.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('📊 Checking services table structure...');

        const result = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'services' 
            AND column_name IN ('has_subservices', 'subservice_count', 'primary_subservice_id', 'featured_asset_id', 'asset_count', 'knowledge_topic_id')
            ORDER BY ordinal_position
        `);

        console.log('\nLinking fields in services table:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'none'})`);
        });

        const countResult = await pool.query('SELECT COUNT(*) as count FROM services');
        console.log(`\n📦 Total services in database: ${countResult.rows[0].count}`);

        // Show sample data
        const sampleResult = await pool.query(`
            SELECT 
                id, 
                service_name,
                has_subservices,
                subservice_count,
                asset_count
            FROM services 
            LIMIT 3
        `);

        if (sampleResult.rows.length > 0) {
            console.log('\n📋 Sample services with linking data:');
            sampleResult.rows.forEach(row => {
                console.log(`  - ${row.service_name}:`);
                console.log(`    Has sub-services: ${row.has_subservices}`);
                console.log(`    Sub-service count: ${row.subservice_count}`);
                console.log(`    Asset count: ${row.asset_count}`);
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
