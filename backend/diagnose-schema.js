#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('\n' + '='.repeat(80));
console.log('DATABASE SCHEMA DIAGNOSTIC');
console.log('='.repeat(80) + '\n');

// Get all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log(`📊 Total Tables: ${tables.length}\n`);

// Show first 5 tables with their schema
tables.slice(0, 5).forEach(table => {
    console.log(`\n📋 Table: ${table.name}`);
    console.log('-'.repeat(60));

    try {
        const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
        console.log(`Columns: ${columns.length}`);
        columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
});

// Check if data can be inserted
console.log('\n' + '='.repeat(80));
console.log('🧪 INSERTION TEST\n');

try {
    const result = db.prepare(`
    INSERT INTO users (name, email, role, status, password_hash) 
    VALUES (?, ?, ?, ?, ?)
  `).run('Test', 'test@test.com', 'user', 'active', 'hash');

    console.log(`✅ Insert successful - Last ID: ${result.lastInsertRowid}`);

    // Try to retrieve
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid);
    console.log(`✅ Retrieved: ${JSON.stringify(user)}`);
} catch (e) {
    console.log(`❌ Error: ${e.message}`);
}

console.log('\n' + '='.repeat(80) + '\n');
