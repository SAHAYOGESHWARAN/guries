/**
 * Seed Script: Asset Usage Data
 * 
 * Adds sample usage data for testing the Usage Panel feature
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

async function seedAssetUsage() {
    console.log('Seeding asset usage data...');
    console.log('Database path:', dbPath);

    try {
        // First, get an existing asset ID
        const assetsResult = db.prepare('SELECT id FROM assets LIMIT 1').all();

        if (assetsResult.length === 0) {
            console.log('No assets found. Please create an asset first.');
            return;
        }

        const assetId = assetsResult[0].id;
        console.log(`Using asset ID: ${assetId}`);

        // Seed Website Usage
        const websiteUrls = [
            { url: 'https://example.com/blog/ai-trends-2025', title: 'AI Trends 2025 Blog Post' },
            { url: 'https://example.com/resources/ai-guide', title: 'AI Resource Guide' }
        ];

        const insertWebsite = db.prepare(
            `INSERT OR IGNORE INTO asset_website_usage (asset_id, website_url, page_title, status)
             VALUES (?, ?, ?, 'active')`
        );

        for (const website of websiteUrls) {
            insertWebsite.run(assetId, website.url, website.title);
        }
        console.log('✓ Seeded website usage data');

        // Seed Social Media Usage
        const socialPosts = [
            { platform: 'LinkedIn', url: 'https://linkedin.com/post/123', status: 'Published', impressions: 25000, clicks: 1800, shares: 250 },
            { platform: 'Twitter', url: 'https://twitter.com/post/456', status: 'Published', impressions: 20200, clicks: 2000, shares: 170 }
        ];

        const insertSocial = db.prepare(
            `INSERT OR IGNORE INTO asset_social_media_usage 
             (asset_id, platform_name, post_url, status, engagement_impressions, engagement_clicks, engagement_shares)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        for (const post of socialPosts) {
            insertSocial.run(assetId, post.platform, post.url, post.status, post.impressions, post.clicks, post.shares);
        }
        console.log('✓ Seeded social media usage data');

        // Seed Backlink Usage
        const backlinks = [
            { domain: 'techblog.com', url: 'https://techblog.com/article/123', status: 'Approved', da: 65 },
            { domain: 'innovation.net', url: 'https://innovation.net/post/456', status: 'Pending', da: 45 }
        ];

        const insertBacklink = db.prepare(
            `INSERT OR IGNORE INTO asset_backlink_usage 
             (asset_id, domain_name, backlink_url, approval_status, da_score)
             VALUES (?, ?, ?, ?, ?)`
        );

        for (const backlink of backlinks) {
            insertBacklink.run(assetId, backlink.domain, backlink.url, backlink.status, backlink.da);
        }
        console.log('✓ Seeded backlink usage data');

        // Seed Engagement Metrics
        db.prepare(
            `INSERT OR REPLACE INTO asset_engagement_metrics 
             (asset_id, total_impressions, total_clicks, total_shares, ctr_percentage, performance_summary)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).run(assetId, 45200, 3800, 420, 8.4, 'High engagement with 8.4% CTR, performing 24% above campaign average.');
        console.log('✓ Seeded engagement metrics data');

        // Update asset usage count
        db.prepare(`UPDATE assets SET usage_count = ? WHERE id = ?`)
            .run(websiteUrls.length + socialPosts.length + backlinks.length, assetId);
        console.log('✓ Updated asset usage count');

        console.log('\n✅ Asset usage data seeded successfully!');
    } catch (error) {
        console.error('Error seeding asset usage data:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run seed
seedAssetUsage()
    .then(() => {
        console.log('Seed completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });

module.exports = { seedAssetUsage };
