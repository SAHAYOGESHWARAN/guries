/**
 * Migration: Add Admin Console columns to users table
 * - password_hash: For secure password storage
 * - last_login: Track last login timestamp
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🔄 Running Admin Console migration...');

try {
    // Check and add password_hash column
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();

    const hasPasswordHash = tableInfo.some(col => col.name === 'password_hash');
    const hasLastLogin = tableInfo.some(col => col.name === 'last_login');
    const hasDepartment = tableInfo.some(col => col.name === 'department');
    const hasCountry = tableInfo.some(col => col.name === 'country');

    if (!hasPasswordHash) {
        db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
        console.log('  ✅ Added password_hash column');
    } else {
        console.log('  ⏭️  password_hash column already exists');
    }

    if (!hasLastLogin) {
        db.exec('ALTER TABLE users ADD COLUMN last_login DATETIME');
        console.log('  ✅ Added last_login column');
    } else {
        console.log('  ⏭️  last_login column already exists');
    }

    if (!hasDepartment) {
        db.exec('ALTER TABLE users ADD COLUMN department TEXT');
        console.log('  ✅ Added department column');
    } else {
        console.log('  ⏭️  department column already exists');
    }

    if (!hasCountry) {
        db.exec('ALTER TABLE users ADD COLUMN country TEXT');
        console.log('  ✅ Added country column');
    } else {
        console.log('  ⏭️  country column already exists');
    }

    // Create roles table if not exists
    db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_name TEXT NOT NULL UNIQUE,
            permissions TEXT,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('  ✅ Ensured roles table exists');

    // Insert default roles if not exist
    const existingRoles = db.prepare('SELECT COUNT(*) as count FROM roles').get();
    if (existingRoles.count === 0) {
        db.exec(`
            INSERT INTO roles (role_name, permissions, status) VALUES 
            ('admin', '{"canManageUsers": true, "canViewAdminConsole": true, "canPerformQC": true, "canApproveAssets": true}', 'Active'),
            ('user', '{"canManageUsers": false, "canViewAdminConsole": false, "canPerformQC": false, "canApproveAssets": false}', 'Active')
        `);
        console.log('  ✅ Inserted default roles (admin, user)');
    }

    // Ensure default admin user exists
    const adminUser = db.prepare("SELECT * FROM users WHERE email = 'admin@example.com'").get();
    if (!adminUser) {
        // Create default admin with hashed password 'admin123'
        const crypto = require('crypto');
        const defaultPassword = crypto.createHash('sha256').update('admin123').digest('hex');

        db.prepare(`
            INSERT INTO users (name, email, role, status, password_hash, department, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run('Admin User', 'admin@example.com', 'admin', 'active', defaultPassword, 'Administration');

        console.log('  ✅ Created default admin user (admin@example.com / admin123)');
    } else {
        // Update existing admin to have admin role if not set
        if (adminUser.role !== 'admin') {
            db.prepare("UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'").run();
            console.log('  ✅ Updated admin user role');
        }
    }

    console.log('✅ Admin Console migration completed successfully!');

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
