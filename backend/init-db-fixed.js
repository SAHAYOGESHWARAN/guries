#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

console.log('\n' + '='.repeat(80));
console.log('DATABASE INITIALIZATION - FIXED ORDER');
console.log('='.repeat(80) + '\n');

// Delete existing database
if (fs.existsSync(dbPath)) {
    console.log('🗑️  Removing existing database...');
    fs.unlinkSync(dbPath);
}

// Create database
console.log('📝 Creating new database...');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error creating database:', err.message);
        process.exit(1);
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
            console.error('❌ Error enabling foreign keys:', err.message);
            process.exit(1);
        }

        // Read schema
        console.log('📖 Reading schema file...');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        // Split statements
        const allStatements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('PRAGMA'));

        // Separate CREATE TABLE and CREATE INDEX statements
        const tableStatements = allStatements.filter(stmt => {
            const upper = stmt.toUpperCase();
            return upper.includes('CREATE TABLE');
        });
        const indexStatements = allStatements.filter(stmt => {
            const upper = stmt.toUpperCase();
            return upper.includes('CREATE INDEX') && !upper.includes('CREATE TABLE');
        });
        const otherStatements = allStatements.filter(stmt => {
            const upper = stmt.toUpperCase();
            return !upper.includes('CREATE TABLE') && !upper.includes('CREATE INDEX');
        });

        console.log(`\n📋 Found ${tableStatements.length} CREATE TABLE statements`);
        console.log(`📋 Found ${indexStatements.length} CREATE INDEX statements`);
        console.log(`📋 Found ${otherStatements.length} other statements`);

        // Execute in order: tables first, then indexes, then others
        const allOrderedStatements = [...tableStatements, ...indexStatements, ...otherStatements];

        console.log(`\n📋 Executing ${allOrderedStatements.length} SQL statements in correct order...\n`);

        let successCount = 0;
        let errorCount = 0;
        let index = 0;

        const executeNext = () => {
            if (index >= allOrderedStatements.length) {
                // All statements executed
                console.log(`\n✅ Successfully executed ${successCount} statements`);
                if (errorCount > 0) {
                    console.log(`⚠️  ${errorCount} statements had errors`);
                }

                // Verify tables
                console.log('\n' + '='.repeat(80));
                console.log('📊 VERIFICATION\n');

                db.all(`
                  SELECT name FROM sqlite_master 
                  WHERE type='table' 
                  ORDER BY name
                `, (err, tables) => {
                    if (err) {
                        console.error('❌ Error querying tables:', err.message);
                        db.close();
                        process.exit(1);
                    }

                    console.log(`✅ Total tables created: ${tables.length}\n`);

                    if (tables.length > 0) {
                        console.log('Tables:');
                        let tableIndex = 0;
                        const checkNextTable = () => {
                            if (tableIndex >= tables.length) {
                                // Test insertion
                                console.log('\n' + '='.repeat(80));
                                console.log('🧪 INSERTION TEST\n');

                                db.run(`
                                  INSERT INTO users (name, email, role, status, password_hash) 
                                  VALUES (?, ?, ?, ?, ?)
                                `, ['Test User', 'test@example.com', 'user', 'active', 'hash123'], function (err) {
                                    if (err) {
                                        console.log(`❌ Error: ${err.message}`);
                                    } else {
                                        console.log(`✅ Insert successful - Last ID: ${this.lastID}`);

                                        db.get(`SELECT * FROM users LIMIT 1`, (err, user) => {
                                            if (err) {
                                                console.log(`❌ Error: ${err.message}`);
                                            } else if (user) {
                                                console.log(`✅ Retrieved user: ${user.name} (${user.email})`);
                                            } else {
                                                console.log(`⚠️  No user found after insert`);
                                            }

                                            console.log('\n' + '='.repeat(80));
                                            console.log('✅ DATABASE INITIALIZATION COMPLETE\n');

                                            db.close();
                                        });
                                    }
                                });
                                return;
                            }

                            const table = tables[tableIndex];
                            db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
                                if (err) {
                                    console.log(`  ${(tableIndex + 1).toString().padStart(2)}. ${table.name.padEnd(35)} (error reading)`);
                                } else {
                                    console.log(`  ${(tableIndex + 1).toString().padStart(2)}. ${table.name.padEnd(35)} (${row.count} rows)`);
                                }
                                tableIndex++;
                                checkNextTable();
                            });
                        };
                        checkNextTable();
                    } else {
                        console.log('⚠️  No tables found!');
                        db.close();
                    }
                });
                return;
            }

            const statement = allOrderedStatements[index];
            const isTable = statement.toUpperCase().startsWith('CREATE TABLE');
            const isIndex = statement.toUpperCase().startsWith('CREATE INDEX');

            db.run(statement, (err) => {
                if (err) {
                    errorCount++;
                    if (!err.message.includes('already exists')) {
                        console.log(`⚠️  Statement ${index + 1}: ${err.message.substring(0, 80)}`);
                    }
                } else {
                    successCount++;
                    if ((index + 1) % 10 === 0 || isTable) {
                        const type = isTable ? 'TABLE' : isIndex ? 'INDEX' : 'OTHER';
                        console.log(`✅ Executed ${index + 1}/${allOrderedStatements.length} statements (${type})`);
                    }
                }
                index++;
                executeNext();
            });
        };

        executeNext();
    });
});
