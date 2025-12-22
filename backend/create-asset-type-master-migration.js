const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

function createAssetTypeMasterTable() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS asset_type_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                asset_type_name TEXT NOT NULL,
                word_count INTEGER NOT NULL DEFAULT 0,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(brand, asset_type_name)
            )
        `;

        db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Error creating asset_type_master table:', err);
                reject(err);
            } else {
                console.log('✅ Asset Type Master table created successfully');

                // Insert some sample data
                const sampleData = [
                    ['Pubrica', 'Research Article', 3000],
                    ['Pubrica', 'Blog Post', 800],
                    ['Pubrica', 'White Paper', 5000],
                    ['Stats Work', 'Data Analysis Report', 2500],
                    ['Stats Work', 'Statistical Summary', 1200],
                    ['Food Research Lab', 'Research Study', 4000],
                    ['Food Research Lab', 'Technical Report', 2000],
                    ['PhD Assistance', 'Dissertation Chapter', 8000],
                    ['PhD Assistance', 'Literature Review', 3500],
                    ['Tutors India', 'Educational Content', 1500],
                    ['Tutors India', 'Tutorial Guide', 2200]
                ];

                const insertSQL = `
                    INSERT OR IGNORE INTO asset_type_master (brand, asset_type_name, word_count)
                    VALUES (?, ?, ?)
                `;

                let completed = 0;
                sampleData.forEach(([brand, typeName, wordCount]) => {
                    db.run(insertSQL, [brand, typeName, wordCount], (err) => {
                        if (err) {
                            console.error('Error inserting sample data:', err);
                        }
                        completed++;
                        if (completed === sampleData.length) {
                            console.log('✅ Sample asset types inserted successfully');
                            db.close();
                            resolve();
                        }
                    });
                });
            }
        });
    });
}

// Run the migration
if (require.main === module) {
    createAssetTypeMasterTable()
        .then(() => {
            console.log('🎉 Asset Type Master migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { createAssetTypeMasterTable };