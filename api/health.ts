import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Marketing Control Center API is running',
        version: '2.5.0'
    });
}
