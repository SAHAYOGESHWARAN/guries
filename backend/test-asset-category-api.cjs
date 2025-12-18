const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Testing Asset Category Master Table...\n');

// Test 1: Check table structure
console.log('1. Checking table structure:');
db.all("PRAGMA table_info(asset_category_master)", (err, columns) => {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log('✅ Columns:', columns.map(c => c.name).join(', '));
    }

    // Test 2: Insert a test record
    console.log('\n2. Inserting test record...');
    db.run(
        "INSERT INTO asset_category_master (brand, category_name, word_count, status) VALUES (?, ?, ?, ?)",
        ['Pubrica', 'What Science Can Do', 500, 'active'],
        function (err) {
            if (err) {
                console.error('❌ Insert failed:', err.message);
            } else {
                console.log('✅ Test record inserted with ID:', this.lastID);

                // Test 3: Query the record
                console.log('\n3. Querying records...');
                db.all("SELECT * FROM asset_category_master ORDER BY id DESC LIMIT 5", (err, rows) => {
                    if (err) {
                        console.error('❌ Query failed:', err.message);
                    } else {
                        console.log('✅ Records found:', rows.length);
                        rows.forEach(row => {
                            console.log(`   - ID: ${row.id}, Brand: ${row.brand}, Category: ${row.category_name}, Word Count: ${row.word_count}`);
                        });
                    }

                    db.close();
                    console.log('\n✅ All tests completed!');
                });
            }
        }
    );
});
