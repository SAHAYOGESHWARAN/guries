/**
 * Complete Database Initialization Script
 * Creates all tables and populates with sample data
 * Usage: node init-complete-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

// Backup existing database if it exists
if (fs.existsSync(dbPath)) {
    const backupPath = path.join(__dirname, `mcc_db.sqlite.backup.${Date.now()}`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`📦 Backed up existing database to ${backupPath}`);
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('🚀 Starting complete database initialization...\n');

try {
    // ==================== CORE TABLES ====================
    console.log('📋 Creating core tables...');

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Brands table
    db.exec(`
        CREATE TABLE IF NOT EXISTS brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) UNIQUE NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            description TEXT,
            logo_url VARCHAR(500),
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Services table
    db.exec(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_id INTEGER,
            service_name VARCHAR(255) NOT NULL,
            service_code VARCHAR(100),
            slug VARCHAR(255),
            description TEXT,
            meta_title VARCHAR(255),
            meta_description VARCHAR(500),
            meta_keywords VARCHAR(500),
            status VARCHAR(50) DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brand_id) REFERENCES brands(id)
        )
    `);

    // Sub-services table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sub_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL,
            sub_service_name VARCHAR(255) NOT NULL,
            sub_service_code VARCHAR(100),
            slug VARCHAR(255),
            description TEXT,
            content_type VARCHAR(100),
            meta_title VARCHAR(255),
            meta_description VARCHAR(500),
            meta_keywords VARCHAR(500),
            status VARCHAR(50) DEFAULT 'draft',
            has_subservices BOOLEAN DEFAULT 0,
            featured_asset_id INTEGER,
            knowledge_topic_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id)
        )
    `);

    // ==================== ASSET TABLES ====================
    console.log('📦 Creating asset tables...');

    // Asset category master
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_category_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name VARCHAR(255) NOT NULL UNIQUE,
            word_count INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Asset type master
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_type_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_type_name VARCHAR(255) NOT NULL UNIQUE,
            word_count INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Asset format master
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_format_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            format_name VARCHAR(255) NOT NULL UNIQUE,
            file_extension VARCHAR(50),
            mime_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Assets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name VARCHAR(255) NOT NULL,
            asset_code VARCHAR(100),
            category_id INTEGER,
            type_id INTEGER,
            format_id INTEGER,
            file_path VARCHAR(500),
            thumbnail_url VARCHAR(500),
            file_size INTEGER,
            duration INTEGER,
            description TEXT,
            tags VARCHAR(500),
            application_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'draft',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES asset_category_master(id),
            FOREIGN KEY (type_id) REFERENCES asset_type_master(id),
            FOREIGN KEY (format_id) REFERENCES asset_format_master(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Asset linking table
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_linking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            service_id INTEGER,
            sub_service_id INTEGER,
            link_type VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id),
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
        )
    `);

    // ==================== KEYWORD TABLES ====================
    console.log('🔑 Creating keyword tables...');

    // Keywords table
    db.exec(`
        CREATE TABLE IF NOT EXISTS keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword VARCHAR(255) NOT NULL UNIQUE,
            search_volume INTEGER,
            difficulty INTEGER,
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Keyword linking table
    db.exec(`
        CREATE TABLE IF NOT EXISTS keyword_linking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword_id INTEGER NOT NULL,
            service_id INTEGER,
            sub_service_id INTEGER,
            link_type VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (keyword_id) REFERENCES keywords(id),
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
        )
    `);

    // ==================== BACKLINK TABLES ====================
    console.log('🔗 Creating backlink tables...');

    // Backlink sources
    db.exec(`
        CREATE TABLE IF NOT EXISTS backlink_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_name VARCHAR(255) NOT NULL UNIQUE,
            domain VARCHAR(255),
            authority_score INTEGER,
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Backlinks
    db.exec(`
        CREATE TABLE IF NOT EXISTS backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER NOT NULL,
            target_url VARCHAR(500),
            anchor_text VARCHAR(255),
            link_type VARCHAR(50),
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_id) REFERENCES backlink_sources(id)
        )
    `);

    // ==================== CONTENT TABLES ====================
    console.log('📝 Creating content tables...');

    // Content types
    db.exec(`
        CREATE TABLE IF NOT EXISTS content_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Content
    db.exec(`
        CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255),
            content_type_id INTEGER,
            body TEXT,
            meta_title VARCHAR(255),
            meta_description VARCHAR(500),
            meta_keywords VARCHAR(500),
            status VARCHAR(50) DEFAULT 'draft',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (content_type_id) REFERENCES content_types(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // ==================== PROJECT & TASK TABLES ====================
    console.log('📊 Creating project and task tables...');

    // Projects
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            start_date DATE,
            end_date DATE,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Tasks
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            task_name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'todo',
            priority VARCHAR(50) DEFAULT 'medium',
            assigned_to INTEGER,
            due_date DATE,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (assigned_to) REFERENCES users(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // ==================== CAMPAIGN TABLES ====================
    console.log('📢 Creating campaign tables...');

    // Campaigns
    db.exec(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_name VARCHAR(255) NOT NULL,
            description TEXT,
            campaign_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'draft',
            start_date DATE,
            end_date DATE,
            budget DECIMAL(10, 2),
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // ==================== PLATFORM TABLES ====================
    console.log('🌐 Creating platform tables...');

    // Platforms
    db.exec(`
        CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform_name VARCHAR(255) NOT NULL UNIQUE,
            platform_type VARCHAR(100),
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ==================== QUALITY CONTROL TABLES ====================
    console.log('✅ Creating QC tables...');

    // QC audit log
    db.exec(`
        CREATE TABLE IF NOT EXISTS qc_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            content_id INTEGER,
            qc_status VARCHAR(50),
            reviewer_id INTEGER,
            comments TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id),
            FOREIGN KEY (content_id) REFERENCES content(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id)
        )
    `);

    console.log('✅ All tables created successfully!\n');

    // ==================== SAMPLE DATA ====================
    console.log('🌱 Inserting sample data...\n');

    // Insert sample users
    console.log('👥 Adding sample users...');
    db.prepare(`
        INSERT INTO users (username, email, password, first_name, last_name, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('admin', 'admin@example.com', 'hashed_password_123', 'Admin', 'User', 'admin', 'active');

    db.prepare(`
        INSERT INTO users (username, email, password, first_name, last_name, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('editor', 'editor@example.com', 'hashed_password_456', 'Editor', 'User', 'editor', 'active');

    // Insert sample brands
    console.log('🏢 Adding sample brands...');
    const brands = [
        { name: 'Pubrica', slug: 'pubrica', description: 'Academic Publishing Services' },
        { name: 'Stats Work', slug: 'stats-work', description: 'Statistical Analysis Services' },
        { name: 'Food Research Lab', slug: 'food-research-lab', description: 'Food Science Research' },
        { name: 'PhD Assistance', slug: 'phd-assistance', description: 'PhD Support Services' },
        { name: 'Tutors India', slug: 'tutors-india', description: 'Online Tutoring Platform' }
    ];

    brands.forEach(brand => {
        db.prepare(`
            INSERT INTO brands (name, slug, description, status)
            VALUES (?, ?, ?, ?)
        `).run(brand.name, brand.slug, brand.description, 'active');
    });

    // Insert sample services
    console.log('🛠️ Adding sample services...');
    const services = [
        { brand_id: 1, service_name: 'Research Paper Writing', service_code: 'RPW001', slug: 'research-paper-writing' },
        { brand_id: 1, service_name: 'Academic Editing', service_code: 'AED001', slug: 'academic-editing' },
        { brand_id: 2, service_name: 'Statistical Analysis', service_code: 'STA001', slug: 'statistical-analysis' },
        { brand_id: 3, service_name: 'Food Safety Testing', service_code: 'FST001', slug: 'food-safety-testing' },
        { brand_id: 4, service_name: 'Dissertation Help', service_code: 'DIS001', slug: 'dissertation-help' }
    ];

    services.forEach(service => {
        db.prepare(`
            INSERT INTO services (brand_id, service_name, service_code, slug, status)
            VALUES (?, ?, ?, ?, ?)
        `).run(service.brand_id, service.service_name, service.service_code, service.slug, 'published');
    });

    // Insert sample sub-services
    console.log('📑 Adding sample sub-services...');
    const subServices = [
        { service_id: 1, sub_service_name: 'Thesis Writing', sub_service_code: 'THW001', slug: 'thesis-writing', content_type: 'Pillar' },
        { service_id: 1, sub_service_name: 'Journal Article Writing', sub_service_code: 'JAW001', slug: 'journal-article-writing', content_type: 'Blog' },
        { service_id: 2, sub_service_name: 'Manuscript Editing', sub_service_code: 'MED001', slug: 'manuscript-editing', content_type: 'Landing' },
        { service_id: 3, sub_service_name: 'Regression Analysis', sub_service_code: 'REG001', slug: 'regression-analysis', content_type: 'Case Study' },
        { service_id: 4, sub_service_name: 'Microbiological Testing', sub_service_code: 'MIC001', slug: 'microbiological-testing', content_type: 'Sales Page' }
    ];

    subServices.forEach(subService => {
        db.prepare(`
            INSERT INTO sub_services (service_id, sub_service_name, sub_service_code, slug, content_type, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(subService.service_id, subService.sub_service_name, subService.sub_service_code, subService.slug, subService.content_type, 'published');
    });

    // Insert sample asset categories
    console.log('📂 Adding sample asset categories...');
    const categories = [
        'Research Articles',
        'Academic Writing',
        'Publication Support',
        'Statistical Analysis',
        'Data Visualization',
        'Food Safety',
        'Nutritional Analysis',
        'Dissertation Help',
        'Learning Resources'
    ];

    categories.forEach(category => {
        db.prepare(`
            INSERT INTO asset_category_master (category_name, word_count, status)
            VALUES (?, ?, ?)
        `).run(category, 500, 'active');
    });

    // Insert sample asset types
    console.log('📋 Adding sample asset types...');
    const types = [
        'Research Paper',
        'Review Article',
        'Case Study',
        'Technical Report',
        'Analysis Report',
        'Data Summary',
        'Test Report',
        'Thesis Chapter',
        'Study Material'
    ];

    types.forEach(type => {
        db.prepare(`
            INSERT INTO asset_type_master (asset_type_name, word_count, status)
            VALUES (?, ?, ?)
        `).run(type, 800, 'active');
    });

    // Insert sample asset formats
    console.log('📄 Adding sample asset formats...');
    const formats = [
        { name: 'PDF', extension: 'pdf', mime: 'application/pdf' },
        { name: 'Word Document', extension: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { name: 'Image', extension: 'jpg', mime: 'image/jpeg' },
        { name: 'Video', extension: 'mp4', mime: 'video/mp4' },
        { name: 'Spreadsheet', extension: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ];

    formats.forEach(format => {
        db.prepare(`
            INSERT INTO asset_format_master (format_name, file_extension, mime_type, status)
            VALUES (?, ?, ?, ?)
        `).run(format.name, format.extension, format.mime, 'active');
    });

    // Insert sample assets
    console.log('🎨 Adding sample assets...');
    const assets = [
        { asset_name: 'Research Methodology Guide', category_id: 1, type_id: 1, format_id: 1, application_type: 'web' },
        { asset_name: 'Academic Writing Template', category_id: 2, type_id: 2, format_id: 2, application_type: 'web' },
        { asset_name: 'Statistical Analysis Report', category_id: 4, type_id: 4, format_id: 1, application_type: 'seo' },
        { asset_name: 'Food Safety Checklist', category_id: 6, type_id: 7, format_id: 2, application_type: 'smm' },
        { asset_name: 'Dissertation Writing Guide', category_id: 8, type_id: 8, format_id: 1, application_type: 'web' }
    ];

    assets.forEach(asset => {
        db.prepare(`
            INSERT INTO assets (asset_name, category_id, type_id, format_id, application_type, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(asset.asset_name, asset.category_id, asset.type_id, asset.format_id, asset.application_type, 'published', 1);
    });

    // Insert sample keywords
    console.log('🔑 Adding sample keywords...');
    const keywords = [
        { keyword: 'research paper writing', search_volume: 1200, difficulty: 45 },
        { keyword: 'academic editing services', search_volume: 800, difficulty: 52 },
        { keyword: 'statistical analysis help', search_volume: 950, difficulty: 48 },
        { keyword: 'food safety testing', search_volume: 650, difficulty: 38 },
        { keyword: 'dissertation writing help', search_volume: 1100, difficulty: 55 }
    ];

    keywords.forEach(kw => {
        db.prepare(`
            INSERT INTO keywords (keyword, search_volume, difficulty, status)
            VALUES (?, ?, ?, ?)
        `).run(kw.keyword, kw.search_volume, kw.difficulty, 'active');
    });

    // Insert sample platforms
    console.log('🌐 Adding sample platforms...');
    const platforms = [
        { name: 'Website', type: 'web' },
        { name: 'Facebook', type: 'social' },
        { name: 'Instagram', type: 'social' },
        { name: 'LinkedIn', type: 'social' },
        { name: 'Twitter', type: 'social' }
    ];

    platforms.forEach(platform => {
        db.prepare(`
            INSERT INTO platforms (platform_name, platform_type, status)
            VALUES (?, ?, ?)
        `).run(platform.name, platform.type, 'active');
    });

    // Insert sample content types
    console.log('📝 Adding sample content types...');
    const contentTypes = [
        'Blog Post',
        'Landing Page',
        'Case Study',
        'Whitepaper',
        'Infographic',
        'Video Script',
        'Email Campaign'
    ];

    contentTypes.forEach(type => {
        db.prepare(`
            INSERT INTO content_types (type_name, status)
            VALUES (?, ?)
        `).run(type, 'active');
    });

    // Insert sample backlink sources
    console.log('🔗 Adding sample backlink sources...');
    const sources = [
        { name: 'Academic Directory', domain: 'academicdirectory.com', authority: 75 },
        { name: 'Research Hub', domain: 'researchhub.com', authority: 82 },
        { name: 'Education Portal', domain: 'educationportal.com', authority: 68 }
    ];

    sources.forEach(source => {
        db.prepare(`
            INSERT INTO backlink_sources (source_name, domain, authority_score, status)
            VALUES (?, ?, ?, ?)
        `).run(source.name, source.domain, source.authority, 'active');
    });

    console.log('\n✅ Sample data inserted successfully!\n');

    // ==================== VERIFICATION ====================
    console.log('🔍 Verifying database...\n');

    const tables = db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all();

    console.log(`📊 Total tables created: ${tables.length}`);
    tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`   ✓ ${table.name}: ${count.count} records`);
    });

    db.close();

    console.log('\n🎉 Database initialization completed successfully!');
    console.log(`📁 Database location: ${dbPath}`);
    console.log('\n✨ Your application is ready to use!\n');

} catch (error) {
    console.error('❌ Error during database initialization:', error.message);
    db.close();
    process.exit(1);
}
