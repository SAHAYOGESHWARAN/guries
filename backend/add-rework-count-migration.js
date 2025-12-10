const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mcc_db'
});

async function addReworkCountColumn() {
    try {
        console.log('Adding rework_count column to assets table...');

        // Check if column already exists
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'assets' AND column_name = 'rework_count'
        `);

        if (checkColumn.rows.length > 0) {
            console.log('rework_count column already exists');
            return;
        }

        // Add the rework_count column
        await pool.query(`
            ALTER TABLE assets 
            ADD COLUMN rework_count INTEGER DEFAULT 0
        `);

        console.log('Successfully added rework_count column to assets table');

        // Update existing assets to have rework_count = 0
        await pool.query(`
            UPDATE assets 
            SET rework_count = 0 
            WHERE rework_count IS NULL
        `);

        console.log('Updated existing assets with rework_count = 0');

    } catch (error) {
        console.error('Error adding rework_count column:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the migration
addReworkCountColumn()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });