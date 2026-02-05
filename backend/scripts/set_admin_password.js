const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

const saltRounds = 10;
const password_hash = bcrypt.hashSync(password, saltRounds);

db.serialize(() => {
    db.run(`UPDATE users SET password_hash = ?, role = 'admin', status = 'active', department = 'Administration', updated_at = datetime('now') WHERE email = ?`, [password_hash, email], function(err) {
        if (err) {
            console.error('Error updating admin password:', err.message);
            db.close();
            process.exit(1);
        }
        if (this.changes === 0) {
            // Insert if not exists
            db.run(`INSERT INTO users (name, email, role, status, password_hash, department, created_at, updated_at) VALUES (?, ?, 'admin', 'active', ?, 'Administration', datetime('now'), datetime('now'))`, ['Admin User', email, password_hash], function(err2) {
                if (err2) {
                    console.error('Error inserting admin user:', err2.message);
                    db.close();
                    process.exit(1);
                }
                console.log('Inserted admin user:', email);
                db.close();
            });
        } else {
            console.log('Updated admin password for:', email);
            db.close();
        }
    });
});
