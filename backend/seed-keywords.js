const Database = require('better-sqlite3');
const path = require('path');

// Add sample keywords to the database
function seedKeywords() {
    const dbPath = path.join(__dirname, 'mcc_db.sqlite');
    const db = new Database(dbPath);

    try {
        console.log('Adding sample keywords...');

        const insertKeyword = db.prepare(`
            INSERT OR IGNORE INTO keywords (keyword, keyword_type, search_volume, competition, mapped_service) 
            VALUES (?, ?, ?, ?, ?)
        `);

        const sampleKeywords = [
            ['digital marketing', 'primary', 12000, 'high', 'Digital Marketing Services'],
            ['SEO optimization', 'primary', 8500, 'high', 'SEO Services'],
            ['social media marketing', 'primary', 9200, 'medium', 'SMM Services'],
            ['content marketing', 'secondary', 6800, 'medium', 'Content Services'],
            ['web development', 'primary', 15000, 'high', 'Web Development'],
            ['brand strategy', 'secondary', 3400, 'low', 'Branding Services'],
            ['email marketing', 'secondary', 5600, 'medium', 'Email Services'],
            ['PPC advertising', 'primary', 7200, 'high', 'PPC Services'],
            ['conversion optimization', 'secondary', 2800, 'medium', 'CRO Services'],
            ['analytics tracking', 'secondary', 1900, 'low', 'Analytics Services'],
            ['mobile marketing', 'secondary', 4100, 'medium', 'Mobile Services'],
            ['video marketing', 'secondary', 3700, 'medium', 'Video Services'],
            ['influencer marketing', 'secondary', 4500, 'medium', 'Influencer Services'],
            ['marketing automation', 'secondary', 3200, 'medium', 'Automation Services'],
            ['lead generation', 'primary', 8900, 'high', 'Lead Gen Services']
        ];

        sampleKeywords.forEach(([keyword, type, volume, competition, service]) => {
            insertKeyword.run(keyword, type, volume, competition, service);
        });

        console.log('Sample keywords added successfully');

    } catch (error) {
        console.error('Error adding sample keywords:', error);
        throw error;
    } finally {
        db.close();
    }
}

if (require.main === module) {
    seedKeywords();
}

module.exports = { seedKeywords };