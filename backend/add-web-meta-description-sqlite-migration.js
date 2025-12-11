const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

async function runMigration() {
    try {
        console.log('🚀 Starting web_meta_description SQLite migration...');

        // Check if column already exists
        const columns = db.prepare("PRAGMA table_info(assets)").all();
        const hasWebMetaDescription = columns.some(col => col.name === 'web_meta_description');

        if (!hasWebMetaDescription) {
            // Add web_meta_description column
            db.exec(`
                ALTER TABLE assets ADD COLUMN web_meta_description TEXT;
            `);
            console.log('✅ Added web_meta_description column to assets table');
        } else {
            console.log('ℹ️  web_meta_description column already exists');
        }

        // Also add other missing QC workflow fields if they don't exist
        const qcFields = [
            { name: 'submitted_by', type: 'INTEGER' },
            { name: 'submitted_at', type: 'DATETIME' },
            { name: 'qc_reviewer_id', type: 'INTEGER' },
            { name: 'qc_reviewed_at', type: 'DATETIME' },
            { name: 'qc_score', type: 'INTEGER' },
            { name: 'qc_remarks', type: 'TEXT' },
            { name: 'rework_count', type: 'INTEGER DEFAULT 0' },
            { name: 'linking_active', type: 'INTEGER DEFAULT 0' },
            { name: 'seo_score', type: 'INTEGER' },
            { name: 'grammar_score', type: 'INTEGER' },
            { name: 'keywords', type: 'TEXT' },
            { name: 'repository', type: 'TEXT DEFAULT "Content Repository"' },
            { name: 'usage_status', type: 'TEXT DEFAULT "Available"' },
            { name: 'mapped_to', type: 'TEXT' },
            { name: 'name', type: 'TEXT' },
            { name: 'type', type: 'TEXT' },
            { name: 'date', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
        ];

        for (const field of qcFields) {
            const hasField = columns.some(col => col.name === field.name);
            if (!hasField) {
                try {
                    db.exec(`ALTER TABLE assets ADD COLUMN ${field.name} ${field.type};`);
                    console.log(`✅ Added ${field.name} column to assets table`);
                } catch (error) {
                    console.log(`ℹ️  ${field.name} column may already exist or error: ${error.message}`);
                }
            }
        }

        console.log('✅ web_meta_description and QC workflow migration completed successfully!');
        console.log('📋 Migration summary:');
        console.log('   - web_meta_description: SEO meta description field');
        console.log('   - QC workflow fields: submitted_by, qc_score, qc_remarks, etc.');
        console.log('   - Asset management fields: name, type, repository, etc.');

        db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        db.close();
        process.exit(1);
    }
}

runMigration();