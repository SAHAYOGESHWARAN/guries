const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'marketing_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function runMigration() {
    try {
        console.log('🚀 Starting Asset Applications migration...');

        const migrationPath = path.join(__dirname, 'migrations', 'add-asset-applications.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(migrationSQL);

        console.log('✅ Asset Applications migration completed successfully!');
        console.log('📋 Added columns:');
        console.log('   - application_type');
        console.log('   - Web fields: web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2, web_thumbnail, web_body_content');
        console.log('   - SMM fields: smm_platform, smm_title, smm_tag, smm_url, smm_description, smm_hashtags, smm_media_url, smm_media_type');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
}

runMigration();
