#!/usr/bin/env node

/**
 * Marketing Control Center - Database Initialization Script
 * 
 * This script:
 * 1. Reads the schema.sql file
 * 2. Properly parses multi-line CREATE TABLE statements
 * 3. Creates the SQLite database with all 58 tables
 * 4. Creates all indexes
 * 5. Inserts test data
 * 6. Verifies the database is ready
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuration
const DB_PATH = path.join(__dirname, '../mcc_db.sqlite');
const SCHEMA_PATH = path.join(__dirname, '../database/schema.sql');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseSQL(sqlContent) {
    /**
     * Parse SQL file and extract individual statements
     * Handles multi-line CREATE TABLE statements properly
     */
    const statements = [];
    let currentStatement = '';
    let inStatement = false;
    let parenDepth = 0;

    const lines = sqlContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Skip empty lines and comments
        if (!line || line.startsWith('--')) {
            continue;
        }

        // Track parentheses depth for multi-line statements
        for (let char of line) {
            if (char === '(') parenDepth++;
            if (char === ')') parenDepth--;
        }

        currentStatement += (currentStatement ? ' ' : '') + line;

        // Check if statement is complete (ends with semicolon and all parens closed)
        if (line.endsWith(';') && parenDepth === 0) {
            statements.push(currentStatement);
            currentStatement = '';
            inStatement = false;
        } else if (parenDepth > 0 || (currentStatement && !line.endsWith(';'))) {
            inStatement = true;
        }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
        statements.push(currentStatement);
    }

    return statements;
}

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Remove existing database if it exists
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
            log(`Removed existing database at ${DB_PATH}`, 'yellow');
        }

        // Create new database
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(new Error(`Failed to create database: ${err.message}`));
                return;
            }
            log(`✓ Database created at ${DB_PATH}`, 'green');
            resolve(db);
        });
    });
}

function readSchema() {
    return new Promise((resolve, reject) => {
        fs.readFile(SCHEMA_PATH, 'utf8', (err, data) => {
            if (err) {
                reject(new Error(`Failed to read schema file: ${err.message}`));
                return;
            }
            log(`✓ Schema file read (${data.length} bytes)`, 'green');
            resolve(data);
        });
    });
}

function executeStatements(db, statements) {
    return new Promise((resolve, reject) => {
        let completed = 0;
        let tableCount = 0;
        let indexCount = 0;
        const errors = [];

        const executeNext = (index) => {
            if (index >= statements.length) {
                if (errors.length > 0) {
                    log(`\n⚠ Completed with ${errors.length} errors:`, 'yellow');
                    errors.forEach(err => log(`  - ${err}`, 'red'));
                }
                resolve({ tableCount, indexCount, errors });
                return;
            }

            const statement = statements[index].trim();

            if (!statement) {
                executeNext(index + 1);
                return;
            }

            // Count tables and indexes
            if (statement.toUpperCase().includes('CREATE TABLE')) {
                tableCount++;
            } else if (statement.toUpperCase().includes('CREATE INDEX')) {
                indexCount++;
            }

            db.run(statement, (err) => {
                if (err) {
                    errors.push(`Statement ${index + 1}: ${err.message}`);
                    log(`✗ Error executing statement ${index + 1}`, 'red');
                } else {
                    completed++;
                    if (completed % 10 === 0) {
                        log(`  Executed ${completed}/${statements.length} statements...`, 'cyan');
                    }
                }
                executeNext(index + 1);
            });
        };

        executeNext(0);
    });
}

function insertTestData(db) {
    return new Promise((resolve, reject) => {
        const testUser = {
            name: 'Test User',
            email: 'test@mcc.local',
            role: 'admin',
            status: 'active',
            password_hash: 'hashed_password_123',
            department: 'Marketing',
            country: 'US'
        };

        const sql = `
      INSERT INTO users (name, email, role, status, password_hash, department, country)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        db.run(
            sql,
            [
                testUser.name,
                testUser.email,
                testUser.role,
                testUser.status,
                testUser.password_hash,
                testUser.department,
                testUser.country
            ],
            function (err) {
                if (err) {
                    reject(new Error(`Failed to insert test user: ${err.message}`));
                    return;
                }
                log(`✓ Test user inserted with ID: ${this.lastID}`, 'green');
                resolve(this.lastID);
            }
        );
    });
}

function verifyDatabase(db) {
    return new Promise((resolve, reject) => {
        // Get all tables
        const sql = `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;

        db.all(sql, (err, tables) => {
            if (err) {
                reject(new Error(`Failed to verify tables: ${err.message}`));
                return;
            }

            // Get all indexes
            const indexSql = `
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `;

            db.all(indexSql, (err, indexes) => {
                if (err) {
                    reject(new Error(`Failed to verify indexes: ${err.message}`));
                    return;
                }

                resolve({ tables, indexes });
            });
        });
    });
}

function verifyTestData(db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', ['test@mcc.local'], (err, row) => {
            if (err) {
                reject(new Error(`Failed to verify test data: ${err.message}`));
                return;
            }
            resolve(row);
        });
    });
}

async function main() {
    try {
        log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
        log('║  Marketing Control Center - Database Initialization        ║', 'cyan');
        log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

        // Step 1: Initialize database
        log('Step 1: Initializing database...', 'blue');
        const db = await initializeDatabase();

        // Step 2: Read schema
        log('\nStep 2: Reading schema file...', 'blue');
        const schemaContent = await readSchema();

        // Step 3: Parse SQL statements
        log('\nStep 3: Parsing SQL statements...', 'blue');
        const statements = parseSQL(schemaContent);
        log(`✓ Parsed ${statements.length} SQL statements`, 'green');

        // Step 4: Execute statements
        log('\nStep 4: Executing SQL statements...', 'blue');
        const { tableCount, indexCount, errors } = await executeStatements(db, statements);
        log(`✓ Created ${tableCount} tables`, 'green');
        log(`✓ Created ${indexCount} indexes`, 'green');

        // Step 5: Insert test data
        log('\nStep 5: Inserting test data...', 'blue');
        const userId = await insertTestData(db);

        // Step 6: Verify database
        log('\nStep 6: Verifying database...', 'blue');
        const { tables, indexes } = await verifyDatabase(db);
        log(`✓ Database contains ${tables.length} tables`, 'green');
        log(`✓ Database contains ${indexes.length} indexes`, 'green');

        // Step 7: Verify test data
        log('\nStep 7: Verifying test data...', 'blue');
        const testUser = await verifyTestData(db);
        if (testUser) {
            log(`✓ Test user verified:`, 'green');
            log(`  - ID: ${testUser.id}`, 'green');
            log(`  - Email: ${testUser.email}`, 'green');
            log(`  - Role: ${testUser.role}`, 'green');
        }

        // Display results
        log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
        log('║                    INITIALIZATION COMPLETE                 ║', 'cyan');
        log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

        log('Database Summary:', 'blue');
        log(`  Database Path: ${DB_PATH}`, 'cyan');
        log(`  Total Tables: ${tableCount}`, 'cyan');
        log(`  Total Indexes: ${indexCount}`, 'cyan');
        log(`  Test User ID: ${userId}`, 'cyan');

        log('\nFirst 20 Tables:', 'blue');
        tables.slice(0, 20).forEach((table, index) => {
            log(`  ${index + 1}. ${table.name}`, 'cyan');
        });

        if (tables.length > 20) {
            log(`  ... and ${tables.length - 20} more tables`, 'yellow');
        }

        log('\nDatabase Status: ✓ READY FOR USE', 'green');
        log('\nNext Steps:', 'blue');
        log('  1. Start the backend server: npm start', 'cyan');
        log('  2. Access the API at http://localhost:3000', 'cyan');
        log('  3. Use the test user credentials:', 'cyan');
        log('     Email: test@mcc.local', 'cyan');
        log('     Password: (set in your auth system)', 'cyan');

        // Close database
        db.close((err) => {
            if (err) {
                log(`\nWarning: Error closing database: ${err.message}`, 'yellow');
            } else {
                log('\n✓ Database connection closed', 'green');
            }
            process.exit(0);
        });

    } catch (error) {
        log(`\n✗ Error: ${error.message}`, 'red');
        log('\nStack trace:', 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the initialization
main();
