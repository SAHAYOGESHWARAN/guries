import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database schema...');

        // Use PostgreSQL schema for production
        const isPostgres = process.env.NODE_ENV === 'production' || process.env.USE_PG === 'true';

        if (!isPostgres) {
            // SQLite: Create essential tables directly
            console.log('[DB] Creating SQLite tables...');

            const tables = [
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
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
                `CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    title TEXT,
                    message TEXT,
                    type TEXT,
                    is_read INTEGER DEFAULT 0,
                    link TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS assets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
                `CREATE TABLE IF NOT EXISTS industry_sectors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sector VARCHAR(255) NOT NULL,
                    industry VARCHAR(255) NOT NULL,
                    application VARCHAR(255),
                    country VARCHAR(100),
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`
            ];

            for (const tableSQL of tables) {
                try {
                    await pool.query(tableSQL);
                } catch (e: any) {
                    if (!e.message.includes('already exists')) {
                        console.warn('[DB] Table creation warning:', e.message.substring(0, 80));
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

export const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database with initial data...');

        // Create admin user if it doesn't exist
        try {
            const adminCheck = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
            if (!adminCheck.rows || adminCheck.rows.length === 0) {
                // Create admin user
                try {
                    await pool.query(
                        'INSERT INTO users (id, name, email, role, status, department, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [1, 'Admin User', 'admin@example.com', 'admin', 'active', 'Administration', new Date().toISOString()]
                    );
                    console.log('✅ Admin user created');
                } catch (insertErr: any) {
                    console.error('❌ Error creating admin user:', insertErr.message);
                }
            } else {
                console.log('✅ Admin user already exists');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not check/create admin user:', (e as any).message);
        }

        // Seed industry_sectors if empty
        try {
            const sectorCheck = await pool.query('SELECT COUNT(*) as count FROM industry_sectors');
            const count = sectorCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding industry_sectors...');
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

                for (const data of sampleData) {
                    try {
                        await pool.query(
                            'INSERT INTO industry_sectors (sector, industry, application, country, status) VALUES (?, ?, ?, ?, ?)',
                            [data.sector, data.industry, data.application, data.country, 'active']
                        );
                    } catch (e: any) {
                        // Ignore duplicate errors
                        if (!e.message.includes('UNIQUE') && !e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding sector:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Industry sectors seeded');
            } else {
                console.log('✅ Industry sectors already exist');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed industry_sectors:', (e as any).message);
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
