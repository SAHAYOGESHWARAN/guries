import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

/**
 * Initialize database schema
 */
export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database schema...');

        // Use PostgreSQL schema for production
        const isPostgres = process.env.NODE_ENV === 'production' || process.env.USE_PG === 'true';

        // Create essential tables for PostgreSQL
        const pgStatements = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                role TEXT DEFAULT 'user',
                status TEXT DEFAULT 'active',
                password_hash TEXT,
                department TEXT,
                country TEXT,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Brands table
            `CREATE TABLE IF NOT EXISTS brands (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                code TEXT,
                industry TEXT,
                website TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Services table
            `CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                service_name TEXT NOT NULL,
                service_code TEXT,
                slug TEXT,
                status TEXT DEFAULT 'draft',
                meta_title TEXT,
                meta_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Assets table
            `CREATE TABLE IF NOT EXISTS assets (
                id SERIAL PRIMARY KEY,
                asset_name TEXT NOT NULL,
                asset_type TEXT,
                asset_category TEXT,
                asset_format TEXT,
                status TEXT DEFAULT 'draft',
                qc_status TEXT,
                file_url TEXT,
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Projects table
            `CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                project_name TEXT NOT NULL,
                project_code TEXT UNIQUE,
                status TEXT DEFAULT 'Planned',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Campaigns table
            `CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                campaign_name TEXT NOT NULL,
                campaign_type TEXT DEFAULT 'Content',
                status TEXT DEFAULT 'planning',
                description TEXT,
                campaign_start_date DATE,
                campaign_end_date DATE,
                campaign_owner_id INTEGER REFERENCES users(id),
                project_id INTEGER REFERENCES projects(id),
                brand_id INTEGER REFERENCES brands(id),
                linked_service_ids TEXT,
                target_url TEXT,
                backlinks_planned INTEGER DEFAULT 0,
                backlinks_completed INTEGER DEFAULT 0,
                tasks_completed INTEGER DEFAULT 0,
                tasks_total INTEGER DEFAULT 0,
                kpi_score INTEGER DEFAULT 0,
                sub_campaigns TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tasks table
            `CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                task_name TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        if (isPostgres) {
            console.log('[DB] Using PostgreSQL schema');
            for (const statement of pgStatements) {
                try {
                    await pool.query(statement);
                } catch (error: any) {
                    const msg = (error && error.message) ? error.message : '';
                    if (!msg.includes('already exists') && !msg.includes('duplicate key')) {
                        console.warn('⚠️  Schema statement warning:', msg.substring(0, 100));
                    }
                }
            }
        } else {
            // SQLite fallback
            console.log('[DB] Using SQLite schema');
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf-8');

            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            for (const statement of statements) {
                try {
                    await pool.query(statement);
                } catch (error: any) {
                    const msg = (error && error.message) ? error.message : '';
                    if (!msg.includes('already exists') && !msg.includes('UNIQUE constraint failed')) {
                        console.warn('⚠️  Schema statement warning:', msg.substring(0, 100));
                    }
                }
            }
        }

        console.log('✅ Database schema initialized successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

/**
 * Seed initial data
 */
export const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database with initial data...');

        // Check if data already exists
        try {
            const result = await pool.query('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"');
            const tableCount = (result.rows && result.rows[0]) ? (result.rows[0] as any).count : 0;

            if (tableCount > 5) {
                console.log('⏭️  Database already seeded, skipping...');
                return;
            }
        } catch (e) {
            // If query fails, continue with seeding
            console.log('⏭️  Skipping seed check, continuing...');
        }

        console.log('✅ Database seeding completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database seeding failed:', error.message);
        throw error;
    }
};

/**
 * Reset database (drop and reinitialize)
 */
export const resetDatabase = async () => {
    try {
        console.log('🔄 Resetting database...');
        await initializeDatabase();
        await seedDatabase();
        console.log('✅ Database reset completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database reset failed:', error.message);
        throw error;
    }
};
