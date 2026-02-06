import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from '../db';

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
        // Initialize database on first request
        await initializeDatabase();

        const pool = getPool();

        // Parse request body - handle multiple formats
        let body = req.body || {};

        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error('[API] Failed to parse string body:', body);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON in request body',
                    details: e instanceof Error ? e.message : 'Unknown error'
                });
            }
        } else if (typeof body === 'object' && body !== null) {
            // Body is already an object, use as-is
        } else {
            body = {};
        }

        if (req.method === 'GET') {
            // Get all assets
            const result = await pool.query(
                'SELECT * FROM assets ORDER BY created_at DESC LIMIT 100'
            );

            return res.status(200).json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        }

        if (req.method === 'POST') {
            // Create new asset
            const {
                asset_name,
                asset_type,
                asset_category,
                asset_format,
                status,
                repository,
                application_type,
                name,
                type
            } = body;

            const assetNameValue = asset_name || name;

            if (!assetNameValue) {
                return res.status(400).json({
                    success: false,
                    error: 'asset_name is required'
                });
            }

            const result = await pool.query(
                `INSERT INTO assets (asset_name, asset_type, asset_category, asset_format, status, repository, application_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
                [
                    assetNameValue,
                    asset_type || type || null,
                    asset_category || null,
                    asset_format || null,
                    status || 'draft',
                    repository || null,
                    application_type || null
                ]
            );

            const newAsset = result.rows[0];

            return res.status(201).json({
                success: true,
                asset: newAsset,
                data: newAsset,
                message: 'Asset created successfully'
            });
        }

        if (req.method === 'PUT') {
            // Update asset - handle both /assetLibrary/:id and /assetLibrary?id=:id
            let id = req.query.id;
            if (!id && req.url) {
                const match = req.url.match(/\/(\d+)(?:\?|$)/);
                if (match) id = match[1];
            }

            const { asset_name, status } = body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'id is required'
                });
            }

            const result = await pool.query(
                `UPDATE assets SET asset_name = COALESCE($1, asset_name), status = COALESCE($2, status), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
                [asset_name || null, status || null, parseInt(id as string)]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            return res.status(200).json({
                success: true,
                asset: result.rows[0],
                data: result.rows[0],
                message: 'Asset updated successfully'
            });
        }

        if (req.method === 'DELETE') {
            // Delete asset - handle both /assetLibrary/:id and /assetLibrary?id=:id
            let id = req.query.id;
            if (!id && req.url) {
                const match = req.url.match(/\/(\d+)(?:\?|$)/);
                if (match) id = match[1];
            }

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'id is required'
                });
            }

            const result = await pool.query(
                'DELETE FROM assets WHERE id = $1 RETURNING id',
                [parseInt(id as string)]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Asset deleted successfully'
            });
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error: any) {
        console.error('[API] Error:', error);

        if (error.message.includes('DATABASE_URL')) {
            return res.status(500).json({
                success: false,
                error: 'Database not configured',
                message: 'DATABASE_URL environment variable is not set'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
