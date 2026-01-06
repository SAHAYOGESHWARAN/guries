/**
 * Migration: Create backlinks table for SEO Asset workflow
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating backlinks table...');

try {
    // Create backlinks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain VARCHAR(500) NOT NULL,
            platform_type VARCHAR(100),
            da_score INTEGER DEFAULT 0,
            spam_score INTEGER DEFAULT 0,
            country VARCHAR(100),
            pricing VARCHAR(50) DEFAULT 'Free',
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Backlinks table created');

    // Check if table has data
    const count = db.prepare('SELECT COUNT(*) as count FROM backlinks').get();

    if (count.count === 0) {
        // Seed sample data
        const sampleBacklinks = [
            { domain: 'medium.com', platform_type: 'Guest Post', da_score: 95, spam_score: 1, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'linkedin.com', platform_type: 'Social Bookmark', da_score: 98, spam_score: 1, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'quora.com', platform_type: 'Forum', da_score: 93, spam_score: 2, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'reddit.com', platform_type: 'Forum', da_score: 97, spam_score: 1, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'dev.to', platform_type: 'Blog Comment', da_score: 85, spam_score: 2, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'hashnode.com', platform_type: 'Guest Post', da_score: 78, spam_score: 3, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'wordpress.com', platform_type: 'Web 2.0', da_score: 94, spam_score: 1, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'blogger.com', platform_type: 'Web 2.0', da_score: 89, spam_score: 2, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'tumblr.com', platform_type: 'Web 2.0', da_score: 86, spam_score: 3, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'github.com', platform_type: 'Profile Link', da_score: 96, spam_score: 1, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'pinterest.com', platform_type: 'Social Bookmark', da_score: 94, spam_score: 1, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'slideshare.net', platform_type: 'Article Submission', da_score: 91, spam_score: 2, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'issuu.com', platform_type: 'Article Submission', da_score: 88, spam_score: 3, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'scribd.com', platform_type: 'Article Submission', da_score: 90, spam_score: 2, country: 'USA', pricing: 'Free', status: 'active' },
            { domain: 'prlog.org', platform_type: 'Press Release', da_score: 72, spam_score: 5, country: 'USA', pricing: 'Free', status: 'active' }
        ];

        const stmt = db.prepare(`
            INSERT INTO backlinks (domain, platform_type, da_score, spam_score, country, pricing, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const bl of sampleBacklinks) {
            stmt.run(bl.domain, bl.platform_type, bl.da_score, bl.spam_score, bl.country, bl.pricing, bl.status);
        }
        console.log(`✅ Seeded ${sampleBacklinks.length} sample backlinks`);
    } else {
        console.log(`⏭️  Backlinks table already has ${count.count} records`);
    }

} catch (err) {
    console.error('❌ Error:', err.message);
}

db.close();
console.log('Migration complete');
