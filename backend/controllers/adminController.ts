import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';
import crypto from 'crypto';

// Helper function to hash passwords
const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Get all employees with metrics
export const getEmployees = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, status, created_at, updated_at, last_login, department, country
            FROM users 
            ORDER BY created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get employee metrics for dashboard
export const getEmployeeMetrics = async (req: Request, res: Response) => {
    try {
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
        const activeResult = await pool.query("SELECT COUNT(*) as active FROM users WHERE status = 'active'");
        const inactiveResult = await pool.query("SELECT COUNT(*) as inactive FROM users WHERE status = 'inactive'");

        res.status(200).json({
            totalUsers: totalResult.rows[0]?.total || 0,
            activeAccounts: activeResult.rows[0]?.active || 0,
            inactiveAccounts: inactiveResult.rows[0]?.inactive || 0,
            systemHealth: 'Optimal'
        });
    } catch (error: any) {
        console.error('Error fetching employee metrics:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create new employee
export const createEmployee = async (req: Request, res: Response) => {
    const { name, email, password, role, department, country } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Check for duplicate email
        const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, department, country, status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW()) RETURNING *`,
            [name, email, hashedPassword, role || 'user', department || null, country || null]
        );

        const newEmployee = result.rows[0];
        // Remove password hash from response
        delete newEmployee.password_hash;

        getSocket().emit('employee_created', newEmployee);
        res.status(201).json(newEmployee);
    } catch (error: any) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update employee
export const updateEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role, department, country, status } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Check for duplicate email (excluding current user)
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
            [email, id]
        );
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const result = await pool.query(
            `UPDATE users 
             SET name = $1, email = $2, role = $3, department = $4, country = $5, status = COALESCE($6, status), updated_at = NOW()
             WHERE id = $7 RETURNING *`,
            [name, email, role || 'user', department, country, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const updatedEmployee = result.rows[0];
        delete updatedEmployee.password_hash;

        getSocket().emit('employee_updated', updatedEmployee);
        res.status(200).json(updatedEmployee);
    } catch (error: any) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

// Reset employee password
export const resetPassword = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const hashedPassword = hashPassword(newPassword);

        const result = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email',
            [hashedPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        getSocket().emit('employee_password_reset', { id, name: result.rows[0].name });
        res.status(200).json({ message: 'Password reset successfully', employee: result.rows[0] });
    } catch (error: any) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: error.message });
    }
};

// Deactivate employee
export const deactivateEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const deactivatedEmployee = result.rows[0];
        delete deactivatedEmployee.password_hash;

        getSocket().emit('employee_deactivated', deactivatedEmployee);
        res.status(200).json({ message: 'Employee deactivated successfully', employee: deactivatedEmployee });
    } catch (error: any) {
        console.error('Error deactivating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

// Activate employee
export const activateEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const activatedEmployee = result.rows[0];
        delete activatedEmployee.password_hash;

        getSocket().emit('employee_activated', activatedEmployee);
        res.status(200).json({ message: 'Employee activated successfully', employee: activatedEmployee });
    } catch (error: any) {
        console.error('Error activating employee:', error);
        res.status(500).json({ error: error.message });
    }
};

// Toggle employee status (activate/deactivate)
export const toggleEmployeeStatus = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Get current status
        const currentResult = await pool.query('SELECT status FROM users WHERE id = $1', [id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const currentStatus = currentResult.rows[0].status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        const result = await pool.query(
            'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [newStatus, id]
        );

        const updatedEmployee = result.rows[0];
        delete updatedEmployee.password_hash;

        getSocket().emit('employee_status_changed', updatedEmployee);
        res.status(200).json({
            message: `Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            employee: updatedEmployee
        });
    } catch (error: any) {
        console.error('Error toggling employee status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login validation - check if user is active
export const validateLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT id, name, email, role, status, department, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if user is deactivated
        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'User deactivated' });
        }

        // Verify password
        const hashedPassword = hashPassword(password);
        if (user.password_hash && user.password_hash !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Remove password hash from response
        delete user.password_hash;

        res.status(200).json({
            message: 'Login successful',
            user: {
                ...user,
                last_login: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('Error validating login:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete employee (soft delete by deactivating, or hard delete)
export const deleteEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hardDelete } = req.query;

    try {
        if (hardDelete === 'true') {
            await pool.query('DELETE FROM users WHERE id = $1', [id]);
            getSocket().emit('employee_deleted', { id });
            res.status(204).send();
        } else {
            // Soft delete - just deactivate
            const result = await pool.query(
                "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *",
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            getSocket().emit('employee_deactivated', result.rows[0]);
            res.status(200).json({ message: 'Employee deactivated', employee: result.rows[0] });
        }
    } catch (error: any) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: error.message });
    }
};
