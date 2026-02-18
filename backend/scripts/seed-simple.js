const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
console.log('Database path:', dbPath);

// Remove old db
try {
    fs.unlinkSync(dbPath);
    console.log('Removed old database');
} catch (e) { }

const db = new Database(dbPath);

console.log('🌱 Seeding test data...');

try {
    // Create assets table
    db.prepare(`
    CREATE TABLE assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_name TEXT NOT NULL,
      asset_type TEXT,
      asset_category TEXT,
      asset_format TEXT,
      status TEXT DEFAULT 'draft',
      qc_status TEXT,
      file_url TEXT,
      thumbnail_url TEXT,
      created_by INTEGER,
      submitted_by INTEGER,
      designed_by INTEGER,
      application_type TEXT,
      linked_service_id INTEGER,
      repository TEXT,
      web_description TEXT,
      web_url TEXT,
      keywords TEXT,
      seo_score INTEGER,
      grammar_score INTEGER,
      workflow_log TEXT,
      rework_count INTEGER DEFAULT 0
    )
  `).run();

    console.log('✓ Table created');

    // Insert test assets
    const insert = db.prepare(`
    INSERT INTO assets (
      asset_name, asset_type, asset_category, asset_format, status,
      application_type, linked_service_id, created_by, submitted_by, designed_by,
      repository, web_description, web_url, keywords, seo_score, grammar_score,
      thumbnail_url, file_url, workflow_log, rework_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const assets = [
        ['Product Overview', 'Article', 'Treatment', 'HTML', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Comprehensive product overview', '/oncology/product-overview', 'oncology,treatment,cancer', 85, 90, 'https://via.placeholder.com/300x300?text=Product', 'https://via.placeholder.com/300x300?text=Product', JSON.stringify([{ action: 'created' }]), 0],
        ['Homepage Banner', 'Image', 'Banner', 'PNG', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Homepage banner', '/oncology/banner', 'banner,homepage', 75, 100, 'https://via.placeholder.com/300x200?text=Banner', 'https://via.placeholder.com/300x200?text=Banner', JSON.stringify([{ action: 'created' }]), 0],
        ['LinkedIn Post', 'Social Media', 'Post', 'Text', 'Pending QC Review', 'smm', 1, 1, 1, 1, 'Social', 'LinkedIn post', '/social/linkedin', 'linkedin,social', 70, 95, 'https://via.placeholder.com/300x200?text=LinkedIn', 'https://via.placeholder.com/300x200?text=LinkedIn', JSON.stringify([{ action: 'created' }]), 0],
        ['Service Graphic', 'Graphic', 'Infographic', 'SVG', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Service infographic', '/oncology/graphic', 'graphic,infographic', 80, 100, 'https://via.placeholder.com/300x200?text=Graphic', 'https://via.placeholder.com/300x200?text=Graphic', JSON.stringify([{ action: 'created' }]), 0],
        ['Blog Post', 'Article', 'Blog', 'HTML', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Blog post', '/blog/cancer-research', 'blog,cancer,research', 88, 92, 'https://via.placeholder.com/300x200?text=Blog', 'https://via.placeholder.com/300x200?text=Blog', JSON.stringify([{ action: 'created' }]), 0],
        ['Twitter Post', 'Social Media', 'Post', 'Text', 'Pending QC Review', 'smm', 1, 1, 1, 1, 'Social', 'Twitter post', '/social/twitter', 'twitter,social', 65, 88, 'https://via.placeholder.com/300x200?text=Twitter', 'https://via.placeholder.com/300x200?text=Twitter', JSON.stringify([{ action: 'created' }]), 0],
        ['Case Study', 'Article', 'Case Study', 'PDF', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Case study', '/case-studies/success', 'case study,oncology', 82, 94, 'https://via.placeholder.com/300x200?text=Case', 'https://via.placeholder.com/300x200?text=Case', JSON.stringify([{ action: 'created' }]), 0],
        ['Instagram Post', 'Social Media', 'Post', 'Image', 'Pending QC Review', 'smm', 1, 1, 1, 1, 'Social', 'Instagram post', '/social/instagram', 'instagram,social', 72, 90, 'https://via.placeholder.com/300x300?text=Instagram', 'https://via.placeholder.com/300x300?text=Instagram', JSON.stringify([{ action: 'created' }]), 0],
        ['Infographic', 'Graphic', 'Infographic', 'PNG', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Infographic', '/infographics/stats', 'infographic,statistics', 79, 100, 'https://via.placeholder.com/300x200?text=Info', 'https://via.placeholder.com/300x200?text=Info', JSON.stringify([{ action: 'created' }]), 0],
        ['Video Thumbnail', 'Video', 'Thumbnail', 'PNG', 'Pending QC Review', 'web', 1, 1, 1, 1, 'Web', 'Video thumbnail', '/videos/education', 'video,education', 76, 100, 'https://via.placeholder.com/300x200?text=Video', 'https://via.placeholder.com/300x200?text=Video', JSON.stringify([{ action: 'created' }]), 0]
    ];

    // Use a transaction
    const insertMany = db.transaction((assets) => {
        for (const asset of assets) {
            insert.run(...asset);
        }
    });

    insertMany(assets);
    console.log(`✓ Inserted ${assets.length} assets`);

    // Verify
    const result = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    console.log(`✓ Verified: ${result.count} assets in database`);

    if (result.count > 0) {
        console.log('✅ Test data seeded successfully!');
        console.log(`📊 Created ${result.count} test assets ready for QC review`);
    } else {
        console.error('❌ Data was not inserted');
        process.exit(1);
    }

    db.close();
} catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}
