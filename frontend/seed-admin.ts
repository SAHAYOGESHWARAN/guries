/**
 * Seed Admin User to localStorage
 * This file helps initialize the admin user in localStorage for development
 * Run this in the browser console or import it in your app
 */

export function seedAdminUser() {
    const adminUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        department: 'Administration',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
    };

    // Get existing users from localStorage
    const existingUsersJson = localStorage.getItem('users');
    let users = existingUsersJson ? JSON.parse(existingUsersJson) : [];

    // Check if admin already exists
    const adminExists = users.some((u: any) => u.email === 'admin@example.com');

    if (!adminExists) {
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Admin user seeded to localStorage');
    } else {
        console.log('✅ Admin user already exists in localStorage');
    }

    return adminUser;
}

// Auto-seed on import (disabled)
// seedAdminUser();
