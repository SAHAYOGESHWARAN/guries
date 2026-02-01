#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * Run this to verify your database connection before deployment
 * 
 * Usage:
 *   npx ts-node backend/verify-db-connection.ts
 *   or
 *   node backend/verify-db-connection.js (after building)
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env';

dotenv.config({ path: path.join(__dirname, '..', envFile) });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function verifyDatabaseConnection() {
    log('\n🔍 Database Connection Verification', colors.cyan);
    log('='.repeat(50), colors.cyan);

    // Check environment variables
    log('\n📋 Checking Environment Variables...', colors.blue);

    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars: string[] = [];

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (!value) {
            log(`  ❌ ${varName}: NOT SET`, colors.red);
            missingVars.push(varName);
        } else {
            const displayValue = varName === 'DB_PASSWORD' ? '***' : value;
            log(`  ✅ ${varName}: ${displayValue}`, colors.green);
        }
    });

    if (missingVars.length > 0) {
        log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`, colors.red);
        log('Please set these in your .env or .env.production file', colors.yellow);
        process.exit(1);
    }

    // Test connection
    log('\n🔗 Testing Database Connection...', colors.blue);

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
        connectionTimeoutMillis: 5000,
    });

    try {
        // Test basic connection
        const result = await pool.query('SELECT NOW()');
        log(`  ✅ Connected successfully`, colors.green);
        log(`  📅 Server time: ${result.rows[0].now}`, colors.green);

        // Check tables
        log('\n📊 Checking Database Tables...', colors.blue);

        const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

        if (tablesResult.rows.length === 0) {
            log('  ⚠️  No tables found. Database schema needs to be initialized.', colors.yellow);
            log('  The app will initialize the schema on first run.', colors.yellow);
        } else {
            log(`  ✅ Found ${tablesResult.rows.length} tables:`, colors.green);
            tablesResult.rows.forEach(row => {
                log(`     - ${row.table_name}`, colors.green);
            });
        }

        // Check connection pool
        log('\n🔄 Connection Pool Status...', colors.blue);
        log(`  ✅ Pool size: ${pool.totalCount}`, colors.green);
        log(`  ✅ Available connections: ${pool.availableCount}`, colors.green);
        log(`  ✅ Waiting requests: ${pool.waitingCount}`, colors.green);

        // Success
        log('\n✅ All checks passed! Database is ready for deployment.', colors.green);
        log('='.repeat(50), colors.cyan);

        await pool.end();
        process.exit(0);

    } catch (error: any) {
        log(`\n❌ Connection failed: ${error.message}`, colors.red);
        log('\nTroubleshooting tips:', colors.yellow);

        if (error.code === 'ECONNREFUSED') {
            log('  • Database server is not running or not accessible', colors.yellow);
            log('  • Check DB_HOST and DB_PORT are correct', colors.yellow);
            log('  • Verify firewall allows connection to database', colors.yellow);
        } else if (error.code === 'ENOTFOUND') {
            log('  • Database host not found', colors.yellow);
            log('  • Check DB_HOST is correct', colors.yellow);
            log('  • Verify DNS resolution', colors.yellow);
        } else if (error.code === '28P01') {
            log('  • Authentication failed', colors.yellow);
            log('  • Check DB_USER and DB_PASSWORD are correct', colors.yellow);
            log('  • Verify user has access to the database', colors.yellow);
        } else if (error.code === '3D000') {
            log('  • Database does not exist', colors.yellow);
            log('  • Check DB_NAME is correct', colors.yellow);
            log('  • Create the database if it does not exist', colors.yellow);
        }

        log('\nEnvironment variables being used:', colors.yellow);
        log(`  DB_HOST: ${process.env.DB_HOST}`, colors.yellow);
        log(`  DB_PORT: ${process.env.DB_PORT}`, colors.yellow);
        log(`  DB_USER: ${process.env.DB_USER}`, colors.yellow);
        log(`  DB_NAME: ${process.env.DB_NAME}`, colors.yellow);

        log('\n='.repeat(50), colors.cyan);
        await pool.end();
        process.exit(1);
    }
}

// Run verification
verifyDatabaseConnection().catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, colors.red);
    process.exit(1);
});

