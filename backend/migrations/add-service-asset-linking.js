const Database = require('better-sqlite3');
const path = require('path');

async function addServiceAssetLinking() {
    try {
        console.log('🔄 Adding Service-Asset Linking tables and fields...');

        const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
        const db = new Database(dbPath);

        // Create service_asset_links table
        const createServiceAssetLinksTable = `
            CREATE TABLE IF NOT EXISTS service_asset_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                service_id INTEGER NOT NULL,
                sub_service_id INTEGER,
                is_static INTEGER DEFAULT 1,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(asset_id, service_id, sub_service_id),
                FOREIGN KEY (asset_id) REFERENCES assets(id),
                FOREIGN KEY (service_id) REFERENCES services(id),
                FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
            )
        `;

        // Create subservice_asset_links table
        const createSubServiceAssetLinksTable = `
            CREATE TABLE IF NOT EXISTS subservice_asset_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                sub_service_id INTEGER NOT NULL,
                is_static INTEGER DEFAULT 1,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(asset_id, sub_service_id),
                FOREIGN KEY (asset_id) REFERENCES assets(id),
                FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
            )
        `;

        // Add columns to assets table
        const alterAssetQueries = [
            `ALTER TABLE assets ADD COLUMN linked_service_ids TEXT`,
            `ALTER TABLE assets ADD COLUMN linked_sub_service_ids TEXT`,
            `ALTER TABLE assets ADD COLUMN linked_service_id INTEGER`,
            `ALTER TABLE assets ADD COLUMN linked_sub_service_id INTEGER`,
            `ALTER TABLE assets ADD COLUMN static_service_links TEXT`,
            `ALTER TABLE assets ADD COLUMN linking_active INTEGER DEFAULT 0`
        ];

        // Execute table creation
        try {
            db.exec(createServiceAssetLinksTable);
            console.log('✅ Created service_asset_links table');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  service_asset_links table already exists');
            } else {
                throw error;
            }
        }

        try {
            db.exec(createSubServiceAssetLinksTable);
            console.log('✅ Created subservice_asset_links table');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  subservice_asset_links table already exists');
            } else {
                throw error;
            }
        }

        // Execute column additions
        for (const query of alterAssetQueries) {
            try {
                db.exec(query);
                console.log(`✅ Executed: ${query.substring(0, 50)}...`);
            } catch (error) {
                if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
                    console.log(`⚠️  Column already exists: ${query.substring(0, 50)}...`);
                } else {
                    throw error;
                }
            }
        }

        // Create indexes for better query performance
        const indexQueries = [
            `CREATE INDEX IF NOT EXISTS idx_service_asset_links_asset_id ON service_asset_links(asset_id)`,
            `CREATE INDEX IF NOT EXISTS idx_service_asset_links_service_id ON service_asset_links(service_id)`,
            `CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_asset_id ON subservice_asset_links(asset_id)`,
            `CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_sub_service_id ON subservice_asset_links(sub_service_id)`,
            `CREATE INDEX IF NOT EXISTS idx_assets_linking_active ON assets(linking_active)`,
            `CREATE INDEX IF NOT EXISTS idx_assets_qc_status ON assets(qc_status)`
        ];

        for (const query of indexQueries) {
            try {
                db.exec(query);
                console.log(`✅ Created index: ${query.substring(0, 50)}...`);
            } catch (error) {
                console.log(`⚠️  Index creation skipped: ${query.substring(0, 50)}...`);
            }
        }

        console.log('✅ Service-Asset Linking migration completed successfully!');
        db.close();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
addServiceAssetLinking();
