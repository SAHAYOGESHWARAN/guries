#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

console.log('\n' + '='.repeat(80));
console.log('DATABASE INITIALIZATION - DIRECT APPROACH');
console.log('='.repeat(80) + '\n');

console.log('Paths:');
console.log('  DB Path:', dbPath);
console.log('  Schema Path:', schemaPath);
console.log('  Schema exists:', fs.existsSync(schemaPath));

// Delete existing database
if (fs.existsSync(dbPath)) {
    console.log('\n🗑️  Removing existing database...');
    fs.unlinkSync(dbPath);
}

// Create database
console.log('📝 Creating new database...');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Read schema
console.log('📖 Reading schema file...');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Split and execute statements
const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('PRAGMA'));

console.log(`\n📋 Found ${statements.length} SQL statements`);
console.log(`\n📋 Executing SQL statements...\n`);

let successCount = 0;
let errorCount = 0;

statements.forEach((statement, index) => {
    try {
        const stmt = db.prepare(statement);
        const result = stmt.run();
        successCount++;
        if ((index + 1) % 10 === 0) {
            console.log(`✅ Executed ${index + 1}/${statements.length} statements`);
        }
    } catch (error) {
        errorCount++;
        if (!error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${index + 1}: ${error.message.substring(0, 80)}`);
        }
    }
});

console.log(`\n✅ Successfully executed ${successCount} statements`);
if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} statements had errors (mostly "already exists")`);
}

// Verify tables
console.log('\n' + '='.repeat(80));
console.log('📊 VERIFICATION\n');

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log(`✅ Total tables created: ${tables.length}\n`);

if (tables.length > 0) {
    console.log('Tables:');
    tables.forEach((table, index) => {
        try {
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
            console.log(`  ${(index + 1).toString().padStart(2)}. ${table.name.padEnd(35)} (${count.count} rows)`);
        } catch (e) {
            console.log(`  ${(index + 1).toString().padStart(2)}. ${table.name.padEnd(35)} (error reading)`);
        }
    });
} else {
    console.log('⚠️  No tables found!');
}

// Test insertion
console.log('\n' + '='.repeat(80));
console.log('🧪 INSERTION TEST\n');

try {
    const result = db.prepare(`
    INSERT INTO users (name, email, role, status, password_hash) 
    VALUES (?, ?, ?, ?, ?)
  `).run('Test User', 'test@example.com', 'user', 'active', 'hash123');

    console.log(`✅ Insert successful - Last ID: ${result.lastInsertRowid}`);

    const user = db.prepare(`SELECT * FROM users LIMIT 1`).get();
    if (user) {
        console.log(`✅ Retrieved user: ${user.name} (${user.email})`);
    } else {
        console.log(`⚠️  No user found after insert`);
    }
} catch (e) {
    console.log(`❌ Error: ${e.message}`);
}

// Close database
db.close();

console.log('\n' + '='.repeat(80));
console.log('✅ DATABASE INITIALIZATION COMPLETE\n');

// Verify file exists
setTimeout(() => {
    console.log('File verification:');
    console.log('  mcc_db.sqlite exists:', fs.existsSync(dbPath));
    if (fs.existsSync(dbPath)) {
        console.log('  mcc_db.sqlite size:', fs.statSync(dbPath).size, 'bytes');
    }
}, 100);
