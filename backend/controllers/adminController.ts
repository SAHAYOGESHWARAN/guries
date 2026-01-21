import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';
import crypto from 'crypto';

// Helper function to hash passwords
const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper function to log admin actions for audit trail
const logAdminAction = async (
    adminUserId: number | null,
    adminUserEmail: string | null,
    actionType: string,
    targetUserId: number | null,
    targetUserEmail: string | null,
    actionDetails: Record<string, any>,
    req: Request
) => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await pool.query(
            `INSERT INTO admin_audit_log (admin_user_id, admin_user_email, action_type, target_user_id, target_user_email, action_details, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [adminUserId, adminUserEmail, actionType, targetUserId, targetUserEmail, JSON.stringify(actionDetails), ipAddress, userAgent]
        );
    } catch (error) {
        console.error('Error logging admin action:', error);
        // Don't throw - audit logging should not break the main operation
    }
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
        const totalResult = await pool.query("SELECT COUNT(*) as total FROM users WHERE status != 'pending'");
        const activeResult = await pool.query("SELECT COUNT(*) as active FROM users WHERE status = 'active'");
        const inactiveResult = await pool.query("SELECT COUNT(*) as inactive FROM users WHERE status = 'inactive'");
        const pendingResult = await pool.query("SELECT COUNT(*) as pending FROM users WHERE status = 'pending'");
        const adminResult = await pool.query("SELECT COUNT(*) as admins FROM users WHERE role = 'admin' AND status != 'pending'");
        const employeeResult = await pool.query("SELECT COUNT(*) as employees FROM users WHERE role != 'admin' AND status != 'pending'");

        res.status(200).json({
            totalUsers: parseInt(totalResult.rows[0]?.total) || 0,
            activeAccounts: parseInt(activeResult.rows[0]?.active) || 0,
            inactiveAccounts: parseInt(inactiveResult.rows[0]?.inactive) || 0,
            pendingAccounts: parseInt(pendingResult.rows[0]?.pending) || 0,
            adminCount: parseInt(adminResult.rows[0]?.admins) || 0,
            employeeCount: parseInt(employeeResult.rows[0]?.employees) || 0,
            systemHealth: 'Optimal'
        });
    } catch (error: any) {
        console.error('Error fetching employee metrics:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get employees by role (for role-based filtering)
export const getEmployeesByRole = async (req: Request, res: Response) => {
    const { role } = req.params;

    try {
        let query = `
            SELECT id, name, email, role, status, created_at, updated_at, last_login, department, country
            FROM users 
            WHERE status != 'pending'
        `;
        const params: any[] = [];

        if (role === 'admin') {
            query += ` AND role = 'admin'`;
        } else if (role === 'user' || role === 'employee') {
            query += ` AND role != 'admin'`;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching employees by role:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get role statistics
export const getRoleStats = async (req: Request, res: Response) => {
    try {
        const adminStats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
            FROM users 
            WHERE role = 'admin' AND status != 'pending'
        `);

        const employeeStats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
            FROM users 
            WHERE role != 'admin' AND status != 'pending'
        `);

        res.status(200).json({
            admin: {
                total: parseInt(adminStats.rows[0]?.total) || 0,
                active: parseInt(adminStats.rows[0]?.active) || 0,
                inactive: parseInt(adminStats.rows[0]?.inactive) || 0,
                permissions: 12 // Admin has all permissions
            },
            employee: {
                total: parseInt(employeeStats.rows[0]?.total) || 0,
                active: parseInt(employeeStats.rows[0]?.active) || 0,
                inactive: parseInt(employeeStats.rows[0]?.inactive) || 0,
                permissions: 4 // Employee has limited permissions
            }
        });
    } catch (error: any) {
        console.error('Error fetching role stats:', error);
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
        const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, department, country, status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
            [name, email, hashedPassword, role || 'user', department || null, country || null]
        );

        const newEmployee = result.rows[0];
        // Remove password hash from response
        delete newEmployee.password_hash;

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'CREATE_USER', newEmployee.id, email, { name, role: role || 'user', department, country }, req);

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
            'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?',
            [email, id]
        );
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const result = await pool.query(
            `UPDATE users 
             SET name = ?, email = ?, role = ?, department = ?, country = ?, status = COALESCE(?, status), updated_at = datetime('now')
             WHERE id = ?`,
            [name, email, role || 'user', department, country, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const updatedEmployee = result.rows[0];
        delete updatedEmployee.password_hash;

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'UPDATE_USER', Number(id), email, { name, role, department, country, status }, req);

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
            'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ? RETURNING id, name, email',
            [hashedPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'RESET_PASSWORD', Number(id), result.rows[0].email, { targetName: result.rows[0].name }, req);

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
            "UPDATE users SET status = 'inactive', updated_at = datetime('now') WHERE id = ?",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const deactivatedEmployee = result.rows[0];
        delete deactivatedEmployee.password_hash;

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'DEACTIVATE_USER', Number(id), deactivatedEmployee.email, { targetName: deactivatedEmployee.name }, req);

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
            "UPDATE users SET status = 'active', updated_at = datetime('now') WHERE id = ?",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const activatedEmployee = result.rows[0];
        delete activatedEmployee.password_hash;

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'ACTIVATE_USER', Number(id), activatedEmployee.email, { targetName: activatedEmployee.name }, req);

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
        const currentResult = await pool.query('SELECT status, email, name FROM users WHERE id = ?', [id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const currentStatus = currentResult.rows[0].status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        const result = await pool.query(
            'UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [newStatus, id]
        );

        const updatedEmployee = result.rows[0];
        delete updatedEmployee.password_hash;

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        const actionType = newStatus === 'active' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';
        await logAdminAction(adminUserId, adminUserEmail, actionType, Number(id), updatedEmployee.email, { targetName: updatedEmployee.name, previousStatus: currentStatus, newStatus }, req);

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
            'SELECT id, name, email, role, status, department, password_hash FROM users WHERE LOWER(email) = LOWER(?)',
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

        // Check if user is pending approval
        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Account pending approval. Please wait for an administrator to activate your account.' });
        }

        // Verify password: require stored password_hash and exact match
        const hashedPassword = hashPassword(password);
        if (!user.password_hash || user.password_hash !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = datetime(\'now\') WHERE id = ?',
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
        // Get user info before deletion for audit log
        const userInfo = await pool.query('SELECT email, name FROM users WHERE id = ?', [id]);
        const targetEmail = userInfo.rows[0]?.email || null;
        const targetName = userInfo.rows[0]?.name || null;

        if (hardDelete === 'true') {
            await pool.query('DELETE FROM users WHERE id = ?', [id]);

            // Log admin action for audit trail
            const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
            const adminUserEmail = req.headers['x-user-email'] as string || null;
            await logAdminAction(adminUserId, adminUserEmail, 'DELETE_USER', Number(id), targetEmail, { targetName, hardDelete: true }, req);

            getSocket().emit('employee_deleted', { id });
            res.status(204).send();
        } else {
            // Soft delete - just deactivate
            const result = await pool.query(
                "UPDATE users SET status = 'inactive', updated_at = datetime('now') WHERE id = ?",
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            // Log admin action for audit trail
            const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
            const adminUserEmail = req.headers['x-user-email'] as string || null;
            await logAdminAction(adminUserId, adminUserEmail, 'DEACTIVATE_USER', Number(id), targetEmail, { targetName, softDelete: true }, req);

            getSocket().emit('employee_deactivated', result.rows[0]);
            res.status(200).json({ message: 'Employee deactivated', employee: result.rows[0] });
        }
    } catch (error: any) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get pending registration requests (for admin approval)
export const getPendingRegistrations = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, status, created_at, department, country
            FROM users 
            WHERE status = 'pending'
            ORDER BY created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching pending registrations:', error);
        res.status(500).json({ error: error.message });
    }
};

// Approve pending registration
export const approveRegistration = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users SET status = 'active', role = COALESCE(?, role), updated_at = datetime('now') WHERE id = ? AND status = 'pending'`,
            [role || 'user', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pending registration not found' });
        }

        const approvedUser = result.rows[0];
        delete approvedUser.password_hash;

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'APPROVE_REGISTRATION', Number(id), approvedUser.email, { targetName: approvedUser.name, assignedRole: role || 'user' }, req);

        getSocket().emit('registration_approved', approvedUser);
        res.status(200).json({ message: 'Registration approved successfully', employee: approvedUser });
    } catch (error: any) {
        console.error('Error approving registration:', error);
        res.status(500).json({ error: error.message });
    }
};

// Reject pending registration
export const rejectRegistration = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        // Get user info before deletion
        const userInfo = await pool.query('SELECT email, name FROM users WHERE id = ? AND status = ?', [id, 'pending']);
        if (userInfo.rows.length === 0) {
            return res.status(404).json({ error: 'Pending registration not found' });
        }

        const targetEmail = userInfo.rows[0].email;
        const targetName = userInfo.rows[0].name;

        // Delete the pending registration
        await pool.query('DELETE FROM users WHERE id = ? AND status = ?', [id, 'pending']);

        // Log admin action for audit trail
        const adminUserId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
        const adminUserEmail = req.headers['x-user-email'] as string || null;
        await logAdminAction(adminUserId, adminUserEmail, 'REJECT_REGISTRATION', Number(id), targetEmail, { targetName, reason }, req);

        getSocket().emit('registration_rejected', { id, email: targetEmail });
        res.status(200).json({ message: 'Registration rejected successfully' });
    } catch (error: any) {
        console.error('Error rejecting registration:', error);
        res.status(500).json({ error: error.message });
    }
};



