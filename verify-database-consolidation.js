/**
 * Database Consolidation Verification Script
 * Checks if the consolidation was successful
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Database Consolidation Verification\n');
console.log('='.repeat(60));

let allChecks = [];
let passedChecks = 0;
let failedChecks = 0;

// Check 1: Master schema exists
console.log('\n📋 Check 1: Master Schema File');
const masterSchemaPath = 'backend/schema_master.sql';
if (fs.existsSync(masterSchemaPath)) {
    const stats = fs.statSync(masterSchemaPath);
    const lines = fs.readFileSync(masterSchemaPath, 'utf8').split('\n').length;
    console.log(`   ✅ Master schema exists: ${masterSchemaPath}`);
    console.log(`   📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📊 Lines: ${lines}`);

    if (lines > 500) {
        console.log(`   ✅ Schema appears complete (${lines} lines)`);
        passedChecks++;
    } else {
        console.log(`   ⚠️  Schema may be incomplete (only ${lines} lines)`);
        failedChecks++;
    }
} else {
    console.log(`   ❌ Master schema NOT found: ${masterSchemaPath}`);
    failedChecks++;
}

// Check 2: Duplicate files removed
console.log('\n📋 Check 2: Duplicate Files Removed');
const duplicateFiles = [
    'backend/schema.sql',
    'db/schema.sql',
    'backend/db/schema.sql',
    'backend/db/full_schema.sql',
    'backend/db/analytics_hr_schema.sql',
    'backend/db/system_schema.sql'
];

let duplicatesFound = 0;
duplicateFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ⚠️  Duplicate still exists: ${file}`);
        duplicatesFound++;
    }
});

if (duplicatesFound === 0) {
    console.log(`   ✅ All duplicate files removed`);
    passedChecks++;
} else {
    console.log(`   ❌ ${duplicatesFound} duplicate file(s) still exist`);
    failedChecks++;
}

// Check 3: Backup created
console.log('\n📋 Check 3: Backup Directory');
const backupDirs = fs.readdirSync('.').filter(f => f.startsWith('database_backup_'));
if (backupDirs.length > 0) {
    console.log(`   ✅ Backup directory found: ${backupDirs[0]}`);
    const backupFiles = fs.readdirSync(backupDirs[0]);
    console.log(`   📊 Backed up files: ${backupFiles.length}`);
    passedChecks++;
} else {
    console.log(`   ⚠️  No backup directory found (may not have run cleanup yet)`);
    failedChecks++;
}

// Check 4: Setup script updated
console.log('\n📋 Check 4: Setup Script Configuration');
const setupScriptPath = 'backend/setup-database.js';
if (fs.existsSync(setupScriptPath)) {
    const setupContent = fs.readFileSync(setupScriptPath, 'utf8');
    if (setupContent.includes('schema_master.sql')) {
        console.log(`   ✅ Setup script uses schema_master.sql`);
        passedChecks++;
    } else if (setupContent.includes('schema.sql')) {
        console.log(`   ⚠️  Setup script still uses schema.sql (needs update)`);
        failedChecks++;
    } else {
        console.log(`   ❌ Setup script configuration unclear`);
        failedChecks++;
    }
} else {
    console.log(`   ❌ Setup script not found: ${setupScriptPath}`);
    failedChecks++;
}

// Check 5: Database config exists
console.log('\n📋 Check 5: Database Configuration');
const dbConfigPath = 'backend/config/db.ts';
if (fs.existsSync(dbConfigPath)) {
    console.log(`   ✅ Database config exists: ${dbConfigPath}`);
    passedChecks++;
} else {
    console.log(`   ❌ Database config not found: ${dbConfigPath}`);
    failedChecks++;
}

// Check 6: Migration files
console.log('\n📋 Check 6: Migration Files');
const migrationPath = 'backend/migrations/add_thumbnail_url_to_assets.sql';
if (fs.existsSync(migrationPath)) {
    console.log(`   ✅ Asset migration exists: ${migrationPath}`);
    passedChecks++;
} else {
    console.log(`   ⚠️  Asset migration not found (may need to create)`);
    failedChecks++;
}

// Check 7: Reference documentation
console.log('\n📋 Check 7: Documentation');
const docs = [
    'DATABASE_CONSOLIDATION_GUIDE.md',
    'cleanup-database-files.js',
    'verify-database-consolidation.js'
];

let docsFound = 0;
docs.forEach(doc => {
    if (fs.existsSync(doc)) {
        docsFound++;
    }
});

if (docsFound === docs.length) {
    console.log(`   ✅ All documentation files present (${docsFound}/${docs.length})`);
    passedChecks++;
} else {
    console.log(`   ⚠️  Some documentation missing (${docsFound}/${docs.length})`);
    failedChecks++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Verification Summary');
console.log('='.repeat(60));

const totalChecks = passedChecks + failedChecks;
const percentage = ((passedChecks / totalChecks) * 100).toFixed(0);

console.log(`\n✅ Passed: ${passedChecks}/${totalChecks} checks (${percentage}%)`);
console.log(`❌ Failed: ${failedChecks}/${totalChecks} checks`);

if (failedChecks === 0) {
    console.log('\n🎉 All checks passed! Database consolidation is complete.');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: cd backend && node setup-database.js');
    console.log('   2. Start backend: npm run dev');
    console.log('   3. Test the application');
} else if (passedChecks >= totalChecks * 0.7) {
    console.log('\n⚠️  Most checks passed, but some issues need attention.');
    console.log('\n📝 Recommended actions:');
    if (!fs.existsSync(masterSchemaPath)) {
        console.log('   - Run: node cleanup-database-files.js');
    }
    if (duplicatesFound > 0) {
        console.log('   - Remove duplicate schema files manually or run cleanup script');
    }
    console.log('   - Review failed checks above');
} else {
    console.log('\n❌ Several checks failed. Please review the issues above.');
    console.log('\n📝 Recommended actions:');
    console.log('   1. Ensure you have run: node cleanup-database-files.js');
    console.log('   2. Check if schema_master.sql exists');
    console.log('   3. Review the DATABASE_CONSOLIDATION_GUIDE.md');
}

// File structure overview
console.log('\n📁 Current Database File Structure:');
console.log('   backend/');
if (fs.existsSync('backend/schema_master.sql')) {
    console.log('   ├── ✅ schema_master.sql (MASTER)');
} else {
    console.log('   ├── ❌ schema_master.sql (MISSING)');
}

if (fs.existsSync('backend/setup-database.js')) {
    console.log('   ├── ✅ setup-database.js');
} else {
    console.log('   ├── ❌ setup-database.js (MISSING)');
}

if (fs.existsSync('backend/config/db.ts')) {
    console.log('   ├── ✅ config/db.ts');
} else {
    console.log('   ├── ❌ config/db.ts (MISSING)');
}

if (fs.existsSync('backend/migrations')) {
    const migrations = fs.readdirSync('backend/migrations');
    console.log(`   └── ✅ migrations/ (${migrations.length} files)`);
} else {
    console.log('   └── ⚠️  migrations/ (not found)');
}

console.log('\n✨ Verification complete!\n');
