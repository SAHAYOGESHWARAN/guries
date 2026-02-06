import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Check environment
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return res.status(500).json({
                status: 'error',
                message: 'DATABASE_URL not configured',
                timestamp: new Date().toISOString()
            });
        }

        // Initialize database
        await initializeDatabase();

        // Test database connection
        const pool = getPool();
        const result = await pool.query('SELECT NOW() as current_time');

        return res.status(200).json({
            status: 'ok',
            database: 'connected',
            timestamp: result.rows[0].current_time,
            environment: process.env.NODE_ENV
        });
    } catch (error: any) {
        console.error('[Health] Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
