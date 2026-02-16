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

            console.log('[API] Retrieved assets:', result.rows.length);

            return res.status(200).json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        }

        if (req.method === 'POST') {
            // Create new asset with comprehensive validation
            const {
                asset_name,
                asset_type,
                asset_category,
                asset_format,
                status,
                repository,
                application_type,
                name,
                type,
                content_type,
                file_url,
                thumbnail_url,
                file_size,
                file_type,
                seo_score,
                grammar_score,
                keywords,
                created_by,
                linked_service_id,
                linked_sub_service_id
            } = body;

            // PROBLEM 1 FIX: Comprehensive validation
            const assetNameValue = asset_name || name;
            const validationErrors: string[] = [];

            if (!assetNameValue || !assetNameValue.trim()) {
                validationErrors.push('Asset name is required');
            }

            if (!application_type) {
                validationErrors.push('Application type (web, seo, smm) is required');
            }

            if (!asset_type && !type) {
                validationErrors.push('Asset type is required');
            }

            if (file_size && file_size > 52428800) { // 50MB limit
                validationErrors.push('File size exceeds 50MB limit');
            }

            if (validationErrors.length > 0) {
                console.warn('[API] Validation errors:', validationErrors);
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    validationErrors,
                    message: validationErrors.join('; ')
                });
            }

            console.log('[API] Creating asset with name:', assetNameValue);

            try {
                // PROBLEM 2 FIX: Use transaction-like behavior with proper error handling
                const result = await pool.query(
                    `INSERT INTO assets (
                        asset_name, asset_type, asset_category, asset_format, 
                        status, repository, application_type, content_type,
                        file_url, thumbnail_url, file_size, file_type,
                        seo_score, grammar_score, keywords,
                        created_by, linked_service_id, linked_sub_service_id,
                        qc_status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING *`,
                    [
                        assetNameValue.trim(),
                        asset_type || type || null,
                        asset_category || null,
                        asset_format || null,
                        status || 'draft',
                        repository || null,
                        application_type || null,
                        content_type || null,
                        file_url || null,
                        thumbnail_url || null,
                        file_size || null,
                        file_type || null,
                        seo_score || null,
                        grammar_score || null,
                        keywords ? JSON.stringify(keywords) : null,
                        created_by || null,
                        linked_service_id || null,
                        linked_sub_service_id || null,
                        'pending' // Initial QC status
                    ]
                );

                const newAsset = result.rows[0];

                if (!newAsset || !newAsset.id) {
                    console.error('[API] Asset created but no ID returned:', newAsset);
                    return res.status(500).json({
                        success: false,
                        error: 'Database error: Asset created but ID not returned',
                        message: 'Failed to save asset - database returned no ID'
                    });
                }

                console.log('[API] Asset created successfully with ID:', newAsset.id);

                return res.status(201).json({
                    success: true,
                    asset: newAsset,
                    data: newAsset,
                    message: 'Asset created successfully'
                });
            } catch (dbError: any) {
                console.error('[API] Database error creating asset:', dbError.message, dbError.code);

                // PROBLEM 5 FIX: Return detailed error information
                let errorMessage = 'Failed to save asset to database';
                if (dbError.code === '23505') {
                    errorMessage = 'Asset with this name already exists';
                } else if (dbError.code === '23503') {
                    errorMessage = 'Referenced service or user does not exist';
                }

                return res.status(500).json({
                    success: false,
                    error: errorMessage,
                    details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
                    message: errorMessage
                });
            }
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
