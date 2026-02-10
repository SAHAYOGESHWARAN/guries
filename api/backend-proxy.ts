import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../backend/dist/server';

/**
 * Vercel Serverless Function - Backend Proxy
 * Routes all API requests to the Express backend server
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
        // Use the Express app to handle the request
        return new Promise<void>((resolve, reject) => {
            // Set response headers
            res.setHeader('Content-Type', 'application/json');

            // Call the Express app with the request and response
            app(req as any, res as any, (err?: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
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
