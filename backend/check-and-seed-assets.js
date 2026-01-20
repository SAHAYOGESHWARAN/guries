const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Checking Asset Library...');

try {
    // Check if assets table exists and has data
    const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    console.log(`Current assets in database: ${assetCount.count}`);

    if (assetCount.count === 0) {
        console.log('\nNo assets found. Creating sample assets...');

        // Create sample assets
        const sampleAssets = [
            {
                asset_name: 'Sample Image 1',
                asset_type: 'Image',
                asset_category: 'Marketing',
                asset_format: 'JPG',
                content_type: 'Visual',
                tags: 'Content Repository',
                status: 'Published',
                file_url: 'https://via.placeholder.com/800x600?text=Sample+Image+1',
                thumbnail_url: 'https://via.placeholder.com/200x150?text=Sample+Image+1',
                linked_service_ids: '[]',
                linked_sub_service_ids: '[]'
            },
            {
                asset_name: 'Sample Video 1',
                asset_type: 'Video',
                asset_category: 'Tutorial',
                asset_format: 'MP4',
                content_type: 'Video',
                tags: 'Content Repository',
                status: 'Published',
                file_url: 'https://via.placeholder.com/800x600?text=Sample+Video+1',
                thumbnail_url: 'https://via.placeholder.com/200x150?text=Sample+Video+1',
                linked_service_ids: '[]',
                linked_sub_service_ids: '[]'
            },
            {
                asset_name: 'Sample Document 1',
                asset_type: 'Document',
                asset_category: 'Guide',
                asset_format: 'PDF',
                content_type: 'Document',
                tags: 'Content Repository',
                status: 'Published',
                file_url: 'https://via.placeholder.com/800x600?text=Sample+Document+1',
                thumbnail_url: 'https://via.placeholder.com/200x150?text=Sample+Document+1',
                linked_service_ids: '[]',
                linked_sub_service_ids: '[]'
            },
            {
                asset_name: 'Sample Archive 1',
                asset_type: 'Archive',
                asset_category: 'Resources',
                asset_format: 'ZIP',
                content_type: 'Archive',
                tags: 'Content Repository',
                status: 'Published',
                file_url: 'https://via.placeholder.com/800x600?text=Sample+Archive+1',
                thumbnail_url: 'https://via.placeholder.com/200x150?text=Sample+Archive+1',
                linked_service_ids: '[]',
                linked_sub_service_ids: '[]'
            }
        ];

        const insertStmt = db.prepare(`
            INSERT INTO assets (
                asset_name, asset_type, asset_category, asset_format, content_type,
                tags, status, file_url, thumbnail_url, linked_service_ids, linked_sub_service_ids
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        sampleAssets.forEach(asset => {
            insertStmt.run(
                asset.asset_name,
                asset.asset_type,
                asset.asset_category,
                asset.asset_format,
                asset.content_type,
                asset.tags,
                asset.status,
                asset.file_url,
                asset.thumbnail_url,
                asset.linked_service_ids,
                asset.linked_sub_service_ids
            );
        });

        console.log(`✅ Created ${sampleAssets.length} sample assets`);
    } else {
        console.log('✅ Assets already exist in database');
    }

    // Verify the assets
    const assets = db.prepare('SELECT id, asset_name, asset_type, status FROM assets LIMIT 5').all();
    console.log('\nAssets in database:');
    assets.forEach(asset => {
        console.log(`  - ${asset.asset_name} (${asset.asset_type}) - ${asset.status}`);
    });

    db.close();
} catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
}
