import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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

    // Default response
    res.status(200).json({
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
}
