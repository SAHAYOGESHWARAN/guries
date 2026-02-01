const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'mcc_db.sqlite'));
try {
  const rows = db.prepare('SELECT id, asset_id, qc_reviewer_id, qc_score, qc_decision, created_at FROM asset_qc_reviews WHERE asset_id = ? ORDER BY created_at DESC LIMIT 5').all(1);
  console.log('QC REVIEWS (latest):', rows);
} catch (e) {
  console.error('DB ERROR', e.message);
  process.exit(2);
} finally {
  db.close();
}
