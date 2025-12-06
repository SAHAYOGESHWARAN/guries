// Migration runner using Node.js
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mcc_db',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function runMigration() {
    console.log('========================================');
    console.log('Asset Library Linking - Database Migration');
    console.log('========================================\n');

    try {
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'add-asset-linking-columns.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Running migration...\n');

        // Split by semicolons and run each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                await client.query(statement);
                console.log('✓ Executed:', statement.substring(0, 60) + '...');
            }
        }

        console.log('\n========================================');
        console.log('Migration completed successfully!');
        console.log('========================================\n');

        // Verify the changes
        console.log('Verifying changes...\n');

        const result = await client.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'assets' 
            AND column_name IN ('linked_service_ids', 'linked_sub_service_ids')
        `);

        if (result.rows.length === 2) {
            console.log('✓ Columns created successfully:');
            result.rows.forEach(row => {
                console.log(`  - ${row.column_name} (${row.data_type})`);
            });
        } else {
            console.log('⚠ Warning: Expected 2 columns, found', result.rows.length);
        }

        // Check indexes
        const indexResult = await client.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'assets'
            AND indexname IN ('idx_assets_linked_services', 'idx_assets_linked_sub_services')
        `);

        console.log('\n✓ Indexes created:', indexResult.rows.length);
        indexResult.rows.forEach(row => {
            console.log(`  - ${row.indexname}`);
        });

        // Count assets
        const countResult = await client.query('SELECT COUNT(*) as total FROM assets');
        console.log(`\n✓ Total assets in database: ${countResult.rows[0].total}`);

        client.release();

        console.log('\n========================================');
        console.log('Next steps:');
        console.log('1. Restart backend: cd backend && npm run dev');
        console.log('2. Restart frontend: npm run dev');
        console.log('3. Test in browser: http://localhost:5173');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n========================================');
        console.error('Migration failed!');
        console.error('========================================');
        console.error('Error:', error.message);
        console.error('\nPlease check:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database "mcc_db" exists');
        console.error('3. Credentials in .env file are correct');
        console.error('4. You have ALTER TABLE permissions\n');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
