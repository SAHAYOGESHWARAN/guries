/**
 * Migration: Add dimensions, file_size, file_formats columns to asset_type_master table
 * Also add updated_by column to assets table
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

async function runMigration() {
    console.log('Starting asset_type_master columns migration...');
    console.log('Database path:', dbPath);

    try {
        const db = new Database(dbPath);

        // Check asset_type_master table
        const assetTypeInfo = db.pragma('table_info(asset_type_master)');

        // Add dimensions column if not exists
        if (!assetTypeInfo.some(col => col.name === 'dimensions')) {
            db.exec(`ALTER TABLE asset_type_master ADD COLUMN dimensions VARCHAR(100)`);
            console.log('Added dimensions column to asset_type_master table.');
        } else {
            console.log('dimensions column already exists.');
        }

        // Add file_size column if not exists
        if (!assetTypeInfo.some(col => col.name === 'file_size')) {
            db.exec(`ALTER TABLE asset_type_master ADD COLUMN file_size VARCHAR(50)`);
            console.log('Added file_size column to asset_type_master table.');
        } else {
            console.log('file_size column already exists.');
        }

        // Add file_formats column if not exists
        if (!assetTypeInfo.some(col => col.name === 'file_formats')) {
            db.exec(`ALTER TABLE asset_type_master ADD COLUMN file_formats VARCHAR(255)`);
            console.log('Added file_formats column to asset_type_master table.');
        } else {
            console.log('file_formats column already exists.');
        }

        // Check assets table for updated_by and dimensions
        const assetsInfo = db.pragma('table_info(assets)');

        // Add updated_by column if not exists
        if (!assetsInfo.some(col => col.name === 'updated_by')) {
            db.exec(`ALTER TABLE assets ADD COLUMN updated_by INTEGER`);
            console.log('Added updated_by column to assets table.');
        } else {
            console.log('updated_by column already exists in assets table.');
        }

        // Add dimensions column to assets if not exists
        if (!assetsInfo.some(col => col.name === 'dimensions')) {
            db.exec(`ALTER TABLE assets ADD COLUMN dimensions VARCHAR(100)`);
            console.log('Added dimensions column to assets table.');
        } else {
            console.log('dimensions column already exists in assets table.');
        }

        db.close();

    } catch (error) {
        console.error('Migration failed:', error.message);
        throw error;
    }
}

runMigration()
    .then(() => {
        console.log('Migration completed successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
