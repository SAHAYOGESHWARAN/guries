/**
 * Database Setup Script
 * Run this script to initialize the PostgreSQL database
 * Usage: node setup-database.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default postgres database first
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

const dbName = process.env.DB_NAME || 'mcc_db';

async function setupDatabase() {
    console.log('🚀 Starting database setup...\n');

    try {
        // Step 1: Check if database exists
        console.log(`📋 Checking if database "${dbName}" exists...`);
        const dbCheckResult = await pool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (dbCheckResult.rows.length === 0) {
            // Create database if it doesn't exist
            console.log(`📦 Creating database "${dbName}"...`);
            await pool.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database "${dbName}" created successfully!\n`);
        } else {
            console.log(`✅ Database "${dbName}" already exists.\n`);
        }

        // Close connection to postgres database
        await pool.end();

        // Step 2: Connect to the new database
        console.log(`🔌 Connecting to database "${dbName}"...`);
        const appPool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: dbName,
            password: process.env.DB_PASSWORD || 'password',
            port: parseInt(process.env.DB_PORT || '5432'),
        });

        // Step 3: Run schema.sql
        console.log('📄 Reading schema.sql file...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🔨 Executing schema SQL...');
        await appPool.query(schemaSql);
        console.log('✅ Database schema created successfully!\n');

        // Step 4: Insert sample data (optional)
        console.log('📊 Inserting sample data...');
        await insertSampleData(appPool);
        console.log('✅ Sample data inserted successfully!\n');

        // Close connection
        await appPool.end();

        console.log('🎉 Database setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Copy backend/.env.example to backend/.env');
        console.log('   2. Update .env with your database credentials');
        console.log('   3. Run: cd backend && npm install');
        console.log('   4. Run: npm run dev');
        console.log('\n✨ Happy coding!\n');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

async function insertSampleData(pool) {
    try {
        // Insert sample users
        await pool.query(`
            INSERT INTO users (name, email, phone_number, role, status) VALUES
            ('Admin User', 'admin@example.com', '+1234567890', 'Admin', 'active'),
            ('John Doe', 'john@example.com', '+1234567891', 'Content Manager', 'active'),
            ('Jane Smith', 'jane@example.com', '+1234567892', 'SEO Specialist', 'active')
            ON CONFLICT (email) DO NOTHING;
        `);
        console.log('   ✓ Sample users inserted');

        // Insert sample brands
        await pool.query(`
            INSERT INTO brands (brand_name, brand_code, website_url, industry, status) VALUES
            ('Acme Corp', 'ACME', 'https://acme.com', 'Technology', 'active'),
            ('Global Services', 'GLBL', 'https://globalservices.com', 'Consulting', 'active')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✓ Sample brands inserted');

        // Insert sample countries
        await pool.query(`
            INSERT INTO countries (country_name, code, region, has_backlinks, has_content, has_smm, status) VALUES
            ('United States', 'US', 'North America', true, true, true, 'Active'),
            ('United Kingdom', 'UK', 'Europe', true, true, true, 'Active'),
            ('Canada', 'CA', 'North America', true, true, false, 'Active'),
            ('Australia', 'AU', 'Oceania', true, true, true, 'Active'),
            ('India', 'IN', 'Asia', true, true, true, 'Active')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✓ Sample countries inserted');

        // Insert sample content types
        await pool.query(`
            INSERT INTO content_types (content_type, category, description, status) VALUES
            ('Pillar', 'Core', 'Long-form primary page', 'active'),
            ('Cluster', 'Supporting', 'Supporting topic page', 'active'),
            ('Landing', 'Conversion', 'Campaign landing page', 'active'),
            ('Blog', 'Editorial', 'Blog article', 'active'),
            ('Case Study', 'Proof', 'Customer story', 'active')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✓ Sample content types inserted');

        // Insert sample asset types
        await pool.query(`
            INSERT INTO asset_types (asset_type, category, description, status) VALUES
            ('Blog', 'Content', 'Blog post or article', 'active'),
            ('Video', 'Media', 'Video content', 'active'),
            ('PDF', 'Document', 'PDF document', 'active'),
            ('Infographic', 'Visual', 'Infographic design', 'active'),
            ('Whitepaper', 'Document', 'Technical whitepaper', 'active')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✓ Sample asset types inserted');

        // Insert sample platforms
        await pool.query(`
            INSERT INTO platforms (platform_name, platform_type, status) VALUES
            ('LinkedIn', 'Social Media', 'active'),
            ('Facebook', 'Social Media', 'active'),
            ('Twitter', 'Social Media', 'active'),
            ('Instagram', 'Social Media', 'active'),
            ('YouTube', 'Video', 'active')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✓ Sample platforms inserted');

        // Insert sample industry sectors
        await pool.query(`
            INSERT INTO industry_sectors (industry_name, description, status) VALUES
            ('Technology', 'Technology and software companies', 'active'),
            ('Healthcare', 'Healthcare and medical services', 'active'),
            ('Finance', 'Financial services and banking', 'active'),
            ('Retail', 'Retail and e-commerce', 'active'),
            ('Manufacturing', 'Manufacturing and industrial', 'active')
            ON CONFLICT DO NOTHING;
        `);
        console.log('   ✓ Sample industry sectors inserted');

    } catch (error) {
        console.error('   ⚠️  Error inserting sample data:', error.message);
        // Don't fail the entire setup if sample data fails
    }
}

// Run the setup
setupDatabase();
