import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

// Extended Request interface with user info
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
        email: string;
    };
}

// Role types
export type UserRole = 'admin' | 'user' | 'manager' | 'qc' | 'guest';

// Permission definitions by role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: [
        'view_admin_console',
        'view_qc_asset_review',
        'perform_qc_review',
        'approve_assets',
        'reject_assets',
        'request_rework',
        'manage_users',
        'manage_roles',
        'view_all_assets',
        'edit_all_assets',
        'delete_all_assets',
        'view_qc_panel',
        'submit_for_qc',
        'view_audit_logs'
    ],
    manager: [
        'view_qc_panel',
        'view_team_assets',
        'submit_for_qc',
        'view_reports'
    ],
    qc: [
        'view_qc_panel',
        'perform_qc_review',
        'approve_assets',
        'reject_assets',
        'request_rework',
        'view_all_assets'
    ],
    user: [
        'view_qc_panel',
        'submit_for_qc',
        'edit_own_assets',
        'delete_own_assets',
        'view_own_assets'
    ],
    guest: [
        'view_own_assets'
    ]
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
};

// Middleware to check if user is authenticated
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get user info from request headers or body
        const userId = req.headers['x-user-id'] || req.body.user_id;
        const userRole = req.headers['x-user-role'] || req.body.user_role;

        if (!userId || !userRole) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        req.user = {
            id: Number(userId),
            role: String(userRole).toLowerCase(),
            email: ''
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

// Middleware to require admin role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = (req.headers['x-user-role'] || req.body.user_role || '').toString().toLowerCase();

    if (userRole !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.',
            code: 'ADMIN_REQUIRED'
        });
    }

    next();
};

// Middleware to require specific permission
export const requirePermission = (permission: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userRole = (req.headers['x-user-role'] || req.body.user_role || 'guest').toString().toLowerCase() as UserRole;

        if (!hasPermission(userRole, permission)) {
            return res.status(403).json({
                error: `Access denied. Permission '${permission}' required.`,
                code: 'PERMISSION_DENIED',
                required_permission: permission
            });
        }

        next();
    };
};

// Middleware to require QC review permission (admin or qc role)
export const requireQCPermission = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = (req.headers['x-user-role'] || req.body.user_role || '').toString().toLowerCase() as UserRole;

    if (!hasPermission(userRole, 'perform_qc_review')) {
        return res.status(403).json({
            error: 'Access denied. Only administrators and QC personnel can perform QC reviews.',
            code: 'QC_PERMISSION_DENIED'
        });
    }

    next();
};

// Log QC action for audit trail
export const logQCAction = async (
    assetId: number,
    userId: number,
    action: string,
    details: Record<string, any>
) => {
    try {
        await pool.query(
            `INSERT INTO qc_audit_log (asset_id, user_id, action, details, created_at) 
             VALUES ($1, $2, $3, $4, datetime('now'))`,
            [assetId, userId, action, JSON.stringify(details)]
        );
    } catch (error) {
        console.error('Failed to log QC action:', error);
    }
};

export default {
    requireAuth,
    requireAdmin,
    requirePermission,
    requireQCPermission,
    hasPermission,
    logQCAction,
    ROLE_PERMISSIONS
};

