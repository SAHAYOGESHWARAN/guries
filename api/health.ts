import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Initialize database
        await initializeDatabase();
        const pool = getPool();

        // Test database connection
        const result = await pool.query('SELECT NOW()');

        // Check if assets table exists and has data
        const assetsCheck = await pool.query('SELECT COUNT(*) as count FROM assets');
        const assetCount = assetsCheck.rows[0]?.count || 0;

        return res.status(200).json({
            success: true,
            status: 'healthy',
            database: 'connected (mock)',
            timestamp: result.rows[0]?.now,
            assets: {
                count: assetCount,
                table_exists: true
            }
        });
    } catch (error: any) {
        console.error('[Health] Error:', error);
        return res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
}
