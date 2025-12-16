const Database = require('better-sqlite3');
const path = require('path');

// Create Asset Category Master table migration
function createAssetCategoryMaster() {
    const dbPath = path.join(__dirname, '../mcc_db.sqlite');
    const db = new Database(dbPath);

    try {
        console.log('Creating asset_category_master table...');

        // Create asset category master table
        db.exec(`
            CREATE TABLE IF NOT EXISTS asset_category_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_name TEXT NOT NULL UNIQUE,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default asset categories
        const insertCategory = db.prepare(`
            INSERT OR IGNORE INTO asset_category_master (category_name, description) 
            VALUES (?, ?)
        `);

        const defaultCategories = [
            ['what science can do', 'Content about scientific capabilities and applications'],
            ['how to guides', 'Step-by-step instructional content'],
            ['case studies', 'Real-world examples and success stories'],
            ['product features', 'Content highlighting product capabilities'],
            ['industry insights', 'Market trends and industry analysis'],
            ['best practices', 'Recommended approaches and methodologies'],
            ['troubleshooting', 'Problem-solving and technical support content'],
            ['news and updates', 'Latest announcements and developments'],
            ['educational content', 'Learning and training materials'],
            ['comparison guides', 'Product and service comparisons']
        ];

        defaultCategories.forEach(([name, description]) => {
            insertCategory.run(name, description);
        });

        console.log('Asset category master table created successfully with default categories');

    } catch (error) {
        console.error('Error creating asset category master table:', error);
        throw error;
    } finally {
        db.close();
    }
}

if (require.main === module) {
    createAssetCategoryMaster();
}

module.exports = { createAssetCategoryMaster };