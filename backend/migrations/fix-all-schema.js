/**
 * Migration: Fix all table schema mismatches
 * Adds missing columns that the application expects
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Starting comprehensive schema fix...');

// Helper function to add column if not exists
function addColumnIfNotExists(table, column, type) {
    try {
        const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
        const columnExists = tableInfo.some(col => col.name === column);
        if (!columnExists) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
            console.log(`✓ Added ${column} to ${table}`);
        } else {
            console.log(`  ${column} already exists in ${table}`);
        }
    } catch (e) {
        console.log(`  Error with ${table}.${column}:`, e.message);
    }
}

// Fix platforms table
console.log('\n--- Fixing platforms table ---');
addColumnIfNotExists('platforms', 'content_types_count', 'INTEGER DEFAULT 0');
addColumnIfNotExists('platforms', 'asset_types_count', 'INTEGER DEFAULT 0');
addColumnIfNotExists('platforms', 'recommended_size', 'TEXT');
addColumnIfNotExists('platforms', 'scheduling', 'TEXT DEFAULT "Manual"');

// Fix countries table
console.log('\n--- Fixing countries table ---');
addColumnIfNotExists('countries', 'has_backlinks', 'INTEGER DEFAULT 0');
addColumnIfNotExists('countries', 'has_content', 'INTEGER DEFAULT 0');
addColumnIfNotExists('countries', 'has_smm', 'INTEGER DEFAULT 0');

// Fix workflow_stages table (already done but ensure)
console.log('\n--- Fixing workflow_stages table ---');
addColumnIfNotExists('workflow_stages', 'workflow_name', 'TEXT');
addColumnIfNotExists('workflow_stages', 'total_stages', 'INTEGER DEFAULT 1');
addColumnIfNotExists('workflow_stages', 'stage_label', 'TEXT');
addColumnIfNotExists('workflow_stages', 'color_tag', 'TEXT DEFAULT "blue"');
addColumnIfNotExists('workflow_stages', 'active_flag', 'TEXT DEFAULT "Active"');

// Fix seo_errors table
console.log('\n--- Fixing seo_errors table ---');
addColumnIfNotExists('seo_errors', 'category', 'TEXT');
addColumnIfNotExists('seo_errors', 'severity', 'TEXT DEFAULT "Medium"');

// Fix industry_sectors table
console.log('\n--- Fixing industry_sectors table ---');
addColumnIfNotExists('industry_sectors', 'sector', 'TEXT');
addColumnIfNotExists('industry_sectors', 'application', 'TEXT');
addColumnIfNotExists('industry_sectors', 'country', 'TEXT');

// Fix content_types table
console.log('\n--- Fixing content_types table ---');
addColumnIfNotExists('content_types', 'category', 'TEXT DEFAULT "Long-form"');
addColumnIfNotExists('content_types', 'default_attributes', 'TEXT');
addColumnIfNotExists('content_types', 'use_in_campaigns', 'INTEGER DEFAULT 0');

// Fix users table
console.log('\n--- Fixing users table ---');
addColumnIfNotExists('users', 'password_hash', 'TEXT');
addColumnIfNotExists('users', 'department', 'TEXT');
addColumnIfNotExists('users', 'country', 'TEXT');
addColumnIfNotExists('users', 'last_login', 'DATETIME');

// Fix assets table
console.log('\n--- Fixing assets table ---');
addColumnIfNotExists('assets', 'content_type', 'TEXT');
addColumnIfNotExists('assets', 'dimensions', 'TEXT');
addColumnIfNotExists('assets', 'linked_task_id', 'INTEGER');
addColumnIfNotExists('assets', 'linked_campaign_id', 'INTEGER');
addColumnIfNotExists('assets', 'linked_project_id', 'INTEGER');
addColumnIfNotExists('assets', 'linked_service_id', 'INTEGER');
addColumnIfNotExists('assets', 'linked_sub_service_id', 'INTEGER');
addColumnIfNotExists('assets', 'linked_repository_item_id', 'INTEGER');
addColumnIfNotExists('assets', 'qc_status', 'TEXT');
addColumnIfNotExists('assets', 'qc_checklist_items', 'TEXT');
addColumnIfNotExists('assets', 'version_number', 'TEXT DEFAULT "v1.0"');
addColumnIfNotExists('assets', 'designed_by', 'INTEGER');
addColumnIfNotExists('assets', 'created_by', 'INTEGER');
addColumnIfNotExists('assets', 'updated_by', 'INTEGER');

console.log('\n✓ Schema fix completed!');
db.close();
