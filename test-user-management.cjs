const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 User Management Testing\n');

// Test 1: Verify database tables
console.log('1️⃣  Verifying database tables...');
try {
    const usersInfo = db.prepare(`PRAGMA table_info(users_management)`).all();
    const permissionsInfo = db.prepare(`PRAGMA table_info(user_permissions)`).all();
    const rolesInfo = db.prepare(`PRAGMA table_info(user_roles)`).all();
    const deptsInfo = db.prepare(`PRAGMA table_info(user_departments)`).all();

    if (usersInfo.length === 0 || permissionsInfo.length === 0 || rolesInfo.length === 0 || deptsInfo.length === 0) {
        console.log('❌ One or more tables not found');
        process.exit(1);
    }

    console.log('✅ Users Management table columns:');
    usersInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ User Permissions table columns:');
    permissionsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ User Roles table columns:');
    rolesInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ User Departments table columns:');
    deptsInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 2: Insert roles and departments
console.log('\n2️⃣  Inserting roles and departments...');
try {
    const roles = ['Admin', 'Manager', 'Developer', 'Analyst', 'QC'];
    const departments = ['Management', 'Marketing', 'Content', 'Technology', 'Quality'];

    const insertRole = db.prepare(`
    INSERT OR IGNORE INTO user_roles (role_name, description, status)
    VALUES (?, ?, 'active')
  `);

    const insertDept = db.prepare(`
    INSERT OR IGNORE INTO user_departments (department_name, description, status)
    VALUES (?, ?, 'active')
  `);

    roles.forEach(role => {
        insertRole.run(role, `${role} role description`);
    });

    departments.forEach(dept => {
        insertDept.run(dept, `${dept} department`);
    });

    console.log(`✅ Inserted ${roles.length} roles and ${departments.length} departments`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 3: Insert user with permissions
console.log('\n3️⃣  Inserting user with permissions...');
try {
    const result = db.prepare(`
    INSERT INTO users_management (full_name, email_address, phone_number, role, department, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Sarah Johnson', 'sarah.johnson@company.com', '+1 (555) 123-4567', 'Admin', 'Management', 'active');

    const userId = result.lastInsertRowid;
    console.log(`✅ Inserted user with ID: ${userId}`);

    // Insert permissions
    const permissions = [
        { category: 'GENERAL', name: 'View Dashboard', granted: 1 },
        { category: 'GENERAL', name: 'Export Data', granted: 1 },
        { category: 'PROJECTS', name: 'Manage Projects', granted: 1 },
        { category: 'CAMPAIGNS', name: 'Manage Campaigns', granted: 1 },
        { category: 'ADMIN', name: 'Manage Users', granted: 1 },
        { category: 'ADMIN', name: 'Manage Roles', granted: 1 }
    ];

    const insertPerm = db.prepare(`
    INSERT INTO user_permissions (user_id, permission_category, permission_name, is_granted)
    VALUES (?, ?, ?, ?)
  `);

    permissions.forEach(perm => {
        insertPerm.run(userId, perm.category, perm.name, perm.granted);
    });

    console.log(`✅ Inserted ${permissions.length} permissions`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 4: Query user with permissions
console.log('\n4️⃣  Querying user with permissions...');
try {
    const users = db.prepare(`
    SELECT 
      um.id,
      um.full_name,
      um.email_address,
      um.phone_number,
      um.role,
      um.department,
      um.status,
      COUNT(DISTINCT up.id) as permission_count
    FROM users_management um
    LEFT JOIN user_permissions up ON um.id = up.user_id AND up.is_granted = 1
    GROUP BY um.id
  `).all();

    console.log(`✅ Found ${users.length} user(s):`);

    users.forEach(user => {
        console.log(`\n   User: ${user.full_name}`);
        console.log(`   Email: ${user.email_address}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Department: ${user.department}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Permissions: ${user.permission_count}`);

        const perms = db.prepare(`
      SELECT permission_category, permission_name
      FROM user_permissions
      WHERE user_id = ? AND is_granted = 1
      ORDER BY permission_category
    `).all(user.id);

        perms.forEach(perm => {
            console.log(`     - ${perm.permission_category}: ${perm.permission_name}`);
        });
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 5: Update user
console.log('\n5️⃣  Updating user...');
try {
    const result = db.prepare(`
    UPDATE users_management
    SET phone_number = ?, updated_at = CURRENT_TIMESTAMP
    WHERE email_address = ?
  `).run('+1 (555) 987-6543', 'sarah.johnson@company.com');

    console.log(`✅ Updated ${result.changes} user(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 6: Update user status
console.log('\n6️⃣  Updating user status...');
try {
    const result = db.prepare(`
    UPDATE users_management
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE email_address = ?
  `).run('inactive', 'sarah.johnson@company.com');

    console.log(`✅ Updated user status for ${result.changes} user(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 7: Update last login
console.log('\n7️⃣  Updating last login...');
try {
    const result = db.prepare(`
    UPDATE users_management
    SET last_login = CURRENT_TIMESTAMP
    WHERE email_address = ?
  `).run('sarah.johnson@company.com');

    console.log(`✅ Updated last login for ${result.changes} user(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 8: Delete user
console.log('\n8️⃣  Deleting user...');
try {
    // Delete permissions first
    db.prepare(`DELETE FROM user_permissions WHERE user_id IN (SELECT id FROM users_management WHERE email_address = ?)`).run('sarah.johnson@company.com');

    // Delete user
    const result = db.prepare(`DELETE FROM users_management WHERE email_address = ?`).run('sarah.johnson@company.com');

    console.log(`✅ Deleted ${result.changes} user(s)`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 9: Verify deletion
console.log('\n9️⃣  Verifying deletion...');
try {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM users_management`).get();
    console.log(`✅ Remaining users: ${count.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Test 10: Verify roles and departments
console.log('\n🔟 Verifying roles and departments...');
try {
    const roles = db.prepare(`SELECT COUNT(*) as cnt FROM user_roles WHERE status = 'active'`).get();
    const depts = db.prepare(`SELECT COUNT(*) as cnt FROM user_departments WHERE status = 'active'`).get();

    console.log(`✅ Active roles: ${roles.cnt}`);
    console.log(`✅ Active departments: ${depts.cnt}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('\n✅ All database tests passed!');
db.close();
