import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Lightweight API Proxy
 * Routes API requests to external backend server
 * Optimized for Hobby plan (2048 MB memory limit)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    try {
        // Get backend URL from environment
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

        // Extract the API path (remove /api prefix if present)
        const path = req.url?.replace(/^\/api/, '') || '/';
        const targetUrl = `${backendUrl}${path}`;

        // Prepare request options
        const options: RequestInit = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...req.headers,
            },
        };

        // Add body for non-GET requests
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Make request to backend
        const response = await fetch(targetUrl, options);

        // Get response data
        const data = await response.text();

        // Set response status and headers
        res.status(response.status);

        // Copy relevant headers from backend response
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Send response
        res.send(data);
    } catch (error: any) {
        console.error('Backend proxy error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}
