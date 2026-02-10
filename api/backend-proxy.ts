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
        const backendUrl = process.env.BACKEND_URL;

        if (!backendUrl) {
            return res.status(503).json({
                success: false,
                error: 'Backend not configured',
                message: 'BACKEND_URL environment variable is not set. Please configure backend URL in Vercel environment variables.'
            });
        }

        // Extract the API path
        const path = req.url?.replace(/^\/api/, '') || '/';
        const targetUrl = `${backendUrl}${path}`;

        console.log(`[Proxy] ${req.method} ${targetUrl}`);

        // Prepare request options
        const options: RequestInit = {
            method: req.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Copy relevant headers from request
        if (req.headers['authorization']) {
            options.headers = {
                ...options.headers,
                'authorization': req.headers['authorization']
            };
        }

        // Add body for non-GET requests
        if (req.method && req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Make request to backend with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(targetUrl, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeout);

        // Get response data
        const data = await response.text();

        // Set response status
        res.status(response.status);

        // Copy relevant headers from backend response
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Send response
        res.send(data);
    } catch (error: any) {
        console.error('[Proxy Error]', error.message);

        if (!res.headersSent) {
            // Check if it's a timeout
            if (error.name === 'AbortError') {
                return res.status(504).json({
                    success: false,
                    error: 'Gateway timeout',
                    message: 'Backend server did not respond in time'
                });
            }

            // Check if backend is unreachable
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return res.status(503).json({
                    success: false,
                    error: 'Backend unavailable',
                    message: 'Cannot connect to backend server. Please check BACKEND_URL environment variable.'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Proxy error',
                message: error.message
            });
        }
    }
}
