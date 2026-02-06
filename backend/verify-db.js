const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../backend/mcc_db.sqlite');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('\n✅ Total tables:', tables.length);
        console.log('\nFirst 15 tables:');
        tables.slice(0, 15).forEach((t, i) => {
            console.log(`  ${(i + 1).toString().padStart(2)}. ${t.name}`);
        });
        if (tables.length > 15) {
            console.log(`  ... and ${tables.length - 15} more tables`);
        }
    }
    db.close();
});
