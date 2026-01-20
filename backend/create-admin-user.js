/**
 * Create Admin User Script
 * Run this to create or update the admin user in the database
 * Usage: node create-admin-user.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Database path
const dbPath = path.join(__dirname, 'mcc_db.sqlite');

// Admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

// SHA256 hash of 'admin123'
const PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

try {
    console.log('🔌 Connecting to database...');
    const db = new Database(dbPath);

    console.log('📝 Creating/Updating admin user...');

    // Check if admin user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL);

    if (existingUser) {
        console.log(`✅ Admin user found (ID: ${existingUser.id})`);

        // Update the user
        db.prepare(`
            UPDATE users 
            SET name = ?, role = 'admin', status = 'active', password_hash = ?, department = 'Administration'
            WHERE email = ?
        `).run(ADMIN_NAME, PASSWORD_HASH, ADMIN_EMAIL);

        console.log('✅ Admin user updated successfully!');
    } else {
        console.log('📦 Admin user not found, creating new user...');

        // Insert new admin user
        db.prepare(`
            INSERT INTO users (name, email, role, status, password_hash, department)
            VALUES (?, ?, 'admin', 'active', ?, 'Administration')
        `).run(ADMIN_NAME, ADMIN_EMAIL, PASSWORD_HASH);

        console.log('✅ Admin user created successfully!');
    }

    // Verify the user
    const user = db.prepare('SELECT id, name, email, role, status, department FROM users WHERE email = ?').get(ADMIN_EMAIL);

    console.log('\n📋 Admin User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Department: ${user.department}`);

    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

    db.close();

    console.log('\n✨ Admin user setup completed successfully!');
    console.log('You can now login with the credentials above.');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
