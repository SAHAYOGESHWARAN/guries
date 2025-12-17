const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

function createAssetCategoryMasterTable() {
    const db = new Database(dbPath);

    try {
        console.log('Creating asset_category_master table...');

        // Create asset_category_master table
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
            ['What Science Can Do', 'Content explaining scientific capabilities and applications'],
            ['How To Guides', 'Step-by-step instructional content'],
            ['Case Studies', 'Real-world examples and success stories'],
            ['Product Features', 'Detailed product functionality descriptions'],
            ['Industry Solutions', 'Sector-specific solutions and applications'],
            ['Research & Development', 'Scientific research and development content'],
            ['Technical Documentation', 'Technical specifications and documentation'],
            ['Educational Content', 'Learning and educational materials'],
            ['News & Updates', 'Latest news and company updates'],
            ['Testimonials', 'Customer testimonials and reviews']
        ];

        defaultCategories.forEach(([name, description]) => {
            insertCategory.run(name, description);
        });

        console.log('✅ Asset category master table created successfully');
        console.log(`✅ Inserted ${defaultCategories.length} default categories`);

    } catch (error) {
        console.error('❌ Error creating asset category master table:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the migration
if (require.main === module) {
    createAssetCategoryMasterTable();
}

module.exports = { createAssetCategoryMasterTable };