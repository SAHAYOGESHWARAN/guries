/**
 * Migration: Add SEO Asset specific columns to assets table
 * This supports the 12-step SEO Asset workflow
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

const columns = [
    // Step 1: Asset ID Selection
    { name: 'linked_asset_id', type: 'INTEGER', comment: 'Reference to existing asset ID' },

    // Step 3: Asset Classification
    { name: 'sector_id', type: 'VARCHAR(255)', comment: 'Sector from Industry-Sector Master' },
    { name: 'industry_id', type: 'VARCHAR(255)', comment: 'Industry from Industry-Sector Master' },

    // Step 4: SEO Metadata & Anchor Text
    { name: 'seo_title', type: 'VARCHAR(500)', comment: 'SEO Title' },
    { name: 'seo_meta_title', type: 'VARCHAR(60)', comment: 'Meta Title (60 chars max)' },
    { name: 'seo_description', type: 'TEXT', comment: 'SEO Description' },
    { name: 'service_url', type: 'VARCHAR(1000)', comment: 'Service URL (optional)' },
    { name: 'blog_url', type: 'VARCHAR(1000)', comment: 'Blog URL (optional)' },
    { name: 'anchor_text', type: 'VARCHAR(500)', comment: 'Anchor Text for backlinks' },

    // Step 5: Keywords
    { name: 'primary_keyword_id', type: 'INTEGER', comment: 'Primary Keyword ID from Keyword Master' },
    { name: 'lsi_keywords', type: 'TEXT', comment: 'JSON array of LSI Keyword IDs' },

    // Step 6: Domain Type & Domains
    { name: 'domain_type', type: 'VARCHAR(100)', comment: 'Domain Type from Backlink Master' },
    { name: 'seo_domains', type: 'TEXT', comment: 'JSON array of SEO domains with QC status' },

    // Step 8: Blog Content
    { name: 'blog_content', type: 'TEXT', comment: 'Rich text blog content (when Asset Type = Blog Posting)' },

    // Step 10: Designer & Workflow
    { name: 'assigned_team_members', type: 'TEXT', comment: 'JSON array of assigned team member IDs' }
];

console.log('Starting SEO Asset columns migration...');

// Check existing columns
const tableInfo = db.pragma('table_info(assets)');
const existingColumns = tableInfo.map(col => col.name);

let addedCount = 0;
let skippedCount = 0;

for (const col of columns) {
    if (existingColumns.includes(col.name)) {
        console.log(`  ⏭️  Column '${col.name}' already exists, skipping`);
        skippedCount++;
    } else {
        try {
            const sql = `ALTER TABLE assets ADD COLUMN ${col.name} ${col.type}`;
            db.exec(sql);
            console.log(`  ✅ Added column '${col.name}' (${col.type})`);
            addedCount++;
        } catch (err) {
            console.error(`  ❌ Error adding column '${col.name}':`, err.message);
        }
    }
}

console.log(`\nMigration complete: ${addedCount} columns added, ${skippedCount} columns skipped`);

db.close();
