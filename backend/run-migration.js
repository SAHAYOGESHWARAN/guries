const fs = require('fs');
const path = require('path');

// Read the migration file
const migration = fs.readFileSync(path.join(__dirname, 'migrations/add-static-service-linking.sql'), 'utf8');

console.log('Migration loaded successfully');
console.log('Migration content length:', migration.length);

// Write to a temporary SQL file for manual execution
fs.writeFileSync(path.join(__dirname, 'temp_migration.sql'), migration);

console.log('Migration file written to temp_migration.sql');
console.log('Please run this SQL file against your database manually or use your preferred SQLite client.');
