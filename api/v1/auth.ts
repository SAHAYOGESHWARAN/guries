import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initializeDatabase();
        const pool = getPool();

        // POST /api/v1/auth/login
        if (req.method === 'POST' && req.url?.includes('/login')) {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required',
                    validationErrors: [
                        !email ? 'Email is required' : '',
                        !password ? 'Password is required' : ''
                    ].filter(Boolean)
                });
            }

            try {
                // Get user by email
                const result = await pool.query(
                    `SELECT id, name, email, role, status FROM users WHERE email = $1`,
                    [email.toLowerCase()]
                );

                if (result.rows.length === 0) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid email or password',
                        message: 'User not found'
                    });
                }

                const user = result.rows[0];

                // Check if user is active
                if (user.status !== 'active') {
                    return res.status(403).json({
                        success: false,
                        error: 'User account is not active',
                        message: 'Please contact administrator'
                    });
                }

                // For demo purposes, accept any password
                // In production, use bcrypt to verify password_hash
                console.log('[Auth] User logged in:', user.email);

                // Update last login
                await pool.query(
                    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
                    [user.id]
                );

                return res.status(200).json({
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        },
                        token: `token_${user.id}_${Date.now()}`,
                        message: 'Login successful'
                    }
                });
            } catch (error: any) {
                console.error('[Auth] Login error:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Login failed',
                    message: error.message
                });
            }
        }

        // POST /api/v1/auth/register
        if (req.method === 'POST' && req.url?.includes('/register')) {
            const { name, email, password, role = 'user' } = req.body;

            const validationErrors: string[] = [];
            if (!name || !name.trim()) validationErrors.push('Name is required');
            if (!email || !email.trim()) validationErrors.push('Email is required');
            if (!password || password.length < 6) validationErrors.push('Password must be at least 6 characters');

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    validationErrors,
                    message: validationErrors.join('; ')
                });
            }

            try {
                // Check if user exists
                const existingUser = await pool.query(
                    `SELECT id FROM users WHERE email = $1`,
                    [email.toLowerCase()]
                );

                if (existingUser.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        error: 'User already exists',
                        message: 'Email is already registered'
                    });
                }

                // Create new user
                const result = await pool.query(
                    `INSERT INTO users (name, email, role, status, created_at, updated_at)
                     VALUES ($1, $2, $3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                     RETURNING id, name, email, role`,
                    [name.trim(), email.toLowerCase(), role]
                );

                const newUser = result.rows[0];

                console.log('[Auth] User registered:', newUser.email);

                return res.status(201).json({
                    success: true,
                    data: {
                        user: newUser,
                        token: `token_${newUser.id}_${Date.now()}`,
                        message: 'Registration successful'
                    }
                });
            } catch (error: any) {
                console.error('[Auth] Registration error:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Registration failed',
                    message: error.message
                });
            }
        }

        // GET /api/v1/auth/me
        if (req.method === 'GET' && req.url?.includes('/me')) {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    error: 'No authorization token provided',
                    message: 'Please login first'
                });
            }

            try {
                // Extract user ID from token (demo implementation)
                const tokenMatch = authHeader.match(/token_(\d+)_/);
                if (!tokenMatch) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid token',
                        message: 'Please login again'
                    });
                }

                const userId = parseInt(tokenMatch[1]);

                const result = await pool.query(
                    `SELECT id, name, email, role, status FROM users WHERE id = $1`,
                    [userId]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found',
                        message: 'Please login again'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        user: result.rows[0]
                    }
                });
            } catch (error: any) {
                console.error('[Auth] Get user error:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to get user',
                    message: error.message
                });
            }
        }

        // POST /api/v1/auth/logout
        if (req.method === 'POST' && req.url?.includes('/logout')) {
            return res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        }

        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });

    } catch (error: any) {
        console.error('[Auth] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
