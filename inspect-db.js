const Database = require('better-sqlite3');
const db = new Database('mcc_db.sqlite');
try {
    const assets = db.prepare("PRAGMA table_info(assets);").all();
    console.log('assets columns:', assets);
    const keywords = db.prepare("PRAGMA table_info(keywords);").all();
    console.log('keywords columns:', keywords);
} catch (e) {
    console.error('error', e.message);
} finally {
    db.close();
    process.exit();
}