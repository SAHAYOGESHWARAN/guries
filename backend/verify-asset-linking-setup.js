const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('=== ASSET LINKING SETUP VERIFICATION ===\n');

try {
    // Check services
    const services = db.prepare('SELECT COUNT(*) as count FROM services').get();
    console.log(`✅ Services: ${services.count}`);

    // Check assets
    const assets = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    console.log(`✅ Assets: ${assets.count}`);

    // Check sub-services
    const subServices = db.prepare('SELECT COUNT(*) as count FROM sub_services').get();
    console.log(`✅ Sub-Services: ${subServices.count}`);

    // Check personas
    const personas = db.prepare('SELECT COUNT(*) as count FROM personas').get();
    console.log(`✅ Personas: ${personas.count}`);

    // Check forms
    const forms = db.prepare('SELECT COUNT(*) as count FROM forms').get();
    console.log(`✅ Forms: ${forms.count}`);

    console.log('\n=== ASSET DETAILS ===\n');
    const assetDetails = db.prepare(`
        SELECT id, asset_name as name, asset_type as type, tags as repository, status, 
               linked_service_ids, thumbnail_url
        FROM assets
    `).all();

    assetDetails.forEach(asset => {
        console.log(`Asset #${asset.id}: ${asset.name}`);
        console.log(`  Type: ${asset.type}`);
        console.log(`  Repository: ${asset.repository}`);
        console.log(`  Status: ${asset.status}`);
        console.log(`  Linked Services: ${asset.linked_service_ids}`);
        console.log(`  Thumbnail: ${asset.thumbnail_url ? 'Yes' : 'No'}`);
        console.log('');
    });

    console.log('=== SERVICE DETAILS ===\n');
    const serviceDetails = db.prepare(`
        SELECT id, service_name, service_code, status
        FROM services
    `).all();

    serviceDetails.forEach(service => {
        console.log(`Service #${service.id}: ${service.service_name}`);
        console.log(`  Code: ${service.service_code}`);
        console.log(`  Status: ${service.status}`);
        console.log('');
    });

    console.log('=== SETUP COMPLETE ===');
    console.log('\nYou can now:');
    console.log('1. Go to Service Master page');
    console.log('2. Click "Edit" on "Test Service"');
    console.log('3. Scroll to "Asset Library Management" section');
    console.log('4. You should see 4 available assets to link');
    console.log('5. Click "+ Link" to link assets to the service');

    db.close();
} catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
}
