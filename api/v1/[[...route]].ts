import { VercelRequest, VercelResponse } from '@vercel/node';

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

    try {
        const path = req.url || '';
        const method = req.method || 'GET';

        console.log(`[${new Date().toISOString()}] ${method} ${path}`);

        // Get backend URL from environment or use default
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

        // Construct the full URL for the backend request
        const fullUrl = `${backendUrl}/api/v1${path}`;

        console.log(`[Proxy] Forwarding ${method} ${path} to ${fullUrl}`);

        // Prepare request options
        const fetchOptions: any = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || '',
            },
        };

        // Add body for non-GET requests
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        // Make the request to the backend
        const backendResponse = await fetch(fullUrl, fetchOptions);

        // Get response data
        const responseData = await backendResponse.json();

        // Forward the status code and response
        return res.status(backendResponse.status).json(responseData);

    } catch (error: any) {
        console.error('API Proxy Error:', error);

        // If backend is unreachable, return a helpful error
        if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
            return res.status(503).json({
                success: false,
                error: 'Backend service unavailable',
                message: 'The backend API server is not responding. Please ensure it is running.',
                timestamp: new Date().toISOString()
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
