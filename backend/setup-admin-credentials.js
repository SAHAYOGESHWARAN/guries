#!/usr/bin/env node

/**
 * Admin Credentials Setup Script
 * Sets up admin user with proper email and password for deployment
 * Usage: node setup-admin-credentials.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

async function setupAdmin() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          Admin Credentials Setup for Deployment                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // Check if database exists
        const fs = require('fs');
        if (!fs.existsSync(dbPath)) {
            console.log('❌ Database not found. Please run init-production-db.js first.\n');
            rl.close();
            process.exit(1);
        }

        const db = new Database(dbPath);
        db.pragma('foreign_keys = ON');

        // Get admin email
        const email = await question('Enter admin email (default: admin@example.com): ');
        const adminEmail = email.trim() || 'admin@example.com';

        // Get admin password
        const password = await question('Enter admin password (default: admin123): ');
        const adminPassword = password.trim() || 'admin123';

        // Get admin name
        const name = await question('Enter admin name (default: Admin User): ');
        const adminName = name.trim() || 'Admin User';

        console.log('\n📝 Setting up admin credentials...\n');

        // Check if admin user exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

        if (existing) {
            // Update existing admin user
            db.prepare(`
                UPDATE users 
                SET name = ?, role = ?, status = ?, updated_at = datetime('now')
                WHERE email = ?
            `).run(adminName, 'admin', 'active', adminEmail);
            console.log(`✅ Updated existing admin user: ${adminEmail}`);
        } else {
            // Create new admin user
            db.prepare(`
                INSERT INTO users (name, email, role, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
            `).run(adminName, 'admin', 'admin', 'active');
            console.log(`✅ Created new admin user: ${adminEmail}`);
        }

        // Update auth controller with new credentials
        const authControllerPath = path.join(__dirname, 'controllers', 'authController.ts');
        const fs_module = require('fs');
        let authContent = fs_module.readFileSync(authControllerPath, 'utf8');

        // Replace hardcoded credentials
        authContent = authContent.replace(
            /const ADMIN_EMAIL = '[^']*';/,
            `const ADMIN_EMAIL = '${adminEmail}';`
        );
        authContent = authContent.replace(
            /const ADMIN_PASSWORD = '[^']*';/,
            `const ADMIN_PASSWORD = '${adminPassword}';`
        );

        fs_module.writeFileSync(authControllerPath, authContent);
        console.log('✅ Updated authentication controller');

        // Create credentials file for reference
        const credentialsFile = path.join(__dirname, '.admin-credentials');
        const credentialsContent = `# Admin Credentials (DO NOT COMMIT TO GIT)
# Generated: ${new Date().toISOString()}

Email: ${adminEmail}
Password: ${adminPassword}
Name: ${adminName}

⚠️  IMPORTANT:
- Keep this file secure
- Do not share these credentials
- Change password after first login
- Delete this file after setup
`;

        fs_module.writeFileSync(credentialsFile, credentialsContent);
        console.log('✅ Created credentials reference file: .admin-credentials');

        db.close();

        console.log('\n✅ Admin setup complete!\n');
        console.log('Login credentials:');
        console.log(`  Email: ${adminEmail}`);
        console.log(`  Password: ${adminPassword}`);
        console.log('\n⚠️  IMPORTANT:');
        console.log('  1. Update authController.ts with new credentials');
        console.log('  2. Rebuild the backend: npm run build');
        console.log('  3. Restart the backend server');
        console.log('  4. Delete .admin-credentials file after setup\n');

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message, '\n');
        rl.close();
        process.exit(1);
    }
}

setupAdmin();
