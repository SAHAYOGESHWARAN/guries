/**
 * Migration: Ensure Complete Schema
 * This migration ensures all required tables exist with proper structure
 * Run on every startup to guarantee schema consistency
 */

const fs = require('fs');
const path = require('path');

async function ensureCompleteSchema(pool) {
    try {
        console.log('🔄 Ensuring complete database schema...');

        // Read the main schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split into individual statements and execute
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            try {
                await pool.query(statement);
            } catch (error) {
                // Ignore "already exists" errors
                if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint failed')) {
                    console.warn(`⚠️  Schema statement warning: ${error.message}`);
                }
            }
        }

        console.log('✅ Schema verification complete');

        // Verify critical tables exist
        const criticalTables = [
            'users',
            'assets',
            'services',
            'sub_services',
            'service_asset_links',
            'subservice_asset_links',
            'asset_category_master',
            'asset_type_master',
            'asset_formats',
            'keywords',
            'keyword_asset_links',
            'projects',
            'campaigns',
            'tasks',
            'asset_qc_reviews',
            'qc_audit_log'
        ];

        for (const table of criticalTables) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${table} LIMIT 1`);
                console.log(`✅ Table '${table}' exists`);
            } catch (error) {
                console.error(`❌ Critical table '${table}' missing: ${error.message}`);
                throw error;
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Schema verification failed:', error.message);
        throw error;
    }
}

module.exports = { ensureCompleteSchema };
