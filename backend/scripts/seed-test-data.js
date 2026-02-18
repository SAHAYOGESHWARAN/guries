const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

console.log('🌱 Seeding test data...');

try {
  // Create tables if they don't exist
  console.log('Creating assets table...');
  db.prepare(`
    CREATE TABLE IF NOT EXISTS assets (
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      submitted_at TIMESTAMP,
      qc_score INTEGER,
      qc_remarks TEXT,
      qc_reviewer_id INTEGER,
      qc_reviewed_at TIMESTAMP,
      qc_checklist_completion INTEGER,
      linking_active INTEGER DEFAULT 0,
      workflow_log TEXT,
      rework_count INTEGER DEFAULT 0,
      application_type TEXT,
      linked_service_id INTEGER,
      linked_service_ids TEXT,
      linked_task_id INTEGER,
      linked_task TEXT,
      repository TEXT,
      web_description TEXT,
      seo_content_description TEXT,
      smm_description TEXT,
      web_url TEXT,
      seo_target_url TEXT,
      keywords TEXT,
      web_body_content TEXT,
      web_h1 TEXT,
      web_h2_1 TEXT,
      web_h2_2 TEXT,
      web_h3_tags TEXT,
      web_meta_description TEXT,
      seo_score INTEGER,
      grammar_score INTEGER
    )
  `).run();

  console.log('Table created. Testing simple insert...');

  // Test simple insert first
  const testRes = db.prepare(`
    INSERT INTO assets (asset_name, asset_type, status)
    VALUES (?, ?, ?)
  `).run('Test Asset', 'Article', 'draft');
  console.log('Test insert result:', testRes);

  // Now insert full assets
  const assetStmt = db.prepare(`
    INSERT INTO assets (
      asset_name, asset_type, asset_category, asset_format, status, qc_status,
      application_type, linked_service_id, created_by, submitted_by, designed_by,
      repository, web_description, web_url, keywords, seo_score, grammar_score,
      thumbnail_url, file_url, workflow_log, rework_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const testAssets = [
    ['Product Overview', 'Article', 'Treatment', 'HTML', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Comprehensive product overview for oncology services', '/oncology/product-overview', 'oncology,treatment,cancer', 85, 90, 'https://via.placeholder.com/300x300?text=Product', 'https://via.placeholder.com/300x300?text=Product', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Homepage Banner', 'Image', 'Banner', 'PNG', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Homepage banner for oncology section', '/oncology/banner', 'banner,homepage,oncology', 75, 100, 'https://via.placeholder.com/300x200?text=Homepage+Banner', 'https://via.placeholder.com/300x200?text=Homepage+Banner', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['LinkedIn Post', 'Social Media', 'Post', 'Text', 'Pending QC Review', null, 'smm', 1, 1, 1, 1, 'Social', 'LinkedIn post about oncology research', '/social/linkedin-post', 'linkedin,social,oncology', 70, 95, 'https://via.placeholder.com/300x200?text=LinkedIn', 'https://via.placeholder.com/300x200?text=LinkedIn', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Service Graphic', 'Graphic', 'Infographic', 'SVG', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Service infographic for oncology', '/oncology/service-graphic', 'graphic,infographic,service', 80, 100, 'https://via.placeholder.com/300x200?text=Service+Graphic', 'https://via.placeholder.com/300x200?text=Service+Graphic', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Blog Post', 'Article', 'Blog', 'HTML', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Blog post about cancer research findings', '/blog/cancer-research-2024', 'blog,cancer,research', 88, 92, 'https://via.placeholder.com/300x200?text=Blog+Post', 'https://via.placeholder.com/300x200?text=Blog+Post', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Twitter Post', 'Social Media', 'Post', 'Text', 'Pending QC Review', null, 'smm', 1, 1, 1, 1, 'Social', 'Twitter post about oncology updates', '/social/twitter-post', 'twitter,social,oncology', 65, 88, 'https://via.placeholder.com/300x200?text=Twitter', 'https://via.placeholder.com/300x200?text=Twitter', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Case Study', 'Article', 'Case Study', 'PDF', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Case study on successful oncology treatment', '/case-studies/oncology-success', 'case study,oncology,success', 82, 94, 'https://via.placeholder.com/300x200?text=Case+Study', 'https://via.placeholder.com/300x200?text=Case+Study', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Instagram Post', 'Social Media', 'Post', 'Image', 'Pending QC Review', null, 'smm', 1, 1, 1, 1, 'Social', 'Instagram post for oncology awareness', '/social/instagram-post', 'instagram,social,awareness', 72, 90, 'https://via.placeholder.com/300x300?text=Instagram', 'https://via.placeholder.com/300x300?text=Instagram', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Infographic', 'Graphic', 'Infographic', 'PNG', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Infographic about cancer statistics', '/infographics/cancer-stats', 'infographic,statistics,cancer', 79, 100, 'https://via.placeholder.com/300x200?text=Infographic', 'https://via.placeholder.com/300x200?text=Infographic', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0],
    ['Video Thumbnail', 'Video', 'Thumbnail', 'PNG', 'Pending QC Review', null, 'web', 1, 1, 1, 1, 'Web', 'Video thumbnail for oncology educational content', '/videos/oncology-education', 'video,education,oncology', 76, 100, 'https://via.placeholder.com/300x200?text=Video', 'https://via.placeholder.com/300x200?text=Video', JSON.stringify([{ action: 'created', timestamp: new Date().toISOString() }]), 0]
  ];

  let inserted = 0;
  testAssets.forEach((asset, idx) => {
    try {
      const res = assetStmt.run(...asset);
      if (res.changes > 0) {
        inserted++;
        console.log(`✓ Inserted asset ${idx + 1}`);
      } else {
        console.log(`✗ Asset ${idx + 1} returned 0 changes`);
      }
    } catch (e) {
      console.error(`✗ Error inserting asset ${idx + 1}:`, e.message);
    }
  });

  console.log(`\n✓ Inserted ${inserted} assets`);

  // Verify data
  const count = db.prepare('SELECT COUNT(*) as count FROM assets').get();
  console.log('✓ Total assets in database:', count.count);

  db.close();

  if (count.count > 0) {
    console.log('\n✅ Test data seeded successfully!');
    console.log('📊 Created', count.count, 'test assets ready for QC review');
  } else {
    console.error('\n❌ Data was not inserted');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
