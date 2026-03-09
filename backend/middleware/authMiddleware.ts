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
            return res.status(401).json({ 
                success: false,
                error: 'No authorization header provided',
                message: 'Authorization token required'
            });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid authorization header format',
                message: 'Authorization header must be: Bearer <token>'
            });
        }

        const token = parts[1];
        
        // Enhanced validation: Check token format and validity
        if (!token || token.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'Token is empty',
                message: 'Token cannot be empty'
            });
        }

        // Check if token has valid JWT format (3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            return res.status(401).json({ 
                success: false,
                error: 'Malformed JWT token',
                message: 'Token must be a valid JWT (3 parts)'
            });
        }

        const decoded = verifyJWT(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid token payload',
                message: 'Token does not contain required user information'
            });
        }

        req.user = decoded;
        next();
    } catch (error: any) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ 
            success: false,
            error: 'Invalid or expired token',
            message: error.message || 'Token validation failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
