/**
 * Migration: Add SEO Asset specific fields to assets table
 * These fields support the 12-step SEO Asset workflow
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Starting SEO Asset fields migration...');

const seoFields = [
    // SEO Metadata fields (Step 4)
    { name: 'seo_title', type: 'TEXT' },
    { name: 'seo_meta_title', type: 'TEXT' },
    { name: 'seo_description', type: 'TEXT' },
    { name: 'seo_service_url', type: 'TEXT' },
    { name: 'seo_blog_url', type: 'TEXT' },
    { name: 'seo_anchor_text', type: 'TEXT' },

    // Keywords fields (Step 5)
    { name: 'seo_primary_keyword_id', type: 'INTEGER' },
    { name: 'seo_lsi_keywords', type: 'TEXT' }, // JSON array of keyword IDs

    // Domain fields (Step 6)
    { name: 'seo_domain_type', type: 'TEXT' },
    { name: 'seo_domains', type: 'TEXT' }, // JSON array of domain objects

    // Blog content (Step 8)
    { name: 'seo_blog_content', type: 'TEXT' },

    // Classification (Step 3)
    { name: 'seo_sector_id', type: 'INTEGER' },
    { name: 'seo_industry_id', type: 'INTEGER' },

    // Team assignment (Step 10)
    { name: 'assigned_team_members', type: 'TEXT' }, // JSON array of user IDs

    // Additional workflow fields
    { name: 'updated_by', type: 'INTEGER' }
];

try {
    // Get existing columns
    const tableInfo = db.pragma('table_info(assets)');
    const existingColumns = tableInfo.map(col => col.name);

    console.log('Existing columns:', existingColumns.length);

    // Add missing columns
    for (const field of seoFields) {
        if (!existingColumns.includes(field.name)) {
            const sql = `ALTER TABLE assets ADD COLUMN ${field.name} ${field.type}`;
            console.log(`Adding column: ${field.name}`);
            db.exec(sql);
            console.log(`✓ Added ${field.name}`);
        } else {
            console.log(`- Column ${field.name} already exists`);
        }
    }

    console.log('\n✅ SEO Asset fields migration completed successfully!');

} catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
} finally {
    db.close();
}
