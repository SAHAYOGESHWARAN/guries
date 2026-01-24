const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

const migration = () => {
    const db = new Database(dbPath);

    try {
        console.log('Adding meta_keywords column to sub_services table...');

        // Check if column already exists
        const tableInfo = db.prepare("PRAGMA table_info(sub_services)").all();
        const hasMetaKeywords = tableInfo.some(col => col.name === 'meta_keywords');

        if (hasMetaKeywords) {
            console.log('✓ meta_keywords column already exists');
            return;
        }

        // Add the column
        db.prepare(`
            ALTER TABLE sub_services 
            ADD COLUMN meta_keywords TEXT DEFAULT '[]'
        `).run();

        console.log('✓ Successfully added meta_keywords column to sub_services table');

    } catch (error) {
        console.error('Error adding meta_keywords column:', error);
        throw error;
    } finally {
        db.close();
    }
};

migration();
