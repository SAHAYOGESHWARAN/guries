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
