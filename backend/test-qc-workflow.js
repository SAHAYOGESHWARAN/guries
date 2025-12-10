const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

async function testQcWorkflow() {
    try {
        console.log('Testing QC workflow...');

        // Check existing assets
        const existingAssets = db.prepare("SELECT * FROM assets WHERE status = 'Pending QC Review'").all();
        console.log(`Found ${existingAssets.length} assets pending QC review`);

        if (existingAssets.length === 0) {
            // Create a test asset for QC review
            const insertAsset = db.prepare(`
                INSERT INTO assets (
                    asset_name, asset_type, asset_category, application_type, 
                    status, seo_score, grammar_score, submitted_by, submitted_at,
                    web_title, web_description, web_keywords, web_url, web_h1,
                    usage_status, rework_count, keywords
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = insertAsset.run(
                'Test SEO Article - Marketing Strategies',
                'article',
                'what science can do',
                'seo',
                'Pending QC Review',
                85, // SEO score
                92, // Grammar score
                1, // submitted_by (QC reviewer user)
                new Date().toISOString(),
                'Top 10 Marketing Strategies for 2025',
                'Discover the most effective marketing strategies that will drive your business growth in 2025',
                'marketing strategies, digital marketing, business growth',
                'https://example.com/marketing-strategies-2025',
                'Top 10 Marketing Strategies for 2025',
                'Available',
                0, // rework_count
                JSON.stringify(['marketing', 'digital marketing', 'strategies'])
            );

            console.log(`Created test asset with ID: ${result.lastInsertRowid}`);

            // Create another test asset for SMM
            const smmResult = insertAsset.run(
                'Instagram Post - Product Launch',
                'graphic',
                'social media',
                'smm',
                'Pending QC Review',
                78, // SEO score
                95, // Grammar score
                1, // submitted_by
                new Date().toISOString(),
                null, null, null, null, null,
                'Available',
                0, // rework_count
                JSON.stringify(['product launch', 'instagram', 'social media'])
            );

            console.log(`Created SMM test asset with ID: ${smmResult.lastInsertRowid}`);

            // Create a WEB asset
            const webResult = insertAsset.run(
                'Landing Page - Service Overview',
                'webpage',
                'service page',
                'web',
                'Pending QC Review',
                88, // SEO score
                90, // Grammar score
                1, // submitted_by
                new Date().toISOString(),
                'Professional Web Development Services',
                'Get custom web development solutions tailored to your business needs',
                'web development, custom websites, professional services',
                'https://example.com/web-development-services',
                'Professional Web Development Services',
                'Available',
                0, // rework_count
                JSON.stringify(['web development', 'services', 'professional'])
            );

            console.log(`Created WEB test asset with ID: ${webResult.lastInsertRowid}`);
        }

        // Show all assets pending QC
        const pendingAssets = db.prepare(`
            SELECT id, asset_name, application_type, status, seo_score, grammar_score, rework_count 
            FROM assets 
            WHERE status IN ('Pending QC Review', 'Rework Required')
            ORDER BY submitted_at ASC
        `).all();

        console.log('\nAssets pending QC review:');
        pendingAssets.forEach(asset => {
            console.log(`- ID: ${asset.id}, Name: ${asset.asset_name}, Type: ${asset.application_type}, Status: ${asset.status}, Reworks: ${asset.rework_count || 0}`);
        });

    } catch (error) {
        console.error('Error testing QC workflow:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the test
testQcWorkflow()
    .then(() => {
        console.log('\nQC workflow test completed successfully');
        console.log('You can now test the QC interface at: http://localhost:5173');
        process.exit(0);
    })
    .catch((error) => {
        console.error('QC workflow test failed:', error);
        process.exit(1);
    });