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
        console.log('🚀 Starting web_meta_description migration...');

        const migrationPath = path.join(__dirname, 'migrations', 'add-web-meta-description.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(migrationSQL);

        console.log('✅ web_meta_description migration completed successfully!');
        console.log('📋 Added column: web_meta_description (VARCHAR 160)');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
}

runMigration();