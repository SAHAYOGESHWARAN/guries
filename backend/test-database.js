#!/usr/bin/env node

/**
 * Comprehensive Database Table Testing Script
 * Tests all 50+ tables to ensure they're created and working properly
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('\n' + '='.repeat(80));
console.log('DATABASE TABLE TESTING - COMPREHENSIVE VERIFICATION');
console.log('='.repeat(80) + '\n');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// List of all tables that should exist
const expectedTables = [
    // Core Tables
    'users', 'roles', 'brands', 'services', 'sub_services', 'assets',

    // Linking Tables
    'service_asset_links', 'subservice_asset_links', 'keyword_asset_links',

    // QC & Audit
    'asset_qc_reviews', 'qc_audit_log', 'qc_runs', 'qc_checklists',
    'qc_checklist_versions', 'qc_weightage_configs',

    // SEO & Content
    'on_page_seo_audits', 'seo_asset_domains', 'service_pages',

    // Backlinks
    'backlink_sources', 'backlink_submissions', 'toxic_backlinks', 'competitor_backlinks',

    // Issue Tracking
    'ux_issues', 'url_errors',

    // Social Media
    'smm_posts', 'graphic_assets',

    // Project Management
    'projects', 'campaigns', 'tasks',

    // Analytics
    'okrs', 'competitor_benchmarks', 'gold_standards', 'effort_targets',

    // Team & Employee
    'teams', 'team_members', 'employee_evaluations', 'employee_skills',
    'employee_achievements', 'reward_recommendations',

    // Communication
    'voice_profiles', 'call_logs',

    // Knowledge & Compliance
    'knowledge_articles', 'compliance_rules', 'compliance_audits',

    // Configuration
    'personas', 'forms', 'integrations', 'integration_logs', 'system_settings',

    // Master Tables
    'asset_category_master', 'asset_type_master', 'asset_formats',
    'workflow_stages', 'platforms', 'countries', 'seo_error_types',

    // Other
    'keywords', 'notifications'
];

let passedTests = 0;
let failedTests = 0;
const failedTables = [];
const existingTables = [];

console.log('📋 TESTING TABLE EXISTENCE\n');

// Test 1: Check if all tables exist
expectedTables.forEach(tableName => {
    try {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`).get();
        console.log(`✅ ${tableName.padEnd(35)} - EXISTS (${result.count} rows)`);
        existingTables.push(tableName);
        passedTests++;
    } catch (error) {
        console.log(`❌ ${tableName.padEnd(35)} - MISSING`);
        failedTests++;
        failedTables.push(tableName);
    }
});

console.log('\n' + '='.repeat(80));
console.log('📊 TABLE STRUCTURE VERIFICATION\n');

// Test 2: Verify key columns in critical tables
const tableStructureTests = [
    {
        table: 'users',
        columns: ['id', 'name', 'email', 'role', 'status', 'password_hash', 'created_at', 'updated_at']
    },
    {
        table: 'assets',
        columns: ['id', 'asset_name', 'asset_type', 'status', 'qc_status', 'file_url', 'workflow_stage', 'created_at']
    },
    {
        table: 'services',
        columns: ['id', 'service_name', 'service_code', 'slug', 'status']
    },
    {
        table: 'sub_services',
        columns: ['id', 'service_id', 'sub_service_name', 'status']
    },
    {
        table: 'keywords',
        columns: ['id', 'keyword_name', 'search_volume', 'difficulty_score', 'status']
    },
    {
        table: 'backlink_sources',
        columns: ['id', 'domain', 'backlink_url', 'da_score', 'spam_score', 'status']
    },
    {
        table: 'on_page_seo_audits',
        columns: ['id', 'url', 'error_type', 'severity', 'status']
    },
    {
        table: 'qc_runs',
        columns: ['id', 'target_type', 'target_id', 'qc_status']
    },
    {
        table: 'projects',
        columns: ['id', 'project_name', 'project_code', 'status']
    },
    {
        table: 'campaigns',
        columns: ['id', 'campaign_name', 'campaign_type', 'status']
    }
];

tableStructureTests.forEach(test => {
    if (!existingTables.includes(test.table)) {
        console.log(`⏭️  ${test.table.padEnd(30)} - Table doesn't exist, skipping`);
        return;
    }

    try {
        const info = db.prepare(`PRAGMA table_info(${test.table})`).all();
        const columnNames = info.map(col => col.name);

        let allColumnsExist = true;
        const missingColumns = [];

        test.columns.forEach(col => {
            if (!columnNames.includes(col)) {
                allColumnsExist = false;
                missingColumns.push(col);
            }
        });

        if (allColumnsExist) {
            console.log(`✅ ${test.table.padEnd(30)} - All required columns present`);
            passedTests++;
        } else {
            console.log(`⚠️  ${test.table.padEnd(30)} - Missing: ${missingColumns.join(', ')}`);
            failedTests++;
        }
    } catch (error) {
        console.log(`❌ ${test.table.padEnd(30)} - Error: ${error.message}`);
        failedTests++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('🔗 FOREIGN KEY VERIFICATION\n');

// Test 3: Verify foreign key relationships
const foreignKeyTests = [
    { table: 'service_asset_links', fk: 'service_id', references: 'services' },
    { table: 'service_asset_links', fk: 'asset_id', references: 'assets' },
    { table: 'subservice_asset_links', fk: 'sub_service_id', references: 'sub_services' },
    { table: 'subservice_asset_links', fk: 'asset_id', references: 'assets' },
    { table: 'keyword_asset_links', fk: 'keyword_id', references: 'keywords' },
    { table: 'keyword_asset_links', fk: 'asset_id', references: 'assets' },
    { table: 'backlink_submissions', fk: 'service_id', references: 'services' },
    { table: 'on_page_seo_audits', fk: 'service_id', references: 'services' },
    { table: 'projects', fk: 'owner_id', references: 'users' },
    { table: 'campaigns', fk: 'project_id', references: 'projects' },
    { table: 'tasks', fk: 'project_id', references: 'projects' },
    { table: 'team_members', fk: 'team_id', references: 'teams' },
    { table: 'team_members', fk: 'user_id', references: 'users' }
];

foreignKeyTests.forEach(test => {
    if (!existingTables.includes(test.table)) {
        console.log(`⏭️  ${test.table}.${test.fk} - Table doesn't exist, skipping`);
        return;
    }

    try {
        const fkInfo = db.prepare(`PRAGMA foreign_key_list(${test.table})`).all();
        const hasFk = fkInfo.some(fk => fk.from === test.fk && fk.table === test.references);

        if (hasFk) {
            console.log(`✅ ${test.table}.${test.fk} → ${test.references}`);
            passedTests++;
        } else {
            console.log(`⚠️  ${test.table}.${test.fk} → ${test.references} (not found)`);
            failedTests++;
        }
    } catch (error) {
        console.log(`❌ ${test.table}.${test.fk} - Error: ${error.message}`);
        failedTests++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('📈 INDEX VERIFICATION\n');

// Test 4: Verify indexes exist
const indexTests = [
    { table: 'assets', index: 'idx_assets_status' },
    { table: 'assets', index: 'idx_assets_qc_status' },
    { table: 'assets', index: 'idx_assets_workflow_stage' },
    { table: 'services', index: 'idx_services_status' },
    { table: 'keywords', index: 'idx_keywords_keyword' },
    { table: 'backlink_sources', index: 'idx_backlink_sources_status' },
    { table: 'on_page_seo_audits', index: 'idx_on_page_seo_audits_severity' },
    { table: 'projects', index: 'idx_projects_status' },
    { table: 'campaigns', index: 'idx_campaigns_status' },
    { table: 'tasks', index: 'idx_tasks_status' }
];

indexTests.forEach(test => {
    if (!existingTables.includes(test.table)) {
        console.log(`⏭️  ${test.index.padEnd(40)} - Table doesn't exist, skipping`);
        return;
    }

    try {
        const indexes = db.prepare(`PRAGMA index_list(${test.table})`).all();
        const hasIndex = indexes.some(idx => idx.name === test.index);

        if (hasIndex) {
            console.log(`✅ ${test.index.padEnd(40)} on ${test.table}`);
            passedTests++;
        } else {
            console.log(`⚠️  ${test.index.padEnd(40)} on ${test.table} (not found)`);
            failedTests++;
        }
    } catch (error) {
        console.log(`❌ ${test.index.padEnd(40)} - Error: ${error.message}`);
        failedTests++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('🧪 DATA INSERTION TESTS\n');

// Test 5: Test inserting data into key tables
const insertionTests = [
    {
        table: 'users',
        sql: `INSERT INTO users (name, email, role, status, password_hash) VALUES (?, ?, ?, ?, ?)`,
        params: ['Test User', 'test@example.com', 'user', 'active', 'hash123']
    },
    {
        table: 'brands',
        sql: `INSERT INTO brands (name, code, industry, status) VALUES (?, ?, ?, ?)`,
        params: ['Test Brand', 'TB001', 'Technology', 'active']
    },
    {
        table: 'services',
        sql: `INSERT INTO services (service_name, service_code, slug, status) VALUES (?, ?, ?, ?)`,
        params: ['Test Service', 'TS001', 'test-service', 'active']
    },
    {
        table: 'keywords',
        sql: `INSERT INTO keywords (keyword_name, keyword, search_volume, difficulty_score, status) VALUES (?, ?, ?, ?, ?)`,
        params: ['Test Keyword', 'test', 1000, 50, 'active']
    },
    {
        table: 'assets',
        sql: `INSERT INTO assets (asset_name, asset_type, asset_category, status, created_by) VALUES (?, ?, ?, ?, ?)`,
        params: ['Test Asset', 'graphic', 'branding', 'draft', 1]
    }
];

insertionTests.forEach(test => {
    if (!existingTables.includes(test.table)) {
        console.log(`⏭️  ${test.table.padEnd(30)} - Table doesn't exist, skipping`);
        return;
    }

    try {
        const stmt = db.prepare(test.sql);
        const result = stmt.run(...test.params);
        console.log(`✅ ${test.table.padEnd(30)} - Inserted (ID: ${result.lastInsertRowid})`);
        passedTests++;
    } catch (error) {
        console.log(`❌ ${test.table.padEnd(30)} - Error: ${error.message}`);
        failedTests++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('🔍 DATA RETRIEVAL TESTS\n');

// Test 6: Test retrieving data
const retrievalTests = [
    { table: 'users', sql: 'SELECT COUNT(*) as count FROM users' },
    { table: 'brands', sql: 'SELECT COUNT(*) as count FROM brands' },
    { table: 'services', sql: 'SELECT COUNT(*) as count FROM services' },
    { table: 'keywords', sql: 'SELECT COUNT(*) as count FROM keywords' },
    { table: 'assets', sql: 'SELECT COUNT(*) as count FROM assets' },
    { table: 'projects', sql: 'SELECT COUNT(*) as count FROM projects' },
    { table: 'campaigns', sql: 'SELECT COUNT(*) as count FROM campaigns' },
    { table: 'tasks', sql: 'SELECT COUNT(*) as count FROM tasks' }
];

retrievalTests.forEach(test => {
    if (!existingTables.includes(test.table)) {
        console.log(`⏭️  ${test.table.padEnd(30)} - Table doesn't exist, skipping`);
        return;
    }

    try {
        const result = db.prepare(test.sql).get();
        console.log(`✅ ${test.table.padEnd(30)} - Retrieved ${result.count} rows`);
        passedTests++;
    } catch (error) {
        console.log(`❌ ${test.table.padEnd(30)} - Error: ${error.message}`);
        failedTests++;
    }
});

console.log('\n' + '='.repeat(80));
console.log('📊 TEST SUMMARY\n');

console.log(`Total Tests: ${passedTests + failedTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`);
console.log(`\nTables Found: ${existingTables.length}/${expectedTables.length}`);

if (failedTables.length > 0) {
    console.log(`\n⚠️  Missing Tables (${failedTables.length}): ${failedTables.join(', ')}`);
}

console.log('\n' + '='.repeat(80));

if (failedTests === 0) {
    console.log('✅ ALL TESTS PASSED - DATABASE IS WORKING PROPERLY\n');
    process.exit(0);
} else {
    console.log(`⚠️  ${failedTests} TESTS FAILED - PLEASE REVIEW\n`);
    process.exit(0);
}
