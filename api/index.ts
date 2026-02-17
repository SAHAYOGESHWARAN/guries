import type { VercelRequest, VercelResponse } from '@vercel/node';

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
            return res.status(200).json({
                success: true,
                status: 'healthy',
                database: 'mock',
                timestamp: new Date().toISOString(),
                assets: {
                    count: 0,
                    table_exists: true
                }
            });
        }

        // Mock endpoints for services, keywords, users, etc.
        if (req.url?.includes('/services') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: [
                    { id: 1, service_name: 'SEO Services', status: 'active' },
                    { id: 2, service_name: 'Content Creation', status: 'active' }
                ]
            });
        }

        if (req.url?.includes('/keywords') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: [
                    { id: 1, keyword_name: 'digital marketing', keyword_intent: 'commercial' },
                    { id: 2, keyword_name: 'seo strategy', keyword_intent: 'informational' }
                ]
            });
        }

        if (req.url?.includes('/keywords') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/users') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: [
                    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
                ]
            });
        }

        if (req.url?.includes('/projects') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/projects') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/tasks') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/tasks') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/campaigns') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/campaigns') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/content') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/content') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/brands') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/brands') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/backlinks') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/backlinks') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/competitors') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/competitors') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        // Generic endpoint handler for other routes
        if (req.url?.startsWith('/api/v1/') || req.url?.startsWith('/api/')) {
            const endpoint = req.url.replace('/api/v1/', '').replace('/api/', '').split('?')[0].split('/')[0];

            // Return empty array for GET requests to any endpoint (mock data)
            if (req.method === 'GET') {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }

            // Return proper object for POST requests with ID
            if (req.method === 'POST') {
                const id = Math.floor(Math.random() * 100000) + 1;
                return res.status(201).json({
                    id,
                    ...req.body,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            // Return success for PUT/DELETE requests
            if (req.method === 'PUT' || req.method === 'DELETE') {
                return res.status(200).json({
                    success: true,
                    message: `${req.method} request to ${endpoint} processed successfully`
                });
            }

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
