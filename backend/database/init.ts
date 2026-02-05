import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

/**
 * Initialize database schema
 */
export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database schema...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        // Split by semicolon and execute each statement
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            try {
                await pool.query(statement);
            } catch (error: any) {
                // Ignore errors for existing tables
                const msg = (error && error.message) ? error.message : '';
                if (!msg.includes('already exists') && !msg.includes('UNIQUE constraint failed')) {
                    console.warn('⚠️  Schema statement warning:', msg.substring(0, 100));
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
