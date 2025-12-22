const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('mcc_db.sqlite');

const testAsset = {
    asset_name: 'Instagram Marketing Post',
    asset_type: 'social_media',
    status: 'Draft',
    application_type: 'smm',
    smm_platform: 'instagram',
    smm_description: 'Engaging Instagram post about our latest product launch with stunning visuals and compelling copy.',
    smm_hashtags: '#marketing #product #launch #instagram #socialmedia',
    smm_media_url: 'https://via.placeholder.com/1080x1080/6366f1/ffffff?text=Instagram+Post',
    smm_media_type: 'image',
    asset_category: 'Social Media Content',
    asset_format: 'Image'
};

const stmt = db.prepare(`
    INSERT INTO assets (
        asset_name, asset_type, status, application_type, 
        smm_platform, smm_description, smm_hashtags, smm_media_url, smm_media_type,
        asset_category, asset_format
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

stmt.run(
    testAsset.asset_name,
    testAsset.asset_type,
    testAsset.status,
    testAsset.application_type,
    testAsset.smm_platform,
    testAsset.smm_description,
    testAsset.smm_hashtags,
    testAsset.smm_media_url,
    testAsset.smm_media_type,
    testAsset.asset_category,
    testAsset.asset_format,
    function (err) {
        if (err) {
            console.error('Error creating test SMM asset:', err);
        } else {
            console.log('✅ Test SMM asset created successfully! ID:', this.lastID);
        }
        stmt.finalize();
        db.close();
    }
);