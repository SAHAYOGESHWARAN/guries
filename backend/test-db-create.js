const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');

console.log('Creating database at:', dbPath);

// Delete if exists
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted existing database');
}

// Create database
const db = new Database(dbPath);
console.log('Database created');

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

db.close();
console.log('Database closed');

// Check if file exists
console.log('File exists:', fs.existsSync(dbPath));
console.log('File size:', fs.statSync(dbPath).size);
