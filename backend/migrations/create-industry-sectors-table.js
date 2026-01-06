/**
 * Migration: Create industry_sectors table for SEO Asset Classification
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating industry_sectors table...');

try {
    // Create industry_sectors table
    db.exec(`
        CREATE TABLE IF NOT EXISTS industry_sectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sector VARCHAR(255) NOT NULL,
            industry VARCHAR(255) NOT NULL,
            application VARCHAR(255),
            country VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Industry sectors table created');

    // Check if table has data
    const count = db.prepare('SELECT COUNT(*) as count FROM industry_sectors').get();

    if (count.count === 0) {
        // Seed sample data
        const sampleData = [
            // Healthcare Sector
            { sector: 'Healthcare', industry: 'Pharmaceuticals', application: 'Medical Research', country: 'Global' },
            { sector: 'Healthcare', industry: 'Medical Devices', application: 'Clinical Trials', country: 'Global' },
            { sector: 'Healthcare', industry: 'Biotechnology', application: 'Drug Development', country: 'Global' },
            { sector: 'Healthcare', industry: 'Hospitals', application: 'Patient Care', country: 'Global' },
            { sector: 'Healthcare', industry: 'Telemedicine', application: 'Remote Healthcare', country: 'Global' },

            // Finance Sector
            { sector: 'Finance', industry: 'Banking', application: 'Financial Services', country: 'Global' },
            { sector: 'Finance', industry: 'Insurance', application: 'Risk Management', country: 'Global' },
            { sector: 'Finance', industry: 'Investment', application: 'Asset Management', country: 'Global' },
            { sector: 'Finance', industry: 'Fintech', application: 'Digital Payments', country: 'Global' },

            // Technology Sector
            { sector: 'Technology', industry: 'Software', application: 'Enterprise Solutions', country: 'Global' },
            { sector: 'Technology', industry: 'Hardware', application: 'Computing Devices', country: 'Global' },
            { sector: 'Technology', industry: 'Cloud Services', application: 'Infrastructure', country: 'Global' },
            { sector: 'Technology', industry: 'Cybersecurity', application: 'Data Protection', country: 'Global' },
            { sector: 'Technology', industry: 'AI/ML', application: 'Automation', country: 'Global' },

            // Education Sector
            { sector: 'Education', industry: 'Higher Education', application: 'Academic Research', country: 'Global' },
            { sector: 'Education', industry: 'E-Learning', application: 'Online Courses', country: 'Global' },
            { sector: 'Education', industry: 'EdTech', application: 'Learning Platforms', country: 'Global' },

            // Manufacturing Sector
            { sector: 'Manufacturing', industry: 'Automotive', application: 'Vehicle Production', country: 'Global' },
            { sector: 'Manufacturing', industry: 'Electronics', application: 'Consumer Electronics', country: 'Global' },
            { sector: 'Manufacturing', industry: 'Aerospace', application: 'Aviation', country: 'Global' },

            // Retail Sector
            { sector: 'Retail', industry: 'E-commerce', application: 'Online Shopping', country: 'Global' },
            { sector: 'Retail', industry: 'Fashion', application: 'Apparel', country: 'Global' },
            { sector: 'Retail', industry: 'Consumer Goods', application: 'FMCG', country: 'Global' },

            // Energy Sector
            { sector: 'Energy', industry: 'Oil & Gas', application: 'Exploration', country: 'Global' },
            { sector: 'Energy', industry: 'Renewable Energy', application: 'Solar/Wind', country: 'Global' },
            { sector: 'Energy', industry: 'Utilities', application: 'Power Distribution', country: 'Global' }
        ];

        const stmt = db.prepare(`
            INSERT INTO industry_sectors (sector, industry, application, country, status)
            VALUES (?, ?, ?, ?, 'active')
        `);

        for (const item of sampleData) {
            stmt.run(item.sector, item.industry, item.application, item.country);
        }
        console.log(`✅ Seeded ${sampleData.length} industry-sector records`);
    } else {
        console.log(`⏭️  Industry sectors table already has ${count.count} records`);
    }

} catch (err) {
    console.error('❌ Error:', err.message);
}

db.close();
console.log('Migration complete');
