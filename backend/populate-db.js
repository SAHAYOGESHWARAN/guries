/**
 * Database Population Script
 * Populates existing tables with sample data
 * Usage: node populate-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🚀 Starting database population...\n');

try {
    // ==================== USERS ====================
    console.log('👥 Adding sample users...');

    // Check if users already exist
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    if (userCount === 0) {
        db.prepare(`
            INSERT INTO users (name, email, role, status, password_hash, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Admin User', 'admin@example.com', 'admin', 'active', 'hashed_password_123', 'Management');

        db.prepare(`
            INSERT INTO users (name, email, role, status, password_hash, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Editor User', 'editor@example.com', 'editor', 'active', 'hashed_password_456', 'Content');

        db.prepare(`
            INSERT INTO users (name, email, role, status, password_hash, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('SEO Specialist', 'seo@example.com', 'seo', 'active', 'hashed_password_789', 'SEO');

        console.log('   ✓ 3 users added');
    } else {
        console.log(`   ✓ ${userCount} users already exist`);
    }

    // ==================== BRANDS ====================
    console.log('🏢 Adding sample brands...');

    const brandCount = db.prepare('SELECT COUNT(*) as count FROM brands').get().count;

    if (brandCount === 0) {
        const brands = [
            { name: 'Pubrica', code: 'PUB001', industry: 'Academic Publishing' },
            { name: 'Stats Work', code: 'STW001', industry: 'Statistical Analysis' },
            { name: 'Food Research Lab', code: 'FRL001', industry: 'Food Science' },
            { name: 'PhD Assistance', code: 'PHD001', industry: 'Education' },
            { name: 'Tutors India', code: 'TUT001', industry: 'Online Education' }
        ];

        brands.forEach(brand => {
            db.prepare(`
                INSERT INTO brands (name, code, industry, status)
                VALUES (?, ?, ?, ?)
            `).run(brand.name, brand.code, brand.industry, 'active');
        });

        console.log(`   ✓ ${brands.length} brands added`);
    } else {
        console.log(`   ✓ ${brandCount} brands already exist`);
    }

    // ==================== SERVICES ====================
    console.log('🛠️ Adding sample services...');

    const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;

    if (serviceCount === 0) {
        const services = [
            { name: 'Research Paper Writing', code: 'RPW001', slug: 'research-paper-writing' },
            { name: 'Academic Editing', code: 'AED001', slug: 'academic-editing' },
            { name: 'Statistical Analysis', code: 'STA001', slug: 'statistical-analysis' },
            { name: 'Food Safety Testing', code: 'FST001', slug: 'food-safety-testing' },
            { name: 'Dissertation Help', code: 'DIS001', slug: 'dissertation-help' },
            { name: 'Online Tutoring', code: 'TUT001', slug: 'online-tutoring' }
        ];

        services.forEach(service => {
            db.prepare(`
                INSERT INTO services (service_name, service_code, slug, status, meta_title, meta_description)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                service.name,
                service.code,
                service.slug,
                'published',
                `${service.name} - Professional Services`,
                `Get expert ${service.name.toLowerCase()} services from our experienced team.`
            );
        });

        console.log(`   ✓ ${services.length} services added`);
    } else {
        console.log(`   ✓ ${serviceCount} services already exist`);
    }

    // ==================== SUB-SERVICES ====================
    console.log('📑 Adding sample sub-services...');

    const subServiceCount = db.prepare('SELECT COUNT(*) as count FROM sub_services').get().count;

    if (subServiceCount === 0) {
        const subServices = [
            { parent_id: 1, name: 'Thesis Writing', code: 'THW001', slug: 'thesis-writing', content_type: 'Pillar' },
            { parent_id: 1, name: 'Journal Article Writing', code: 'JAW001', slug: 'journal-article-writing', content_type: 'Blog' },
            { parent_id: 2, name: 'Manuscript Editing', code: 'MED001', slug: 'manuscript-editing', content_type: 'Landing' },
            { parent_id: 3, name: 'Regression Analysis', code: 'REG001', slug: 'regression-analysis', content_type: 'Case Study' },
            { parent_id: 4, name: 'Microbiological Testing', code: 'MIC001', slug: 'microbiological-testing', content_type: 'Sales Page' },
            { parent_id: 5, name: 'Dissertation Consultation', code: 'DIS002', slug: 'dissertation-consultation', content_type: 'Blog' }
        ];

        subServices.forEach(subService => {
            db.prepare(`
                INSERT INTO sub_services (sub_service_name, sub_service_code, parent_service_id, slug, content_type, status, meta_title, meta_description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                subService.name,
                subService.code,
                subService.parent_id,
                subService.slug,
                subService.content_type,
                'published',
                `${subService.name} - Expert Help`,
                `Professional ${subService.name.toLowerCase()} services tailored to your needs.`
            );
        });

        console.log(`   ✓ ${subServices.length} sub-services added`);
    } else {
        console.log(`   ✓ ${subServiceCount} sub-services already exist`);
    }

    // ==================== ASSET CATEGORIES ====================
    console.log('📂 Adding sample asset categories...');

    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM asset_category_master').get().count;

    if (categoryCount === 0) {
        const categories = [
            'Research Articles',
            'Academic Writing',
            'Publication Support',
            'Statistical Analysis',
            'Data Visualization',
            'Food Safety',
            'Nutritional Analysis',
            'Dissertation Help',
            'Learning Resources',
            'Case Studies'
        ];

        categories.forEach(category => {
            db.prepare(`
                INSERT INTO asset_category_master (category_name, description, status)
                VALUES (?, ?, ?)
            `).run(category, `${category} assets and resources`, 'active');
        });

        console.log(`   ✓ ${categories.length} asset categories added`);
    } else {
        console.log(`   ✓ ${categoryCount} asset categories already exist`);
    }

    // ==================== ASSET TYPES ====================
    console.log('📋 Adding sample asset types...');

    const typeCount = db.prepare('SELECT COUNT(*) as count FROM asset_type_master').get().count;

    if (typeCount === 0) {
        const types = [
            'Research Paper',
            'Review Article',
            'Case Study',
            'Technical Report',
            'Analysis Report',
            'Data Summary',
            'Test Report',
            'Thesis Chapter',
            'Study Material',
            'Infographic'
        ];

        types.forEach(type => {
            db.prepare(`
                INSERT INTO asset_type_master (asset_type_name, description, status)
                VALUES (?, ?, ?)
            `).run(type, `${type} asset type`, 'active');
        });

        console.log(`   ✓ ${types.length} asset types added`);
    } else {
        console.log(`   ✓ ${typeCount} asset types already exist`);
    }

    // ==================== ASSET FORMATS ====================
    console.log('📄 Adding sample asset formats...');

    const formatCount = db.prepare('SELECT COUNT(*) as count FROM asset_format_master').get().count;

    if (formatCount === 0) {
        const formats = [
            { name: 'PDF', extension: 'pdf', mime: 'application/pdf' },
            { name: 'Word Document', extension: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { name: 'Image (JPG)', extension: 'jpg', mime: 'image/jpeg' },
            { name: 'Image (PNG)', extension: 'png', mime: 'image/png' },
            { name: 'Video (MP4)', extension: 'mp4', mime: 'video/mp4' },
            { name: 'Spreadsheet', extension: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            { name: 'PowerPoint', extension: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
        ];

        formats.forEach(format => {
            db.prepare(`
                INSERT INTO asset_format_master (format_name, file_extension, mime_type, status)
                VALUES (?, ?, ?, ?)
            `).run(format.name, format.extension, format.mime, 'active');
        });

        console.log(`   ✓ ${formats.length} asset formats added`);
    } else {
        console.log(`   ✓ ${formatCount} asset formats already exist`);
    }

    // ==================== ASSETS ====================
    console.log('🎨 Adding sample assets...');

    const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get().count;

    if (assetCount === 0) {
        const assets = [
            { name: 'Research Methodology Guide', category: 'Research Articles', type: 'Research Paper', format: 'PDF', app_type: 'web' },
            { name: 'Academic Writing Template', category: 'Academic Writing', type: 'Study Material', format: 'Word Document', app_type: 'web' },
            { name: 'Statistical Analysis Report', category: 'Statistical Analysis', type: 'Analysis Report', format: 'PDF', app_type: 'seo' },
            { name: 'Food Safety Checklist', category: 'Food Safety', type: 'Test Report', format: 'Word Document', app_type: 'smm' },
            { name: 'Dissertation Writing Guide', category: 'Dissertation Help', type: 'Thesis Chapter', format: 'PDF', app_type: 'web' },
            { name: 'Data Visualization Examples', category: 'Data Visualization', type: 'Infographic', format: 'Image (PNG)', app_type: 'smm' }
        ];

        assets.forEach(asset => {
            db.prepare(`
                INSERT INTO assets (asset_name, asset_category, asset_type, asset_format, application_type, status, created_by, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                asset.name,
                asset.category,
                asset.type,
                asset.format,
                asset.app_type,
                'published',
                1,
                `High-quality ${asset.name.toLowerCase()} for professional use`
            );
        });

        console.log(`   ✓ ${assets.length} assets added`);
    } else {
        console.log(`   ✓ ${assetCount} assets already exist`);
    }

    // ==================== KEYWORDS ====================
    console.log('🔑 Adding sample keywords...');

    const keywordCount = db.prepare('SELECT COUNT(*) as count FROM keywords').get().count;

    if (keywordCount === 0) {
        const keywords = [
            { keyword: 'research paper writing', volume: 1200, difficulty: 45 },
            { keyword: 'academic editing services', volume: 800, difficulty: 52 },
            { keyword: 'statistical analysis help', volume: 950, difficulty: 48 },
            { keyword: 'food safety testing', volume: 650, difficulty: 38 },
            { keyword: 'dissertation writing help', volume: 1100, difficulty: 55 },
            { keyword: 'online tutoring services', volume: 2100, difficulty: 62 }
        ];

        keywords.forEach(kw => {
            db.prepare(`
                INSERT INTO keywords (keyword, search_volume, competition_score, status)
                VALUES (?, ?, ?, ?)
            `).run(kw.keyword, kw.volume, kw.difficulty, 'active');
        });

        console.log(`   ✓ ${keywords.length} keywords added`);
    } else {
        console.log(`   ✓ ${keywordCount} keywords already exist`);
    }

    // ==================== PLATFORMS ====================
    console.log('🌐 Adding sample platforms...');

    const platformCount = db.prepare('SELECT COUNT(*) as count FROM platforms').get().count;

    if (platformCount === 0) {
        const platforms = [
            { name: 'Website', types: 1, assets: 5 },
            { name: 'Facebook', types: 2, assets: 3 },
            { name: 'Instagram', types: 2, assets: 4 },
            { name: 'LinkedIn', types: 1, assets: 3 },
            { name: 'Twitter', types: 1, assets: 2 },
            { name: 'YouTube', types: 1, assets: 5 }
        ];

        platforms.forEach(platform => {
            db.prepare(`
                INSERT INTO platforms (platform_name, content_types_count, asset_types_count, status)
                VALUES (?, ?, ?, ?)
            `).run(platform.name, platform.types, platform.assets, 'active');
        });

        console.log(`   ✓ ${platforms.length} platforms added`);
    } else {
        console.log(`   ✓ ${platformCount} platforms already exist`);
    }

    // ==================== CONTENT TYPES ====================
    console.log('📝 Adding sample content types...');

    const contentTypeCount = db.prepare('SELECT COUNT(*) as count FROM content_types').get().count;

    if (contentTypeCount === 0) {
        const contentTypes = [
            'Blog Post',
            'Landing Page',
            'Case Study',
            'Whitepaper',
            'Infographic',
            'Video Script',
            'Email Campaign',
            'Social Media Post',
            'Product Guide',
            'Tutorial'
        ];

        contentTypes.forEach(type => {
            db.prepare(`
                INSERT INTO content_types (content_type, category, status)
                VALUES (?, ?, ?)
            `).run(type, 'General', 'active');
        });

        console.log(`   ✓ ${contentTypes.length} content types added`);
    } else {
        console.log(`   ✓ ${contentTypeCount} content types already exist`);
    }

    // ==================== PROJECTS ====================
    console.log('📊 Adding sample projects...');

    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;

    if (projectCount === 0) {
        const projects = [
            { name: 'Website Redesign', code: 'WEB001', status: 'active', owner_id: 1 },
            { name: 'Content Marketing Campaign', code: 'CMC001', status: 'active', owner_id: 2 },
            { name: 'SEO Optimization', code: 'SEO001', status: 'in_progress', owner_id: 3 },
            { name: 'Social Media Strategy', code: 'SMM001', status: 'planning', owner_id: 1 }
        ];

        projects.forEach(project => {
            db.prepare(`
                INSERT INTO projects (project_name, project_code, status, owner_id, description)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                project.name,
                project.code,
                project.status,
                project.owner_id,
                `${project.name} - Strategic initiative`
            );
        });

        console.log(`   ✓ ${projects.length} projects added`);
    } else {
        console.log(`   ✓ ${projectCount} projects already exist`);
    }

    // ==================== TASKS ====================
    console.log('✅ Adding sample tasks...');

    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    if (taskCount === 0) {
        const tasks = [
            { name: 'Create homepage content', status: 'todo', priority: 'high', assigned_to: 2, project_id: 1 },
            { name: 'Write blog post', status: 'in_progress', priority: 'medium', assigned_to: 2, project_id: 2 },
            { name: 'Optimize meta tags', status: 'todo', priority: 'high', assigned_to: 3, project_id: 3 },
            { name: 'Create social media graphics', status: 'todo', priority: 'medium', assigned_to: 1, project_id: 4 }
        ];

        tasks.forEach(task => {
            db.prepare(`
                INSERT INTO tasks (task_name, status, priority, assigned_to, project_id, created_by, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                task.name,
                task.status,
                task.priority,
                task.assigned_to,
                task.project_id,
                1,
                `Task: ${task.name}`
            );
        });

        console.log(`   ✓ ${tasks.length} tasks added`);
    } else {
        console.log(`   ✓ ${taskCount} tasks already exist`);
    }

    // ==================== CAMPAIGNS ====================
    console.log('📢 Adding sample campaigns...');

    const campaignCount = db.prepare('SELECT COUNT(*) as count FROM campaigns').get().count;

    if (campaignCount === 0) {
        const campaigns = [
            { name: 'Summer Promotion', type: 'promotional', status: 'active', budget: 5000 },
            { name: 'Brand Awareness', type: 'awareness', status: 'planning', budget: 10000 },
            { name: 'Product Launch', type: 'launch', status: 'active', budget: 15000 },
            { name: 'Customer Retention', type: 'retention', status: 'completed', budget: 3000 }
        ];

        campaigns.forEach(campaign => {
            db.prepare(`
                INSERT INTO campaigns (campaign_name, campaign_type, status, budget, created_by, description)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                campaign.name,
                campaign.type,
                campaign.status,
                campaign.budget,
                1,
                `${campaign.name} campaign`
            );
        });

        console.log(`   ✓ ${campaigns.length} campaigns added`);
    } else {
        console.log(`   ✓ ${campaignCount} campaigns already exist`);
    }

    db.close();

    console.log('\n✅ Database population completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   ✓ Users configured');
    console.log('   ✓ Brands created');
    console.log('   ✓ Services and sub-services added');
    console.log('   ✓ Asset categories, types, and formats configured');
    console.log('   ✓ Sample assets created');
    console.log('   ✓ Keywords added');
    console.log('   ✓ Platforms configured');
    console.log('   ✓ Content types defined');
    console.log('   ✓ Projects and tasks created');
    console.log('   ✓ Campaigns initialized');
    console.log('\n🎉 Your database is ready for production use!\n');

} catch (error) {
    console.error('❌ Error during database population:', error.message);
    db.close();
    process.exit(1);
}
