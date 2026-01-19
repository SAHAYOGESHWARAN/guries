/**
 * Migration: Create Missing Master Tables
 * Purpose: Create asset_category_master and asset_type_master tables
 * Run: node backend/create-missing-master-tables-migration.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🔄 Starting migration: Create Missing Master Tables...\n');

try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create asset_category_master table
    console.log('📋 Creating asset_category_master table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_category_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand VARCHAR(255) NOT NULL,
            category_name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(brand, category_name)
        )
    `);
    console.log('✅ asset_category_master table created successfully\n');

    // Create asset_type_master table
    console.log('📋 Creating asset_type_master table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_type_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand VARCHAR(255) NOT NULL,
            asset_type VARCHAR(255) NOT NULL,
            dimension VARCHAR(100),
            file_formats VARCHAR(255),
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(brand, asset_type)
        )
    `);
    console.log('✅ asset_type_master table created successfully\n');

    // Insert default asset categories
    console.log('📝 Inserting default asset categories...');
    const defaultCategories = [
        { brand: 'Default', category_name: 'Blog', description: 'Blog-related assets' },
        { brand: 'Default', category_name: 'Social Media', description: 'Social media assets' },
        { brand: 'Default', category_name: 'SEO', description: 'SEO-related assets' },
        { brand: 'Default', category_name: 'Design', description: 'Design assets' },
        { brand: 'Default', category_name: 'Video', description: 'Video assets' },
        { brand: 'Default', category_name: 'Infographic', description: 'Infographic assets' },
        { brand: 'Default', category_name: 'PDF', description: 'PDF documents' },
        { brand: 'Default', category_name: 'Whitepaper', description: 'Whitepaper documents' },
    ];

    const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO asset_category_master (brand, category_name, description)
        VALUES (?, ?, ?)
    `);

    defaultCategories.forEach(cat => {
        insertCategory.run(cat.brand, cat.category_name, cat.description);
    });
    console.log(`✅ Inserted ${defaultCategories.length} default asset categories\n`);

    // Insert default asset types
    console.log('📝 Inserting default asset types...');
    const defaultTypes = [
        { brand: 'Default', asset_type: 'Blog Banner', dimension: '1200x600', file_formats: 'jpg,png,webp', description: 'Blog post banner image' },
        { brand: 'Default', asset_type: 'Infographic', dimension: '1200x1500', file_formats: 'jpg,png,webp', description: 'Infographic image' },
        { brand: 'Default', asset_type: 'Social Post', dimension: '1080x1080', file_formats: 'jpg,png,webp', description: 'Social media post image' },
        { brand: 'Default', asset_type: 'Reel / Video', dimension: '1080x1920', file_formats: 'mp4,webm', description: 'Video reel or short video' },
        { brand: 'Default', asset_type: 'Thumbnail', dimension: '1280x720', file_formats: 'jpg,png,webp', description: 'Video thumbnail' },
        { brand: 'Default', asset_type: 'Diagram', dimension: '1200x800', file_formats: 'jpg,png,webp,svg', description: 'Diagram or flowchart' },
        { brand: 'Default', asset_type: 'Web Graphic', dimension: 'Variable', file_formats: 'jpg,png,webp,svg', description: 'Web graphic or icon' },
        { brand: 'Default', asset_type: 'PDF', dimension: 'N/A', file_formats: 'pdf', description: 'PDF document' },
    ];

    const insertType = db.prepare(`
        INSERT OR IGNORE INTO asset_type_master (brand, asset_type, dimension, file_formats, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    defaultTypes.forEach(type => {
        insertType.run(type.brand, type.asset_type, type.dimension, type.file_formats, type.description);
    });
    console.log(`✅ Inserted ${defaultTypes.length} default asset types\n`);

    console.log('✨ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - asset_category_master table created');
    console.log('   - asset_type_master table created');
    console.log(`   - ${defaultCategories.length} default categories inserted`);
    console.log(`   - ${defaultTypes.length} default asset types inserted`);

    db.close();
    process.exit(0);

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    db.close();
    process.exit(1);
}
