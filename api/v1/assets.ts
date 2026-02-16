import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initializeDatabase();
        const pool = getPool();

        // POST /api/v1/assets/upload-with-service
        if (req.method === 'POST' && req.url?.includes('/upload-with-service')) {
            const {
                asset_name,
                asset_type,
                asset_category,
                asset_format,
                application_type,
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
            } = req.body;

            // Validation
            const validationErrors: string[] = [];
            if (!asset_name || !asset_name.trim()) validationErrors.push('Asset name is required');
            if (!application_type) validationErrors.push('Application type is required');
            if (!asset_type) validationErrors.push('Asset type is required');

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    validationErrors,
                    message: validationErrors.join('; ')
                });
            }

            try {
                // Create asset
                const result = await pool.query(
                    `INSERT INTO assets (
                        asset_name, asset_type, asset_category, asset_format,
                        application_type, file_url, thumbnail_url, file_size, file_type,
                        seo_score, grammar_score, keywords,
                        created_by, linked_service_id, linked_sub_service_id,
                        status, qc_status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'draft', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING *`,
                    [
                        asset_name.trim(),
                        asset_type,
                        asset_category || null,
                        asset_format || null,
                        application_type,
                        file_url || null,
                        thumbnail_url || null,
                        file_size || null,
                        file_type || null,
                        seo_score || null,
                        grammar_score || null,
                        keywords ? JSON.stringify(keywords) : null,
                        created_by || null,
                        linked_service_id || null,
                        linked_sub_service_id || null
                    ]
                );

                const newAsset = result.rows[0];

                if (!newAsset || !newAsset.id) {
                    return res.status(500).json({
                        success: false,
                        error: 'Asset created but ID not returned',
                        message: 'Failed to save asset'
                    });
                }

                console.log('[Assets] Asset created with service link:', newAsset.id);

                return res.status(201).json({
                    success: true,
                    data: newAsset,
                    asset: newAsset,
                    message: 'Asset created successfully with service link'
                });
            } catch (error: any) {
                console.error('[Assets] Error creating asset:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create asset',
                    message: error.message
                });
            }
        }

        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });

    } catch (error: any) {
        console.error('[Assets] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
