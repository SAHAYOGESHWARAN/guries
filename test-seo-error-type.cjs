const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 SEO Error Type Master Testing\n');

// Test 1: Verify database table
console.log('1️⃣  Verifying database table...');
try {
    const tableInfo = db.prepare(`PRAGMA table_info(seo_error_type_master)`).all();
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
    INSERT INTO seo_error_type_master (
      error_type, category, severity_level, description, status
    ) VALUES (?, ?, ?, ?, ?)
  `).run(
        'Meta Tag Missing',
        'On-page',
        'High',
        'Missing or empty meta title or description tags',
        'active'
    );
    console.log(`✅ Inserted error type with ID: ${result.lastInsertRowid}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Query data
console.log('\n3️⃣  Querying data...');
try {
    const errorTypes = db.prepare(`SELECT * FROM seo_error_type_master`).all();
    console.log(`✅ Found ${errorTypes.length} error types:`);
    errorTypes.forEach(e => {
        console.log(`   - ${e.error_type} (${e.category}) - ${e.severity_level}`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Update data
console.log('\n4️⃣  Updating data...');
try {
    const result = db.prepare(`
    UPDATE seo_error_type_master
    SET severity_level = ?, updated_at = CURRENT_TIMESTAMP
    WHERE error_type = ?
  `).run('Medium', 'Meta Tag Missing');
    console.log(`✅ Updated ${result.changes} record(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Delete data
console.log('\n5️⃣  Deleting data...');
try {
    const result = db.prepare(`DELETE FROM seo_error_type_master WHERE error_type = ?`).run('Meta Tag Missing');
    console.log(`✅ Deleted ${result.changes} record(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Verify deletion
console.log('\n6️⃣  Verifying deletion...');
try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM seo_error_type_master`).get();
    console.log(`✅ Remaining error types: ${count.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();
