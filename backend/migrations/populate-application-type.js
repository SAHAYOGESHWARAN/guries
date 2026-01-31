const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

function runMigration() {
    const db = new Database(dbPath);

    try {
        // Check if application_type column exists
        const tableInfo = db.prepare("PRAGMA table_info(assets)").all();
        const hasApplicationType = tableInfo.some(col => col.name === 'application_type');

        if (!hasApplicationType) {
            db.exec('ALTER TABLE assets ADD COLUMN application_type VARCHAR(50)');
        }

        // Categorize SMM assets
        db.prepare(`
            UPDATE assets 
            SET application_type = 'smm'
            WHERE application_type IS NULL 
            AND (
                content_type LIKE '%SMM%'
                OR asset_type LIKE '%Social%'
                OR asset_type LIKE '%Reel%'
                OR asset_type LIKE '%Post%'
            )
        `).run();

        // Categorize SEO assets
        db.prepare(`
            UPDATE assets 
            SET application_type = 'seo'
            WHERE application_type IS NULL 
            AND (
                content_type LIKE '%Backlink%'
                OR asset_type LIKE '%Blog%'
                OR asset_type LIKE '%Infographic%'
            )
        `).run();

        // Categorize Web assets
        db.prepare(`
            UPDATE assets 
            SET application_type = 'web'
            WHERE application_type IS NULL 
            AND (
                content_type LIKE '%Web%'
                OR content_type LIKE '%Service%'
                OR asset_type LIKE '%Banner%'
                OR asset_type LIKE '%Graphic%'
                OR asset_type LIKE '%Thumbnail%'
            )
        `).run();

        // Default remaining assets to web
        db.prepare(`
            UPDATE assets 
            SET application_type = 'web'
            WHERE application_type IS NULL
        `).run();

        db.close();
        return true;
    } catch (error) {
        console.error('Migration failed:', error);
        db.close();
        return false;
    }
}

if (require.main === module) {
    const success = runMigration();
    process.exit(success ? 0 : 1);
}

module.exports = { runMigration };
