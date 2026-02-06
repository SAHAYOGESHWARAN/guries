import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type AuthUser = {
    id: number;
    email: string;
    role: string;
};

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
}

function signToken(payload: AuthUser): string {
    const secret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body || {};

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const isAdminEmail = typeof email === 'string' && email.toLowerCase() === adminEmail.toLowerCase();
        const isPasswordValid = typeof password === 'string'
            ? (adminPassword.startsWith('$2') ? await bcrypt.compare(password, adminPassword) : password === adminPassword)
            : false;

        if (isAdminEmail && isPasswordValid) {
            const token = signToken({ id: 1, email: adminEmail, role: 'admin' });
            return res.status(200).json({
                success: true,
                user: {
                    id: 1,
                    name: 'Admin User',
                    email: adminEmail,
                    role: 'admin',
                    status: 'active',
                    department: 'Administration',
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                },
                token,
                message: 'Login successful'
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    } catch (error: any) {
        console.error('Auth Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
