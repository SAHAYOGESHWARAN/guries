const Database = require('better-sqlite3');
const path = require('path');

async function addAssetTypeLinking() {
    try {
        console.log('🔄 Adding Asset Type Linking to Asset Formats...');

        const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
        const db = new Database(dbPath);

        // Add asset_type_ids column to asset_format_master table (SQLite syntax)
        const alterQuery = `ALTER TABLE asset_format_master ADD COLUMN asset_type_ids TEXT`;

        try {
            db.exec(alterQuery);
            console.log('✅ Added asset_type_ids column to asset_format_master table');
        } catch (error) {
            if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
                console.log('⚠️  Column asset_type_ids already exists in asset_format_master table');
            } else {
                throw error;
            }
        }

        // Update existing asset formats with default asset type associations
        const updateQueries = [
            // Image formats - typically for visual content types
            `UPDATE asset_format_master 
             SET asset_type_ids = '["Research Paper", "Review Article", "Case Study", "Technical Report", "Analysis Report", "Data Summary", "Test Report", "Safety Analysis", "Quality Certificate", "Thesis Chapter", "Literature Review", "Research Proposal", "Study Material", "Tutorial Guide"]'
             WHERE format_type = 'image' AND (asset_type_ids IS NULL OR asset_type_ids = '')`,

            // Video formats - for multimedia content
            `UPDATE asset_format_master 
             SET asset_type_ids = '["Technical Report", "Analysis Report", "Statistical Guide", "Tutorial Guide", "Study Material", "Practice Questions"]'
             WHERE format_type = 'video' AND (asset_type_ids IS NULL OR asset_type_ids = '')`,

            // Document formats - for text-based content
            `UPDATE asset_format_master 
             SET asset_type_ids = '["Research Paper", "Review Article", "Case Study", "Technical Report", "Analysis Report", "Data Summary", "Statistical Guide", "Test Report", "Safety Analysis", "Quality Certificate", "Thesis Chapter", "Literature Review", "Research Proposal", "Study Material", "Practice Questions", "Tutorial Guide"]'
             WHERE format_type = 'document' AND (asset_type_ids IS NULL OR asset_type_ids = '')`,

            // Audio formats - for audio content
            `UPDATE asset_format_master 
             SET asset_type_ids = '["Tutorial Guide", "Study Material", "Statistical Guide"]'
             WHERE format_type = 'audio' AND (asset_type_ids IS NULL OR asset_type_ids = '')`,

            // If no asset_type_ids are set, default to empty array
            `UPDATE asset_format_master 
             SET asset_type_ids = '[]'
             WHERE asset_type_ids IS NULL OR asset_type_ids = ''`
        ];

        for (const query of updateQueries) {
            try {
                const result = db.exec(query);
                console.log(`✅ Updated asset formats: ${query.substring(0, 50)}...`);
            } catch (error) {
                console.error(`❌ Failed to execute: ${query.substring(0, 50)}...`, error);
            }
        }

        // Verify the changes
        const verifyQuery = `SELECT format_name, format_type, asset_type_ids FROM asset_format_master WHERE asset_type_ids IS NOT NULL`;
        const results = db.prepare(verifyQuery).all();

        console.log('📊 Verification - Asset formats with asset type linking:');
        results.forEach(row => {
            const assetTypes = JSON.parse(row.asset_type_ids || '[]');
            console.log(`  - ${row.format_name} (${row.format_type}): ${assetTypes.length} asset types`);
        });

        db.close();
        console.log('🎉 Asset Type Linking migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    addAssetTypeLinking()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addAssetTypeLinking };