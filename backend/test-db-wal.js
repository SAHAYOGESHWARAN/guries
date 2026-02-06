const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

console.log('Creating database at:', dbPath);

// Delete if exists
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted existing database');
}

// Create database with WAL mode
const db = new Database(dbPath);
console.log('Database created');

// Set WAL mode
db.pragma('journal_mode = WAL');
console.log('WAL mode set');

// Create a simple table
db.prepare(`
  CREATE TABLE IF NOT EXISTS test (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`).run();
console.log('Table created');

// Insert data
db.prepare('INSERT INTO test (name) VALUES (?)').run('Test');
console.log('Data inserted');

// Query data
const result = db.prepare('SELECT * FROM test').all();
console.log('Query result:', result);

// Close database
db.close();
console.log('Database closed');

// Check if file exists
setTimeout(() => {
    console.log('\nFile check:');
    console.log('  mcc_db.sqlite exists:', fs.existsSync(dbPath));
    console.log('  mcc_db.sqlite-wal exists:', fs.existsSync(dbPath + '-wal'));
    console.log('  mcc_db.sqlite-shm exists:', fs.existsSync(dbPath + '-shm'));

    if (fs.existsSync(dbPath)) {
        console.log('  mcc_db.sqlite size:', fs.statSync(dbPath).size);
    }
}, 100);
