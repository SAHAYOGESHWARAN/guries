const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
});

const addColumnsIfNotExists = async () => {
    const columnsToAdd = [
        // Core Navigation
        { name: 'sub_service_code', type: 'VARCHAR(100)' },
        { name: 'menu_heading', type: 'VARCHAR(255)' },
        { name: 'short_tagline', type: 'TEXT' },
        { name: 'language', type: 'VARCHAR(10) DEFAULT \'en\'' },
        { name: 'industry_ids', type: 'TEXT' },
        { name: 'country_ids', type: 'TEXT' },
        { name: 'status', type: 'VARCHAR(50) DEFAULT \'Draft\'' },

        // Strategic Content
        { name: 'content_type', type: 'VARCHAR(100)' },
        { name: 'buyer_journey_stage', type: 'VARCHAR(100)' },
        { name: 'primary_cta_label', type: 'VARCHAR(255)' },
        { name: 'primary_cta_url', type: 'VARCHAR(1000)' },

        // Content Block
        { name: 'h2_list', type: 'TEXT' },
        { name: 'h3_list', type: 'TEXT' },
        { name: 'h4_list', type: 'TEXT' },
        { name: 'h5_list', type: 'TEXT' },
        { name: 'body_content', type: 'TEXT' },
        { name: 'word_count', type: 'INTEGER DEFAULT 0' },
        { name: 'reading_time_minutes', type: 'INTEGER DEFAULT 0' },

        // SEO
        { name: 'focus_keywords', type: 'TEXT' },
        { name: 'secondary_keywords', type: 'TEXT' },
        { name: 'seo_score', type: 'DECIMAL(5,2) DEFAULT 0' },
        { name: 'ranking_summary', type: 'TEXT' },

        // SMM - Additional fields
        { name: 'og_image_url', type: 'VARCHAR(1000)' },
        { name: 'og_type', type: 'VARCHAR(50) DEFAULT \'website\'' },
        { name: 'twitter_image_url', type: 'VARCHAR(1000)' },
        { name: 'linkedin_image_url', type: 'VARCHAR(1000)' },
        { name: 'facebook_image_url', type: 'VARCHAR(1000)' },
        { name: 'instagram_image_url', type: 'VARCHAR(1000)' },

        // Technical
        { name: 'robots_custom', type: 'TEXT' },
        { name: 'redirect_from_urls', type: 'TEXT' },
        { name: 'hreflang_group_id', type: 'INTEGER' },
        { name: 'core_web_vitals_status', type: 'VARCHAR(50)' },
        { name: 'tech_seo_status', type: 'VARCHAR(50)' },
        { name: 'faq_section_enabled', type: 'BOOLEAN DEFAULT 0' },
        { name: 'faq_content', type: 'TEXT' },

        // Navigation
        { name: 'include_in_xml_sitemap', type: 'BOOLEAN DEFAULT 1' },
        { name: 'sitemap_priority', type: 'DECIMAL(3,1) DEFAULT 0.8' },
        { name: 'sitemap_changefreq', type: 'VARCHAR(50) DEFAULT \'monthly\'' },

        // Linking
        { name: 'linked_insights_ids', type: 'TEXT' },
        { name: 'linked_assets_ids', type: 'TEXT' },
        { name: 'assets_linked', type: 'INTEGER DEFAULT 0' },

        // Governance
        { name: 'brand_id', type: 'INTEGER DEFAULT 0' },
        { name: 'content_owner_id', type: 'INTEGER DEFAULT 0' },
        { name: 'created_by', type: 'INTEGER' },
        { name: 'updated_by', type: 'INTEGER' },
        { name: 'version_number', type: 'INTEGER DEFAULT 1' },
        { name: 'change_log_link', type: 'VARCHAR(1000)' },
        { name: 'working_on_by', type: 'VARCHAR(255)' }
    ];

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Get existing columns
            db.all("PRAGMA table_info(sub_services)", (err, columns) => {
                if (err) {
                    reject(err);
                    return;
                }

                const existingColumnNames = columns.map(col => col.name);
                const columnsToAddFiltered = columnsToAdd.filter(col => !existingColumnNames.includes(col.name));

                if (columnsToAddFiltered.length === 0) {
                    console.log('All columns already exist in sub_services table');
                    resolve();
                    return;
                }

                console.log(`Adding ${columnsToAddFiltered.length} columns to sub_services table...`);

                let completed = 0;
                columnsToAddFiltered.forEach(col => {
                    const sql = `ALTER TABLE sub_services ADD COLUMN ${col.name} ${col.type}`;
                    db.run(sql, (err) => {
                        if (err) {
                            console.error(`Error adding column ${col.name}:`, err);
                        } else {
                            console.log(`✓ Added column: ${col.name}`);
                        }
                        completed++;
                        if (completed === columnsToAddFiltered.length) {
                            resolve();
                        }
                    });
                });
            });
        });
    });
};

addColumnsIfNotExists()
    .then(() => {
        console.log('Migration completed successfully');
        db.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration failed:', err);
        db.close();
        process.exit(1);
    });
