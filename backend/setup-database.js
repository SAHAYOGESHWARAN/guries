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

        // Step 3: Run schema_master.sql (consolidated schema)
        console.log('📄 Reading schema_master.sql file...');
        const schemaPath = path.join(__dirname, '..', 'schema.sql');

        if (!fs.existsSync(schemaPath)) {
            console.error('❌ schema_master.sql not found!');
            console.log('   Looking for alternative schema files...');
            const altPath = path.join(__dirname, 'schema.sql');
            if (fs.existsSync(altPath)) {
                console.log('   ✅ Found schema.sql, using it instead');
                const schemaSql = fs.readFileSync(altPath, 'utf8');
                await appPool.query(schemaSql);
            } else {
                throw new Error('No schema file found!');
            }
        } else {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            console.log('🔨 Executing schema SQL...');
            await appPool.query(schemaSql);
        }

        console.log('✅ Database schema created successfully!\n');

        // Database schema created - ready for production use

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

// Sample data insertion removed - production database ready

// Run the setup
setupDatabase();
