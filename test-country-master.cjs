const Database = require('better-sqlite3');
const path = require('path');
const http = require('http');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Country Master Testing\n');

// Test 1: Verify database table
console.log('1️⃣  Verifying database table...');
try {
    const tableInfo = db.prepare(`PRAGMA table_info(country_master)`).all();
    if (tableInfo.length === 0) {
        console.log('❌ Table not found');
        process.exit(1);
    }
    console.log('✅ Table exists with columns:');
    tableInfo.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 2: Insert test data
console.log('\n2️⃣  Inserting test data...');
try {
    const result = db.prepare(`
    INSERT INTO country_master (
      country_name, iso_code, region, default_language,
      allowed_for_backlinks, allowed_for_content_targeting, allowed_for_smm_targeting, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        'United States',
        'US',
        'North America',
        'English',
        1, 1, 1,
        'active'
    );
    console.log(`✅ Inserted country with ID: ${result.lastInsertRowid}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Query data
console.log('\n3️⃣  Querying data...');
try {
    const countries = db.prepare(`SELECT * FROM country_master`).all();
    console.log(`✅ Found ${countries.length} countries:`);
    countries.forEach(c => {
        console.log(`   - ${c.country_name} (${c.iso_code}) - ${c.region}`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Update data
console.log('\n4️⃣  Updating data...');
try {
    const result = db.prepare(`
    UPDATE country_master
    SET default_language = ?, updated_at = CURRENT_TIMESTAMP
    WHERE iso_code = ?
  `).run('Spanish', 'US');
    console.log(`✅ Updated ${result.changes} record(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Delete data
console.log('\n5️⃣  Deleting data...');
try {
    const result = db.prepare(`DELETE FROM country_master WHERE iso_code = ?`).run('US');
    console.log(`✅ Deleted ${result.changes} record(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Verify deletion
console.log('\n6️⃣  Verifying deletion...');
try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM country_master`).get();
    console.log(`✅ Remaining countries: ${count.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();
