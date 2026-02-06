#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

console.log('\n' + '='.repeat(80));
console.log('DATABASE INITIALIZATION - DEBUG');
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

// Create new database
console.log('📝 Creating new database...');
const db = new Database(dbPath);
console.log('✅ Database created at:', dbPath);
console.log('✅ Database file exists:', fs.existsSync(dbPath));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read schema
console.log('\n📖 Reading schema file...');
const schema = fs.readFileSync(schemaPath, 'utf-8');
console.log('✅ Schema file read, length:', schema.length);

// Split and execute statements
const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('PRAGMA'));

console.log(`\n📋 Found ${statements.length} SQL statements`);
console.log('\nFirst 3 statements:');
statements.slice(0, 3).forEach((stmt, i) => {
    console.log(`  ${i + 1}. ${stmt.substring(0, 60)}...`);
});

console.log(`\n📋 Executing ${statements.length} SQL statements...\n`);

let successCount = 0;
let errorCount = 0;
const errors = [];

statements.forEach((statement, index) => {
    try {
        db.prepare(statement).run();
        successCount++;
        if ((index + 1) % 10 === 0) {
            console.log(`✅ Executed ${index + 1}/${statements.length} statements`);
        }
    } catch (error) {
        errorCount++;
        errors.push({ index: index + 1, error: error.message });
        if (!error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${index + 1}: ${error.message.substring(0, 80)}`);
        }
    }
});

console.log(`\n✅ Successfully executed ${successCount} statements`);
if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} statements had errors`);
    console.log('\nFirst 5 errors:');
    errors.slice(0, 5).forEach(e => {
        console.log(`  Statement ${e.index}: ${e.error}`);
    });
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
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`  ${(index + 1).toString().padStart(2)}. ${table.name.padEnd(35)} (${count.count} rows)`);
    });
} else {
    console.log('⚠️  No tables found!');
}

db.close();
console.log('\n' + '='.repeat(80));
console.log('✅ DATABASE INITIALIZATION COMPLETE\n');
