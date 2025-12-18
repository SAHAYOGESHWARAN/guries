const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

try {
    // Read and execute asset category master migration
    const categoryMigration = fs.readFileSync(path.join(__dirname, 'migrations/create-asset-category-master-table.sql'), 'utf8');
    console.log('Running asset category master migration...');
    db.exec(categoryMigration);
    console.log('Asset category master table created successfully');

    // Read and execute asset type master migration
    const typeMigration = fs.readFileSync(path.join(__dirname, 'migrations/create-asset-type-master-table.sql'), 'utf8');
    console.log('Running asset type master migration...');
    db.exec(typeMigration);
    console.log('Asset type master table created successfully');

    console.log('All migrations completed successfully');
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}