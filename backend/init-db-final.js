#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

console.log('\n' + '='.repeat(80));
console.log('DATABASE INITIALIZATION (Final)');
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
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        // Parse SQL statements properly
        const { tables, indexes } = parseSqlStatements(schema);

        console.log(`\n📋 Found ${tables.length} CREATE TABLE statements`);
        console.log(`📋 Found ${indexes.length} CREATE INDEX statements\n`);

        // Execute tables first, then indexes
        executeTableStatements(tables, 0, () => {
            executeIndexStatements(indexes, 0, () => {
                verifyTables();
            });
        });
    });
}

function parseSqlStatements(sql) {
    const tables = [];
    const indexes = [];
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];

        // Handle string literals
        if ((char === '"' || char === "'") && (i === 0 || sql[i - 1] !== '\\')) {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
        }

        current += char;

        // Check for statement end
        if (char === ';' && !inString) {
            const stmt = current.trim();
            if (stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('PRAGMA')) {
                const cleanStmt = stmt.slice(0, -1).trim();

                if (cleanStmt.toUpperCase().startsWith('CREATE TABLE')) {
                    tables.push(cleanStmt);
                } else if (cleanStmt.toUpperCase().startsWith('CREATE INDEX')) {
                    indexes.push(cleanStmt);
                }
            }
            current = '';
        }
    }

    // Add any remaining statement
    const stmt = current.trim();
    if (stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('PRAGMA')) {
        const cleanStmt = stmt.slice(0, -1).trim();

        if (cleanStmt.toUpperCase().startsWith('CREATE TABLE')) {
            tables.push(cleanStmt);
        } else if (cleanStmt.toUpperCase().startsWith('CREATE INDEX')) {
            indexes.push(cleanStmt);
        }
    }

    return { tables, indexes };
}

function executeTableStatements(statements, index, callback) {
    if (index >= statements.length) {
        console.log(`✅ All ${statements.length} CREATE TABLE statements executed\n`);
        callback();
        return;
    }

    const statement = statements[index];

    db.run(statement, (err) => {
        if (err) {
            if (!err.message.includes('already exists')) {
                console.log(`⚠️  Table ${index + 1}: ${err.message.substring(0, 80)}`);
            }
        }

        if ((index + 1) % 5 === 0) {
            console.log(`✅ Created ${index + 1}/${statements.length} tables`);
        }

        executeTableStatements(statements, index + 1, callback);
    });
}

function executeIndexStatements(statements, index, callback) {
    if (index >= statements.length) {
        console.log(`✅ All ${statements.length} CREATE INDEX statements executed\n`);
        callback();
        return;
    }

    const statement = statements[index];

    db.run(statement, (err) => {
        if (err) {
            if (!err.message.includes('already exists')) {
                console.log(`⚠️  Index ${index + 1}: ${err.message.substring(0, 80)}`);
            }
        }

        if ((index + 1) % 10 === 0) {
            console.log(`✅ Created ${index + 1}/${statements.length} indexes`);
        }

        executeIndexStatements(statements, index + 1, callback);
    });
}

function verifyTables() {
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION\n');

    db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
    `, (err, tables) => {
        if (err) {
            console.error('❌ Error retrieving tables:', err.message);
            db.close();
            process.exit(1);
        }

        console.log(`✅ Total tables created: ${tables.length}\n`);
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
