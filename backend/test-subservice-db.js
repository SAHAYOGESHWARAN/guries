const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== SUB-SERVICE MASTER DATABASE TEST ===\n');

function runTest(testName, query, expectedResult) {
  return new Promise((resolve) => {
    db.all(query, (err, rows) => {
      if (err) {
        console.log(` ${testName}: ${err.message}`);
        resolve(false);
      } else {
        console.log(` ${testName}: Found ${rows.length} records`);
        resolve(true);
      }
    });
  });
}

async function runAllTests() {
  try {
    console.log('1. Testing sub_services table exists...');
    await runTest('Table exists', "SELECT name FROM sqlite_master WHERE type='table' AND name='sub_services'");
    
    console.log('\n2. Testing sub_services columns...');
    await runTest('Columns check', "PRAGMA table_info(sub_services)");
    
    console.log('\n3. Testing services table...');
    await runTest('Services table', "SELECT COUNT(*) as count FROM services");
    
    console.log('\n4. Testing sub_services table...');
    await runTest('Sub-services table', "SELECT COUNT(*) as count FROM sub_services");
    
    console.log('\n5. Testing parent-child relationship...');
    await runTest('Parent-child link', `
      SELECT ss.id, ss.sub_service_name, s.service_name 
      FROM sub_services ss 
      LEFT JOIN services s ON ss.parent_service_id = s.id 
      LIMIT 5
    `);
    
    console.log('\n6. Testing JSON fields...');
    await runTest('JSON fields', `
      SELECT id, sub_service_name, focus_keywords, social_meta 
      FROM sub_services 
      LIMIT 1
    `);
    
    console.log('\n=== DATABASE TESTS COMPLETE ===\n');
    db.close();
  } catch (error) {
    console.error('Test error:', error);
    db.close();
  }
}

runAllTests();
