#!/usr/bin/env node

/**
 * Database Schema Verification Script
 * 
 * Verifies that the database schema has all required columns
 * for projects and tasks tables
 */

const { Pool } = require('pg');
require('dotenv').config();

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log(`\n${'='.repeat(70)}`, 'cyan');
    log(`  ${title}`, 'cyan');
    log(`${'='.repeat(70)}\n`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Expected columns for each table
const EXPECTED_COLUMNS = {
    projects: [
        'id', 'project_name', 'project_code', 'description', 'status',
        'start_date', 'end_date', 'budget', 'owner_id', 'brand_id',
        'linked_service_id', 'priority', 'sub_services', 'outcome_kpis',
        'expected_outcome', 'team_members', 'weekly_report', 'created_at', 'updated_at'
    ],
    tasks: [
        'id', 'task_name', 'description', 'status', 'priority',
        'assigned_to', 'project_id', 'campaign_id', 'due_date',
        'campaign_type', 'sub_campaign', 'progress_stage', 'qc_stage',
        'estimated_hours', 'tags', 'repo_links', 'rework_count',
        'repo_link_count', 'created_at', 'updated_at'
    ]
};

async function verifySchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        logSection('🔍 DATABASE SCHEMA VERIFICATION');

        // Test connection
        logInfo('Testing database connection...');
        const result = await pool.query('SELECT NOW()');
        logSuccess('Connected to database');
        logInfo(`Timestamp: ${result.rows[0].now}`);

        // Verify each table
        for (const [tableName, expectedColumns] of Object.entries(EXPECTED_COLUMNS)) {
            await verifyTable(pool, tableName, expectedColumns);
        }

        logSection('📊 VERIFICATION SUMMARY');
        logSuccess('All schema verifications completed!');

    } catch (error) {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function verifyTable(pool, tableName, expectedColumns) {
    logSection(`Table: ${tableName.toUpperCase()}`);

    try {
        // Get actual columns
        const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

        const actualColumns = result.rows;

        if (actualColumns.length === 0) {
            logError(`Table "${tableName}" does not exist!`);
            return;
        }

        logInfo(`Found ${actualColumns.length} columns (expected ${expectedColumns.length})`);

        // Check for missing columns
        const actualColumnNames = actualColumns.map(c => c.column_name);
        const missingColumns = expectedColumns.filter(col => !actualColumnNames.includes(col));
        const extraColumns = actualColumnNames.filter(col => !expectedColumns.includes(col));

        if (missingColumns.length > 0) {
            logError(`Missing columns: ${missingColumns.join(', ')}`);
        } else {
            logSuccess('All expected columns present');
        }

        if (extraColumns.length > 0) {
            logWarning(`Extra columns: ${extraColumns.join(', ')}`);
        }

        // Display column details
        logInfo('\nColumn Details:');
        log('┌─────────────────────────┬──────────────────┬──────────┐', 'blue');
        log('│ Column Name             │ Data Type        │ Nullable │', 'blue');
        log('├─────────────────────────┼──────────────────┼──────────┤', 'blue');

        actualColumns.forEach(col => {
            const name = col.column_name.padEnd(23);
            const type = col.data_type.padEnd(16);
            const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO';
            log(`│ ${name} │ ${type} │ ${nullable}     │`, 'blue');
        });

        log('└─────────────────────────┴──────────────────┴──────────┘', 'blue');

        // Check for data
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult.rows[0].count;
        logInfo(`\nRecords in table: ${count}`);

        if (count > 0) {
            logSuccess(`Sample record exists`);

            // Show sample record
            const sampleResult = await pool.query(`SELECT * FROM ${tableName} LIMIT 1`);
            const sample = sampleResult.rows[0];

            logInfo('\nSample Record:');
            Object.entries(sample).forEach(([key, value]) => {
                const displayValue = value === null ? 'NULL' :
                    typeof value === 'string' && value.length > 50 ?
                        value.substring(0, 50) + '...' :
                        value;
                log(`  ${key}: ${displayValue}`, 'blue');
            });
        } else {
            logWarning('No records in table');
        }

    } catch (error) {
        logError(`Error verifying table "${tableName}": ${error.message}`);
    }
}

// Run verification
verifySchema().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});
