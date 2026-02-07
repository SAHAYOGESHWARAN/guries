import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Mock auth endpoint
        if (req.url?.includes('/auth/login') && req.method === 'POST') {
            const { email, password } = req.body;

            // Mock credentials
            if (email === 'admin@example.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    user: {
                        id: 1,
                        email: 'admin@example.com',
                        name: 'Admin User',
                        role: 'admin'
                    },
                    token: 'mock-jwt-token-' + Date.now()
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Health check endpoint
        if (req.url?.includes('/health') && req.method === 'GET') {
            try {
                await initializeDatabase();
                const pool = getPool();
                const result = await pool.query('SELECT NOW()');
                const assetsCheck = await pool.query('SELECT COUNT(*) as count FROM assets');
                const assetCount = assetsCheck.rows[0]?.count || 0;

                return res.status(200).json({
                    success: true,
                    status: 'healthy',
                    database: 'connected',
                    timestamp: result.rows[0]?.now,
                    assets: {
                        count: assetCount,
                        table_exists: true
                    }
                });
            } catch (error: any) {
                return res.status(500).json({
                    success: false,
                    status: 'unhealthy',
                    error: error.message
                });
            }
        }

        // Generic endpoint handler for other routes
        // This handles /api/v1/* routes that don't have specific handlers
        if (req.url?.startsWith('/api/v1/')) {
            const endpoint = req.url.replace('/api/v1/', '').split('?')[0];

            // For now, return a not found for unhandled endpoints
            return res.status(404).json({
                success: false,
                error: `Endpoint /${endpoint} not found`,
                message: 'This endpoint is not yet implemented'
            });
        }

        // Default response
        res.status(200).json({
            message: 'API is running',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[API] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
