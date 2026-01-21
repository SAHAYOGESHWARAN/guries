const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

const addColumnsIfNotExists = async () => {
    const columnsToAdd = [
        { name: 'show_in_main_menu', type: 'BOOLEAN DEFAULT false' },
        { name: 'show_in_footer_menu', type: 'BOOLEAN DEFAULT false' },
        { name: 'menu_group', type: 'VARCHAR(255)' },
        { name: 'parent_menu_section', type: 'VARCHAR(255)' },
        { name: 'include_in_xml_sitemap', type: 'BOOLEAN DEFAULT true' },
        { name: 'sitemap_priority', type: 'REAL DEFAULT 0.8' },
        { name: 'sitemap_changefreq', type: 'VARCHAR(50) DEFAULT "monthly"' },
        { name: 'internal_links', type: 'TEXT' },
        { name: 'external_links', type: 'TEXT' },
        { name: 'image_alt_texts', type: 'TEXT' },
        { name: 'primary_persona_id', type: 'INTEGER' },
        { name: 'secondary_persona_ids', type: 'TEXT' },
        { name: 'target_segment_notes', type: 'TEXT' },
        { name: 'form_id', type: 'INTEGER' },
        { name: 'linked_campaign_ids', type: 'TEXT' },
        { name: 'featured_asset_id', type: 'INTEGER' },
        { name: 'asset_count', type: 'INTEGER DEFAULT 0' },
        { name: 'knowledge_topic_id', type: 'INTEGER' },
        { name: 'business_unit', type: 'VARCHAR(255)' },
        { name: 'sub_service_code', type: 'VARCHAR(100)' }
    ];

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Get existing columns
            db.all("PRAGMA table_info(sub_services)", (err, columns) => {
                if (err) {
                    console.error('Error getting table info:', err);
                    reject(err);
                    return;
                }

                const existingColumnNames = columns.map(col => col.name);
                const columnsToAddFiltered = columnsToAdd.filter(col => !existingColumnNames.includes(col.name));

                if (columnsToAddFiltered.length === 0) {
                    console.log('✅ All columns already exist in sub_services table');
                    resolve();
                    return;
                }

                console.log(`Adding ${columnsToAddFiltered.length} missing columns...`);

                let completed = 0;
                columnsToAddFiltered.forEach(col => {
                    const sql = `ALTER TABLE sub_services ADD COLUMN ${col.name} ${col.type}`;
                    db.run(sql, (err) => {
                        if (err) {
                            console.error(`Error adding column ${col.name}:`, err);
                            reject(err);
                        } else {
                            completed++;
                            console.log(`✅ Added column: ${col.name}`);
                            if (completed === columnsToAddFiltered.length) {
                                console.log('✅ All columns added successfully');
                                resolve();
                            }
                        }
                    });
                });
            });
        });
    });
};

addColumnsIfNotExists()
    .then(() => {
        console.log('✅ Migration completed successfully');
        db.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Migration failed:', err);
        db.close();
        process.exit(1);
    });
