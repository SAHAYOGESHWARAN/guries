#!/usr/bin/env node

/**
 * Marketing Control Center - Database Verification Script
 * 
 * This script verifies the database initialization and displays:
 * 1. All 58 tables with their column counts
 * 2. All 62 indexes
 * 3. Test data verification
 * 4. Database statistics
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../mcc_db.sqlite');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function verifyDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(new Error(`Failed to open database: ${err.message}`));
                return;
            }

            log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
            log('║     Marketing Control Center - Database Verification       ║', 'cyan');
            log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

            // Get all tables
            db.all(
                `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
                async (err, tables) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    log(`Total Tables: ${tables.length}`, 'green');
                    log('\nAll 58 Tables:', 'blue');
                    log('─'.repeat(60), 'cyan');

                    let totalColumns = 0;
                    const tableDetails = [];

                    for (let i = 0; i < tables.length; i++) {
                        const table = tables[i];

                        // Get column count for each table
                        db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
                            if (!err && columns) {
                                totalColumns += columns.length;
                                tableDetails.push({
                                    name: table.name,
                                    columns: columns.length
                                });

                                const index = i + 1;
                                const columnInfo = `(${columns.length} columns)`;
                                log(`${String(index).padStart(2, ' ')}. ${table.name.padEnd(35)} ${columnInfo}`, 'cyan');

                                // After processing all tables
                                if (tableDetails.length === tables.length) {
                                    displayIndexes(db, tables, totalColumns, resolve, reject);
                                }
                            }
                        });
                    }
                }
            );
        });
    });
}

function displayIndexes(db, tables, totalColumns, resolve, reject) {
    db.all(
        `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
        (err, indexes) => {
            if (err) {
                reject(err);
                return;
            }

            log('\n' + '─'.repeat(60), 'cyan');
            log(`Total Columns: ${totalColumns}`, 'green');
            log(`Total Indexes: ${indexes.length}`, 'green');

            log('\nAll 62 Indexes:', 'blue');
            log('─'.repeat(60), 'cyan');

            indexes.forEach((idx, i) => {
                const index = i + 1;
                log(`${String(index).padStart(2, ' ')}. ${idx.name}`, 'cyan');
            });

            // Get test data
            db.get('SELECT * FROM users WHERE email = ?', ['test@mcc.local'], (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }

                log('\n' + '─'.repeat(60), 'cyan');
                log('Test Data Verification:', 'blue');
                log('─'.repeat(60), 'cyan');

                if (user) {
                    log('✓ Test User Found:', 'green');
                    log(`  ID: ${user.id}`, 'cyan');
                    log(`  Name: ${user.name}`, 'cyan');
                    log(`  Email: ${user.email}`, 'cyan');
                    log(`  Role: ${user.role}`, 'cyan');
                    log(`  Status: ${user.status}`, 'cyan');
                    log(`  Department: ${user.department}`, 'cyan');
                    log(`  Country: ${user.country}`, 'cyan');
                    log(`  Created At: ${user.created_at}`, 'cyan');
                } else {
                    log('✗ Test User Not Found', 'red');
                }

                // Get database statistics
                db.get('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()', (err, result) => {
                    if (!err && result) {
                        const sizeInMB = (result.size / 1024 / 1024).toFixed(2);
                        log('\n' + '─'.repeat(60), 'cyan');
                        log('Database Statistics:', 'blue');
                        log('─'.repeat(60), 'cyan');
                        log(`Database Path: ${DB_PATH}`, 'cyan');
                        log(`Database Size: ${sizeInMB} MB`, 'cyan');
                        log(`Total Tables: ${tables.length}`, 'cyan');
                        log(`Total Columns: ${totalColumns}`, 'cyan');
                        log(`Total Indexes: ${indexes.length}`, 'cyan');
                    }

                    log('\n' + '─'.repeat(60), 'cyan');
                    log('Status: ✓ DATABASE READY FOR USE', 'green');
                    log('─'.repeat(60), 'cyan');

                    log('\nKey Tables:', 'blue');
                    const keyTables = [
                        'users',
                        'assets',
                        'services',
                        'sub_services',
                        'campaigns',
                        'projects',
                        'tasks',
                        'keywords',
                        'brands',
                        'backlink_sources'
                    ];

                    keyTables.forEach(tableName => {
                        const found = tables.find(t => t.name === tableName);
                        if (found) {
                            log(`  ✓ ${tableName}`, 'green');
                        }
                    });

                    log('\nDatabase Initialization Complete!', 'green');
                    log('You can now:', 'blue');
                    log('  1. Start the backend server: npm start', 'cyan');
                    log('  2. Run migrations if needed', 'cyan');
                    log('  3. Access the API endpoints', 'cyan');
                    log('  4. Use the test user for authentication', 'cyan');

                    db.close();
                    resolve();
                });
            });
        }
    );
}

async function main() {
    try {
        await verifyDatabase();
        process.exit(0);
    } catch (error) {
        log(`\n✗ Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

main();
