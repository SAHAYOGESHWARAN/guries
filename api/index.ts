import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // API handler - routes to backend
    res.status(200).json({
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
}
