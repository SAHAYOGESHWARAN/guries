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
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
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
      LEFT JOIN user_permissions up ON um.id = up.user_id AND up.is_granted = true
      GROUP BY um.id
      ORDER BY um.full_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID with permissions
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const userResult = await pool.query(`
      SELECT * FROM users_management WHERE id = $1
    `, [id]);

        const user = userResult.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const permResult = await pool.query(`
      SELECT permission_category, permission_name, is_granted
      FROM user_permissions
      WHERE user_id = $1
      ORDER BY permission_category, permission_name
    `, [id]);

        res.json({
            ...user,
            permissions: permResult.rows
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', async (req: Request, res: Response) => {
    try {
        const { full_name, email_address, phone_number, role, department, permissions } = req.body;

        if (!full_name || !email_address || !role || !department) {
            return res.status(400).json({ error: 'Full name, email, role, and department are required' });
        }

        // Insert user
        const result = await pool.query(`
      INSERT INTO users_management (full_name, email_address, phone_number, role, department, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
      RETURNING id
    `, [full_name, email_address, phone_number || null, role, department]);

        const userId = result.rows[0].id;

        // Insert permissions
        if (permissions && Array.isArray(permissions)) {
            for (const perm of permissions) {
                await pool.query(`
          INSERT INTO user_permissions (user_id, permission_category, permission_name, is_granted, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [userId, perm.category, perm.name, perm.granted ? true : false]);
            }
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
        if (error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Email address already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, email_address, phone_number, role, department, status, permissions } = req.body;

        if (!full_name || !email_address || !role || !department) {
            return res.status(400).json({ error: 'Full name, email, role, and department are required' });
        }

        // Update user
        await pool.query(`
      UPDATE users_management
      SET full_name = $1, email_address = $2, phone_number = $3, role = $4, department = $5, status = $6, updated_at = NOW()
      WHERE id = $7
    `, [full_name, email_address, phone_number || null, role, department, status || 'active', id]);

        // Clear and re-insert permissions
        await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);

        if (permissions && Array.isArray(permissions)) {
            for (const perm of permissions) {
                await pool.query(`
          INSERT INTO user_permissions (user_id, permission_category, permission_name, is_granted, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [id, perm.category, perm.name, perm.granted ? true : false]);
            }
        }

        res.json({ message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Email address already exists' });
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete permissions
        await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);

        // Delete user
        const result = await pool.query('DELETE FROM users_management WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user status
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required (active/inactive)' });
        }

        await pool.query(`
      UPDATE users_management
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, id]);

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Update last login
router.put('/:id/last-login', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await pool.query(`
      UPDATE users_management
      SET last_login = NOW()
      WHERE id = $1
    `, [id]);

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
router.get('/list/roles', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT id, role_name, description, status
      FROM user_roles
      ORDER BY role_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

// Get all departments
router.get('/list/departments', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT id, department_name, description, status
      FROM user_departments
      ORDER BY department_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

export default router;

