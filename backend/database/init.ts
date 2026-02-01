import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

/**
 * Initialize database schema
 * Run this once to set up all tables and indexes
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
                // Ignore "already exists" errors
                if (!error.message.includes('already exists')) {
                    console.error('Error executing statement:', error.message);
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
        const result = await pool.query('SELECT COUNT(*) as count FROM workflow_stages');
        if (result.rows[0].count > 0) {
            console.log('⏭️  Database already seeded, skipping...');
            return;
        }

        // Insert workflow stages
        await pool.query(`
            INSERT INTO workflow_stages (stage_name, stage_order, description, color, status) VALUES 
            ('Draft', 1, 'Initial draft stage', '#6B7280', 'active'),
            ('In Review', 2, 'Under review', '#F59E0B', 'active'),
            ('Approved', 3, 'Approved and ready', '#10B981', 'active'),
            ('Published', 4, 'Published and live', '#3B82F6', 'active'),
            ('Archived', 5, 'Archived content', '#9CA3AF', 'active')
        `);
        console.log('  ✅ Workflow stages seeded');

        // Insert platforms
        await pool.query(`
            INSERT INTO asset_format_master (format_name, file_extension, mime_type, description, status) VALUES 
            ('PDF', '.pdf', 'application/pdf', 'PDF Document', 'active'),
            ('DOCX', '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Word Document', 'active'),
            ('JPEG', '.jpg', 'image/jpeg', 'JPEG Image', 'active'),
            ('PNG', '.png', 'image/png', 'PNG Image', 'active'),
            ('MP4', '.mp4', 'video/mp4', 'MP4 Video', 'active'),
            ('CSV', '.csv', 'text/csv', 'CSV File', 'active'),
            ('XLSX', '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Excel Spreadsheet', 'active')
        `);
        console.log('  ✅ Asset formats seeded');

        // Insert SEO error types
        await pool.query(`
            INSERT INTO seo_error_types (error_type, category, severity, description, status) VALUES 
            ('Missing Meta Description', 'Metadata', 'High', 'Page is missing meta description tag', 'active'),
            ('Duplicate Meta Title', 'Metadata', 'High', 'Multiple pages have the same meta title', 'active'),
            ('Missing H1 Tag', 'Content', 'High', 'Page is missing H1 heading tag', 'active'),
            ('Broken Internal Link', 'Links', 'Medium', 'Internal link points to non-existent page', 'active'),
            ('Missing Alt Text', 'Images', 'Medium', 'Image is missing alt text attribute', 'active'),
            ('Slow Page Load', 'Performance', 'Medium', 'Page takes too long to load', 'active'),
            ('Mobile Not Responsive', 'Mobile', 'High', 'Page is not mobile responsive', 'active'),
            ('Missing Schema Markup', 'Schema', 'Low', 'Page is missing structured data markup', 'active')
        `);
        console.log('  ✅ SEO error types seeded');

        // Insert asset categories
        await pool.query(`
            INSERT INTO asset_category_master (brand, category_name, word_count, status) VALUES 
            ('Pubrica', 'Research Articles', 500, 'active'),
            ('Pubrica', 'Academic Writing', 300, 'active'),
            ('Pubrica', 'Publication Support', 400, 'active'),
            ('Stats work', 'Statistical Analysis', 350, 'active'),
            ('Stats work', 'Data Visualization', 250, 'active'),
            ('Stats work', 'Research Methodology', 450, 'active'),
            ('Food Research lab', 'Food Safety', 400, 'active'),
            ('Food Research lab', 'Nutritional Analysis', 350, 'active'),
            ('Food Research lab', 'Quality Testing', 300, 'active'),
            ('PhD assistance', 'Dissertation Help', 600, 'active'),
            ('PhD assistance', 'Research Guidance', 400, 'active'),
            ('PhD assistance', 'Academic Support', 350, 'active'),
            ('tutors India', 'Online Tutoring', 300, 'active'),
            ('tutors India', 'Subject Expertise', 250, 'active'),
            ('tutors India', 'Learning Resources', 400, 'active')
        `);
        console.log('  ✅ Asset categories seeded');

        // Insert asset types
        await pool.query(`
            INSERT INTO asset_type_master (brand, asset_type_name, word_count, status) VALUES 
            ('Pubrica', 'Research Paper', 800, 'active'),
            ('Pubrica', 'Review Article', 600, 'active'),
            ('Pubrica', 'Case Study', 500, 'active'),
            ('Pubrica', 'Technical Report', 700, 'active'),
            ('Stats work', 'Analysis Report', 400, 'active'),
            ('Stats work', 'Data Summary', 300, 'active'),
            ('Stats work', 'Statistical Guide', 500, 'active'),
            ('Food Research lab', 'Test Report', 350, 'active'),
            ('Food Research lab', 'Safety Analysis', 450, 'active'),
            ('Food Research lab', 'Quality Certificate', 250, 'active'),
            ('PhD assistance', 'Thesis Chapter', 1000, 'active'),
            ('PhD assistance', 'Literature Review', 800, 'active'),
            ('PhD assistance', 'Research Proposal', 600, 'active'),
            ('tutors India', 'Study Material', 400, 'active'),
            ('tutors India', 'Practice Questions', 200, 'active'),
            ('tutors India', 'Tutorial Guide', 500, 'active')
        `);
        console.log('  ✅ Asset types seeded');

        // Insert default system settings
        await pool.query(`
            INSERT INTO system_settings (setting_key, setting_value, is_enabled) VALUES 
            ('app_name', 'Marketing Control Center', true),
            ('app_version', '1.0.0', true),
            ('max_upload_size_mb', '100', true),
            ('session_timeout_minutes', '30', true),
            ('enable_notifications', 'true', true),
            ('enable_email_alerts', 'true', true)
            ON CONFLICT (setting_key) DO NOTHING
        `);
        console.log('  ✅ System settings seeded');

        console.log('✅ Database seeding completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database seeding failed:', error.message);
        throw error;
    }
};

/**
 * Drop all tables (use with caution!)
 */
export const dropAllTables = async () => {
    try {
        console.log('⚠️  Dropping all tables...');

        await pool.query(`
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO postgres;
            GRANT ALL ON SCHEMA public TO public;
        `);

        console.log('✅ All tables dropped successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Failed to drop tables:', error.message);
        throw error;
    }
};

/**
 * Reset database (drop and reinitialize)
 */
export const resetDatabase = async () => {
    try {
        console.log('🔄 Resetting database...');
        await dropAllTables();
        await initializeDatabase();
        await seedDatabase();
        console.log('✅ Database reset completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database reset failed:', error.message);
        throw error;
    }
};
