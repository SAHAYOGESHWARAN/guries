import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Permission categories and their permissions
const PERMISSION_STRUCTURE = {
    GENERAL: ['View Dashboard', 'Export Data'],
    PROJECTS: ['Manage Projects'],
    CAMPAIGNS: ['Manage Campaigns'],
    ANALYTICS: ['View Analytics', 'View Reports'],
    CONTENT: ['Edit Content', 'Publish Content'],
    ADMIN: ['Manage Users', 'Manage Roles', 'System Settings'],
    ASSETS: ['Manage Assets']
};

// Get all users
router.get('/', (req: Request, res: Response) => {
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
        um.last_login,
        um.created_at,
        um.updated_at,
        COUNT(DISTINCT up.id) as permission_count
      FROM users_management um
      LEFT JOIN user_permissions up ON um.id = up.user_id AND up.is_granted = 1
      GROUP BY um.id
      ORDER BY um.full_name
    `).all();

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID with permissions
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = db.prepare(`
      SELECT * FROM users_management WHERE id = ?
    `).get(id) as any;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const permissions = db.prepare(`
      SELECT permission_category, permission_name, is_granted
      FROM user_permissions
      WHERE user_id = ?
      ORDER BY permission_category, permission_name
    `).all(id);

        res.json({
            ...(user as Record<string, any>),
            permissions
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', (req: Request, res: Response) => {
    try {
        const { full_name, email_address, phone_number, role, department, permissions } = req.body;

        if (!full_name || !email_address || !role || !department) {
            return res.status(400).json({ error: 'Full name, email, role, and department are required' });
        }

        // Insert user
        const result = db.prepare(`
      INSERT INTO users_management (full_name, email_address, phone_number, role, department, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(full_name, email_address, phone_number || null, role, department);

        const userId = result.lastInsertRowid;

        // Insert permissions
        if (permissions && Array.isArray(permissions)) {
            const insertPermission = db.prepare(`
        INSERT INTO user_permissions (user_id, permission_category, permission_name, is_granted)
        VALUES (?, ?, ?, ?)
      `);

            permissions.forEach((perm: any) => {
                insertPermission.run(userId, perm.category, perm.name, perm.granted ? 1 : 0);
            });
        }

        res.status(201).json({
            id: userId,
            full_name,
            email_address,
            phone_number,
            role,
            department,
            status: 'active',
            permissions: permissions || [],
            message: 'User created successfully'
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email address already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, email_address, phone_number, role, department, status, permissions } = req.body;

        if (!full_name || !email_address || !role || !department) {
            return res.status(400).json({ error: 'Full name, email, role, and department are required' });
        }

        // Update user
        db.prepare(`
      UPDATE users_management
      SET full_name = ?, email_address = ?, phone_number = ?, role = ?, department = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, email_address, phone_number || null, role, department, status || 'active', id);

        // Clear and re-insert permissions
        db.prepare('DELETE FROM user_permissions WHERE user_id = ?').run(id);

        if (permissions && Array.isArray(permissions)) {
            const insertPermission = db.prepare(`
        INSERT INTO user_permissions (user_id, permission_category, permission_name, is_granted)
        VALUES (?, ?, ?, ?)
      `);

            permissions.forEach((perm: any) => {
                insertPermission.run(id, perm.category, perm.name, perm.granted ? 1 : 0);
            });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email address already exists' });
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete permissions (cascade handled by DB)
        db.prepare('DELETE FROM user_permissions WHERE user_id = ?').run(id);

        // Delete user
        const result = db.prepare('DELETE FROM users_management WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user status
router.put('/:id/status', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required (active/inactive)' });
        }

        db.prepare(`
      UPDATE users_management
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Update last login
router.put('/:id/last-login', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        db.prepare(`
      UPDATE users_management
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

        res.json({ message: 'Last login updated successfully' });
    } catch (error) {
        console.error('Error updating last login:', error);
        res.status(500).json({ error: 'Failed to update last login' });
    }
});

// Get permission structure
router.get('/list/permissions', (req: Request, res: Response) => {
    try {
        res.json(PERMISSION_STRUCTURE);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// Get all roles
router.get('/list/roles', (req: Request, res: Response) => {
    try {
        const roles = db.prepare(`
      SELECT id, role_name, description, status
      FROM user_roles
      ORDER BY role_name
    `).all();

        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

// Get all departments
router.get('/list/departments', (req: Request, res: Response) => {
    try {
        const departments = db.prepare(`
      SELECT id, department_name, description, status
      FROM user_departments
      ORDER BY department_name
    `).all();

        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

export default router;

