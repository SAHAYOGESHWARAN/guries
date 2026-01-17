const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating User Management tables...');

try {
    // Users Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users_management (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name VARCHAR(255) NOT NULL,
      email_address VARCHAR(255) NOT NULL UNIQUE,
      phone_number VARCHAR(20),
      role VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // User Permissions Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users_management(id) ON DELETE CASCADE,
      permission_category VARCHAR(100) NOT NULL,
      permission_name VARCHAR(255) NOT NULL,
      is_granted BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, permission_category, permission_name)
    )
  `);

    // Roles Table (for role management)
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Departments Table (for department management)
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ User Management tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating User Management tables:', error);
    db.close();
    process.exit(1);
}
