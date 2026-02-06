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
const createStmt = db.prepare(`
  CREATE TABLE IF NOT EXISTS test (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`);
console.log('Create statement prepared');
const createResult = createStmt.run();
console.log('Create result:', createResult);

// Insert data
const insertStmt = db.prepare('INSERT INTO test (name) VALUES (?)');
console.log('Insert statement prepared');
const insertResult = insertStmt.run('Test');
console.log('Insert result:', insertResult);

// Query data
const queryStmt = db.prepare('SELECT * FROM test');
console.log('Query statement prepared');
const result = queryStmt.all();
console.log('Query result:', result);

db.close();
console.log('Database closed');

// Check if file exists
console.log('File exists:', fs.existsSync(dbPath));
if (fs.existsSync(dbPath)) {
    console.log('File size:', fs.statSync(dbPath).size);
}
