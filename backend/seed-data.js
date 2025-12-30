/**
 * Seed sample data for all tables
 */
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mcc_db.sqlite'));

console.log('🌱 Seeding sample data...\n');

const seedIfEmpty = (tableName, checkSql, insertSql, data, label) => {
    try {
        const count = db.prepare(checkSql).get();
        if (count.count === 0) {
            const stmt = db.prepare(insertSql);
            data.forEach(row => stmt.run(...row));
            console.log(`  ✅ ${label || tableName}: ${data.length} records`);
        } else {
            console.log(`  ⏭️  ${label || tableName}: already has data`);
        }
    } catch (e) {
        console.log(`  ❌ ${tableName}: ${e.message}`);
    }
};

// Countries
seedIfEmpty('countries',
    'SELECT COUNT(*) as count FROM countries',
    'INSERT INTO countries (country_name, code, region, status) VALUES (?, ?, ?, ?)',
    [
        ['United States', 'US', 'North America', 'active'],
        ['United Kingdom', 'UK', 'Europe', 'active'],
        ['India', 'IN', 'Asia', 'active'],
        ['Australia', 'AU', 'Oceania', 'active'],
        ['Canada', 'CA', 'North America', 'active'],
        ['Germany', 'DE', 'Europe', 'active'],
    ],
    'Countries'
);

// SEO Errors
seedIfEmpty('seo_errors',
    'SELECT COUNT(*) as count FROM seo_errors',
    'INSERT INTO seo_errors (error_type, category, severity, description, status) VALUES (?, ?, ?, ?, ?)',
    [
        ['Missing Meta Title', 'Meta', 'High', 'Page is missing meta title tag', 'active'],
        ['Missing Meta Description', 'Meta', 'High', 'Page is missing meta description', 'active'],
        ['Duplicate Content', 'Content', 'Medium', 'Duplicate content detected', 'active'],
        ['Broken Links', 'Links', 'High', 'Page contains broken links', 'active'],
        ['Missing Alt Text', 'Images', 'Medium', 'Images missing alt text', 'active'],
        ['Slow Page Speed', 'Technical', 'High', 'Page load time exceeds threshold', 'active'],
    ],
    'SEO Errors'
);

// Asset Types
seedIfEmpty('asset_types',
    'SELECT COUNT(*) as count FROM asset_types',
    'INSERT INTO asset_types (asset_type, dimension, file_formats, description, status) VALUES (?, ?, ?, ?, ?)',
    [
        ['Blog Banner', '1200x630', 'JPG, PNG', 'Banner image for blog posts', 'active'],
        ['Social Post', '1080x1080', 'JPG, PNG', 'Square image for social media', 'active'],
        ['Infographic', '800x2000', 'PNG, PDF', 'Long-form infographic', 'active'],
        ['Video Thumbnail', '1280x720', 'JPG, PNG', 'Thumbnail for videos', 'active'],
        ['Logo', '500x500', 'PNG, SVG', 'Brand logo', 'active'],
    ],
    'Asset Types'
);

// Backlink Sources
seedIfEmpty('backlink_sources',
    'SELECT COUNT(*) as count FROM backlink_sources',
    'INSERT INTO backlink_sources (source_name, source_url, domain_authority, status) VALUES (?, ?, ?, ?)',
    [
        ['Medium', 'https://medium.com', 95, 'active'],
        ['LinkedIn', 'https://linkedin.com', 98, 'active'],
        ['Guest Post Network', 'https://example.com', 45, 'active'],
    ],
    'Backlink Sources'
);

// QC Checklists
seedIfEmpty('qc_checklists',
    'SELECT COUNT(*) as count FROM qc_checklists',
    'INSERT INTO qc_checklists (checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
        ['Content QC', 'content', 'Content', 10, 'weighted', 70, 'active'],
        ['SEO QC', 'seo', 'SEO', 8, 'weighted', 75, 'active'],
        ['Design QC', 'design', 'Design', 6, 'simple', 80, 'active'],
    ],
    'QC Checklists'
);

// OKRs
seedIfEmpty('okrs',
    'SELECT COUNT(*) as count FROM okrs',
    'INSERT INTO okrs (objective, type, cycle, owner, progress, status) VALUES (?, ?, ?, ?, ?, ?)',
    [
        ['Increase organic traffic by 50%', 'Growth', 'Q1 2025', 'Marketing Team', 35, 'active'],
        ['Publish 100 blog posts', 'Content', 'Q1 2025', 'Content Team', 45, 'active'],
        ['Improve domain authority to 50', 'SEO', 'Q1 2025', 'SEO Team', 60, 'active'],
    ],
    'OKRs'
);

// Gold Standards
seedIfEmpty('gold_standards',
    'SELECT COUNT(*) as count FROM gold_standards',
    'INSERT INTO gold_standards (metric_name, category, value, unit, status) VALUES (?, ?, ?, ?, ?)',
    [
        ['Blog Word Count', 'Content', 1500, 'words', 'active'],
        ['Page Load Time', 'Technical', 3, 'seconds', 'active'],
        ['Bounce Rate', 'Analytics', 40, 'percent', 'active'],
        ['Domain Authority', 'SEO', 50, 'score', 'active'],
    ],
    'Gold Standards'
);

// Effort Targets
seedIfEmpty('effort_targets',
    'SELECT COUNT(*) as count FROM effort_targets',
    'INSERT INTO effort_targets (role, category, metric, monthly, weekly, daily, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
        ['Content Writer', 'Content', 'Blog Posts', 8, 2, 0, 'active'],
        ['SEO Specialist', 'SEO', 'Backlinks', 20, 5, 1, 'active'],
        ['Designer', 'Design', 'Graphics', 40, 10, 2, 'active'],
    ],
    'Effort Targets'
);

// Competitor Benchmarks
seedIfEmpty('competitor_benchmarks',
    'SELECT COUNT(*) as count FROM competitor_benchmarks',
    'INSERT INTO competitor_benchmarks (competitor_name, competitor_domain, monthly_traffic, total_keywords, backlinks, status) VALUES (?, ?, ?, ?, ?, ?)',
    [
        ['Competitor A', 'competitor-a.com', 50000, 1200, 500, 'active'],
        ['Competitor B', 'competitor-b.com', 75000, 2000, 800, 'active'],
        ['Competitor C', 'competitor-c.com', 30000, 800, 300, 'active'],
    ],
    'Competitor Benchmarks'
);

// Teams
seedIfEmpty('teams',
    'SELECT COUNT(*) as count FROM teams',
    'INSERT INTO teams (name, description) VALUES (?, ?)',
    [
        ['Content Team', 'Responsible for content creation and management'],
        ['SEO Team', 'Handles search engine optimization'],
        ['Design Team', 'Creates visual assets and graphics'],
        ['Marketing Team', 'Overall marketing strategy and campaigns'],
    ],
    'Teams'
);

// Integrations
seedIfEmpty('integrations',
    'SELECT COUNT(*) as count FROM integrations',
    'INSERT INTO integrations (name, type, status) VALUES (?, ?, ?)',
    [
        ['Google Analytics', 'Analytics', 'inactive'],
        ['Google Search Console', 'SEO', 'inactive'],
        ['Slack', 'Communication', 'inactive'],
        ['Mailchimp', 'Email', 'inactive'],
    ],
    'Integrations'
);

// Sample Users (additional)
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count < 3) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update('password123').digest('hex');

    try {
        db.prepare(`
            INSERT OR IGNORE INTO users (name, email, role, status, password_hash, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Sarah Chen', 's.chen@company.com', 'user', 'active', hash, 'Content');

        db.prepare(`
            INSERT OR IGNORE INTO users (name, email, role, status, password_hash, department)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('James Wilson', 'j.wilson@company.com', 'user', 'active', hash, 'SEO');

        console.log('  ✅ Sample Users: added');
    } catch (e) {
        console.log('  ⏭️  Sample Users: already exist');
    }
} else {
    console.log('  ⏭️  Users: already has data');
}

console.log('\n✅ Seeding completed!');
db.close();
