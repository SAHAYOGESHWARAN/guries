import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../controllers/authController';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

// Middleware to verify JWT token
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Invalid authorization header format' });
        }

        const token = parts[1];
        const decoded = verifyJWT(token);
        req.user = decoded;
        next();
    } catch (error: any) {
        return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }
};

// Middleware to require admin role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
};

// Middleware to require specific role
export const requireRole = (role: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ error: `${role} privileges required` });
        }

        next();
    };
};

// Middleware to require one of multiple roles
export const requireRoles = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `One of these roles required: ${roles.join(', ')}` });
        }

        next();
    };
};

export default {
    verifyToken,
    requireAdmin,
    requireRole,
    requireRoles
};
