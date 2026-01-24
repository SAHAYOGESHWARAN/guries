const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🌱 Seeding test assets...\n');

try {
    // Create test web assets
    const webAssets = [
        {
            name: 'Blog Banner - Marketing',
            type: 'Blog Banner',
            category: 'Graphics',
            format: 'PNG',
            title: 'Marketing Blog Banner',
            description: 'Professional blog banner for marketing content',
            meta: 'Marketing blog banner - SEO optimized',
            url: 'https://example.com/blog/marketing',
            h1: 'Marketing Strategies',
            h2: 'Digital Marketing Tips'
        },
        {
            name: 'Infographic - SEO Guide',
            type: 'Infographic',
            category: 'Graphics',
            format: 'PNG',
            title: 'SEO Guide Infographic',
            description: 'Complete SEO optimization guide',
            meta: 'SEO guide infographic for better rankings',
            url: 'https://example.com/seo-guide',
            h1: 'SEO Optimization Guide',
            h2: 'Step-by-step SEO process'
        },
        {
            name: 'Social Post Template',
            type: 'Social Post',
            category: 'Social',
            format: 'PNG',
            title: 'Social Media Post',
            description: 'Engaging social media post template',
            meta: 'Social media post for engagement',
            url: 'https://example.com/social',
            h1: 'Social Media Content',
            h2: 'Engagement strategies'
        },
        {
            name: 'Video Thumbnail',
            type: 'Thumbnail',
            category: 'Video',
            format: 'PNG',
            title: 'YouTube Video Thumbnail',
            description: 'Eye-catching video thumbnail',
            meta: 'YouTube thumbnail for video marketing',
            url: 'https://example.com/video',
            h1: 'Video Content',
            h2: 'Video marketing tips'
        },
        {
            name: 'Product Diagram',
            type: 'Diagram',
            category: 'Graphics',
            format: 'PNG',
            title: 'Product Architecture Diagram',
            description: 'Technical product architecture',
            meta: 'Product diagram for documentation',
            url: 'https://example.com/product',
            h1: 'Product Architecture',
            h2: 'System components'
        }
    ];

    // Create test SEO assets
    const seoAssets = [
        {
            name: 'SEO Article - Keywords',
            type: 'Blog Post',
            category: 'Content'
        },
        {
            name: 'SEO Article - Backlinks',
            type: 'Blog Post',
            category: 'Content'
        }
    ];

    // Create test SMM assets
    const smmAssets = [
        {
            name: 'Facebook Post',
            type: 'Social Post',
            category: 'Social',
            platform: 'Facebook'
        },
        {
            name: 'Instagram Story',
            type: 'Story',
            category: 'Social',
            platform: 'Instagram'
        },
        {
            name: 'LinkedIn Article',
            type: 'Article',
            category: 'Social',
            platform: 'LinkedIn'
        }
    ];

    // Insert web assets
    console.log('📝 Creating Web Assets...');
    webAssets.forEach((asset) => {
        db.prepare(`
            INSERT INTO assets (
                asset_name, asset_type, asset_category, asset_format,
                application_type, status, workflow_stage, qc_status,
                web_title, web_description, web_meta_description,
                web_url, web_h1, web_h2_1, web_body_content,
                seo_score, grammar_score, ai_plagiarism_score,
                linking_active, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            asset.name,
            asset.type,
            asset.category,
            asset.format,
            'web',
            'Published',
            'Published',
            'Approved',
            asset.title,
            asset.description,
            asset.meta,
            asset.url,
            asset.h1,
            asset.h2,
            'Sample web asset content for testing',
            Math.round(85 + Math.random() * 15),
            Math.round(90 + Math.random() * 10),
            Math.round(95 + Math.random() * 5),
            1,
            1,
            new Date().toISOString()
        );
        console.log(`  ✓ Created: ${asset.name}`);
    });

    // Insert SEO assets
    console.log('\n📝 Creating SEO Assets...');
    seoAssets.forEach((asset) => {
        db.prepare(`
            INSERT INTO assets (
                asset_name, asset_type, asset_category,
                application_type, status, workflow_stage, qc_status,
                seo_score, grammar_score, ai_plagiarism_score,
                linking_active, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            asset.name,
            asset.type,
            asset.category,
            'seo',
            'Published',
            'Published',
            'Approved',
            Math.round(80 + Math.random() * 20),
            Math.round(85 + Math.random() * 15),
            Math.round(90 + Math.random() * 10),
            1,
            1,
            new Date().toISOString()
        );
        console.log(`  ✓ Created: ${asset.name}`);
    });

    // Insert SMM assets
    console.log('\n📝 Creating SMM Assets...');
    smmAssets.forEach((asset) => {
        db.prepare(`
            INSERT INTO assets (
                asset_name, asset_type, asset_category,
                application_type, status, workflow_stage, qc_status,
                smm_platform,
                seo_score, grammar_score, ai_plagiarism_score,
                linking_active, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            asset.name,
            asset.type,
            asset.category,
            'smm',
            'Published',
            'Published',
            'Approved',
            asset.platform,
            Math.round(75 + Math.random() * 25),
            Math.round(80 + Math.random() * 20),
            Math.round(85 + Math.random() * 15),
            1,
            1,
            new Date().toISOString()
        );
        console.log(`  ✓ Created: ${asset.name}`);
    });

    // Verify data
    console.log('\n✅ Verification:');
    const webCount = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type = 'web'").get();
    const seoCount = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type = 'seo'").get();
    const smmCount = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type = 'smm'").get();

    console.log(`  - Web Assets: ${webCount.count}`);
    console.log(`  - SEO Assets: ${seoCount.count}`);
    console.log(`  - SMM Assets: ${smmCount.count}`);

    console.log('\n✨ Test assets seeded successfully!');
} catch (error) {
    console.error('❌ Error seeding assets:', error.message);
    process.exit(1);
} finally {
    db.close();
}
