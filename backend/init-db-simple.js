#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

console.log('\n' + '='.repeat(80));
console.log('DATABASE INITIALIZATION (Simple Direct Approach)');
console.log('='.repeat(80) + '\n');

// Delete existing database
if (fs.existsSync(dbPath)) {
    console.log('🗑️  Removing existing database...');
    fs.unlinkSync(dbPath);
}

// Create new database
console.log('📝 Creating new database...');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error creating database:', err.message);
        process.exit(1);
    }
    console.log('✅ Database created\n');
    initializeSchema();
});

function initializeSchema() {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
            console.error('❌ Error enabling foreign keys:', err.message);
            process.exit(1);
        }

        // Read schema
        console.log('📖 Reading schema file...');
        let schema = fs.readFileSync(schemaPath, 'utf-8');

        // Remove PRAGMA statements and comments
        schema = schema
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return !trimmed.startsWith('PRAGMA') && !trimmed.startsWith('--');
            })
            .join('\n');

        // Split by semicolon but keep track of context
        const statements = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < schema.length; i++) {
            const char = schema[i];
            current += char;

            // Track parentheses depth
            if (char === '(') depth++;
            if (char === ')') depth--;

            // Only split on semicolon when not inside parentheses
            if (char === ';' && depth === 0) {
                const stmt = current.trim().slice(0, -1).trim();
                if (stmt.length > 0) {
                    statements.push(stmt);
                }
                current = '';
            }
        }

        // Add any remaining
        if (current.trim().length > 0) {
            const stmt = current.trim();
            if (stmt.endsWith(';')) {
                statements.push(stmt.slice(0, -1).trim());
            } else {
                statements.push(stmt);
            }
        }

        console.log(`\n📋 Found ${statements.length} SQL statements\n`);

        // Separate tables and indexes
        const tables = statements.filter(s => s.toUpperCase().startsWith('CREATE TABLE'));
        const indexes = statements.filter(s => s.toUpperCase().startsWith('CREATE INDEX'));

        console.log(`📊 Tables: ${tables.length}, Indexes: ${indexes.length}\n`);

        // Execute tables first
        executeStatements(tables, 'TABLE', 0, () => {
            executeStatements(indexes, 'INDEX', 0, () => {
                verifyTables();
            });
        });
    });
}

function executeStatements(statements, type, index, callback) {
    if (index >= statements.length) {
        console.log(`✅ All ${statements.length} CREATE ${type} statements executed\n`);
        callback();
        return;
    }

    const statement = statements[index];

    db.run(statement, (err) => {
        if (err) {
            if (!err.message.includes('already exists')) {
                console.log(`⚠️  ${type} ${index + 1}: ${err.message.substring(0, 80)}`);
            }
        }

        if ((index + 1) % 5 === 0) {
            console.log(`✅ Created ${index + 1}/${statements.length} ${type}s`);
        }

        executeStatements(statements, type, index + 1, callback);
    });
}

function verifyTables() {
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION\n');

    db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `, (err, tables) => {
        if (err) {
            console.error('❌ Error retrieving tables:', err.message);
            db.close();
            process.exit(1);
        }

        console.log(`✅ Total tables created: ${tables.length}\n`);

        if (tables.length === 0) {
            console.log('❌ No tables were created!');
            db.close();
            process.exit(1);
        }

        console.log('Tables:');
        let completed = 0;
        tables.forEach((table, index) => {
            db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
                const count = err ? 0 : row.count;
                console.log(`  ${(index + 1).toString().padStart(2)}. ${table.name.padEnd(35)} (${count} rows)`);
                completed++;

                if (completed === tables.length) {
                    verifyIndexes();
                }
            });
        });
    });
}

function verifyIndexes() {
    db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `, (err, indexes) => {
        if (err) {
            console.error('❌ Error retrieving indexes:', err.message);
            testInsertion();
            return;
        }

        console.log(`\n✅ Total indexes created: ${indexes.length}`);
        testInsertion();
    });
}

function testInsertion() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 INSERTION TEST\n');

    db.run(
        `INSERT INTO users (name, email, role, status, password_hash) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Test User', 'test@example.com', 'user', 'active', 'hash123'],
        function (err) {
            if (err) {
                console.log(`❌ Error: ${err.message}`);
                cleanup();
                return;
            }

            console.log(`✅ Insert successful - Last ID: ${this.lastID}`);

            db.get(`SELECT * FROM users LIMIT 1`, (err, user) => {
                if (err) {
                    console.log(`❌ Error retrieving user: ${err.message}`);
                } else {
                    console.log(`✅ Retrieved user: ${user.name} (${user.email})`);
                }
                cleanup();
            });
        }
    );
}

function cleanup() {
    console.log('\n' + '='.repeat(80));
    console.log('✅ DATABASE INITIALIZATION COMPLETE\n');
    db.close();
}
