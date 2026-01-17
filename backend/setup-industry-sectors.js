const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

try {
    console.log('Setting up industry_sectors table...');

    const tableInfo = db.prepare(`PRAGMA table_info(industry_sectors)`).all();

    if (tableInfo.length === 0) {
        console.log('Creating table...');
        db.exec(`
            CREATE TABLE industry_sectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                industry VARCHAR(255) NOT NULL,
                sector VARCHAR(255) NOT NULL,
                application VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    db.exec(`CREATE INDEX IF NOT EXISTS idx_industry_sectors_industry ON industry_sectors(industry)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_industry_sectors_country ON industry_sectors(country)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_industry_sectors_status ON industry_sectors(status)`);

    const count = db.prepare(`SELECT COUNT(*) as cnt FROM industry_sectors`).get();

    if (count.cnt === 0) {
        console.log('Inserting sample data...');

        const sampleData = [
            ['Technology', 'Software', 'SaaS Platforms', 'United States', 'Cloud-based software solutions'],
            ['Technology', 'Software', 'Enterprise Solutions', 'United States', 'Large-scale enterprise software'],
            ['Technology', 'Cloud Services', 'Infrastructure', 'United States', 'Cloud infrastructure services'],
            ['Technology', 'Cloud Services', 'Platform Services', 'United States', 'Cloud platform services'],
            ['Technology', 'AI/ML', 'Machine Learning', 'United States', 'Machine learning solutions'],
            ['Technology', 'AI/ML', 'Natural Language Processing', 'United States', 'NLP solutions'],
            ['Healthcare', 'Pharmaceuticals', 'Drug Manufacturing', 'United Kingdom', 'Pharmaceutical manufacturing'],
            ['Healthcare', 'Medical Devices', 'Diagnostic Equipment', 'United Kingdom', 'Medical diagnostic devices'],
            ['Healthcare', 'Healthcare IT', 'EHR Systems', 'United Kingdom', 'Electronic health records'],
            ['Finance', 'Banking', 'Digital Banking', 'Canada', 'Digital banking solutions'],
            ['Finance', 'Insurance', 'InsurTech', 'Canada', 'Insurance technology'],
            ['Finance', 'Investment', 'Fintech', 'Canada', 'Financial technology'],
            ['E-commerce', 'Retail', 'Online Retail', 'Australia', 'Online retail platforms'],
            ['E-commerce', 'Marketplace', 'B2B Marketplace', 'Australia', 'Business-to-business marketplace'],
            ['E-commerce', 'Logistics', 'Supply Chain', 'Australia', 'Supply chain management'],
            ['Education', 'EdTech', 'Online Learning', 'United States', 'Online learning platforms'],
            ['Education', 'EdTech', 'Course Management', 'United States', 'Learning management systems'],
            ['Education', 'Training', 'Corporate Training', 'United Kingdom', 'Corporate training solutions'],
        ];

        const insertStmt = db.prepare(`
            INSERT INTO industry_sectors 
            (industry, sector, application, country, description, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `);

        sampleData.forEach(row => insertStmt.run(...row));
        console.log(`Inserted ${sampleData.length} records`);
    }

    db.close();
    console.log('✅ Setup complete');
} catch (error) {
    console.error('Error:', error.message);
    db.close();
    process.exit(1);
}
