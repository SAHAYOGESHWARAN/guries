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

        // PROBLEM 3 FIX: Implement QC endpoints

        // GET /api/v1/qc-review/pending - Get assets pending QC
        if (req.method === 'GET' && req.url?.includes('/pending')) {
            try {
                const result = await pool.query(
                    `SELECT * FROM assets 
                     WHERE qc_status = 'pending' OR qc_status = 'rework'
                     ORDER BY created_at DESC`
                );

                return res.status(200).json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length
                });
            } catch (error: any) {
                console.error('[QC] Error fetching pending assets:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch pending assets',
                    message: error.message
                });
            }
        }

        // GET /api/v1/qc-review/statistics - Get QC statistics
        if (req.method === 'GET' && req.url?.includes('/statistics')) {
            try {
                const pendingResult = await pool.query(
                    `SELECT COUNT(*) as count FROM assets WHERE qc_status = 'pending'`
                );
                const approvedResult = await pool.query(
                    `SELECT COUNT(*) as count FROM assets WHERE qc_status = 'approved'`
                );
                const rejectedResult = await pool.query(
                    `SELECT COUNT(*) as count FROM assets WHERE qc_status = 'rejected'`
                );
                const reworkResult = await pool.query(
                    `SELECT COUNT(*) as count FROM assets WHERE qc_status = 'rework'`
                );

                return res.status(200).json({
                    success: true,
                    data: {
                        pending: pendingResult.rows[0]?.count || 0,
                        approved: approvedResult.rows[0]?.count || 0,
                        rejected: rejectedResult.rows[0]?.count || 0,
                        rework: reworkResult.rows[0]?.count || 0,
                        total: (pendingResult.rows[0]?.count || 0) +
                            (approvedResult.rows[0]?.count || 0) +
                            (rejectedResult.rows[0]?.count || 0) +
                            (reworkResult.rows[0]?.count || 0)
                    }
                });
            } catch (error: any) {
                console.error('[QC] Error fetching statistics:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch QC statistics',
                    message: error.message
                });
            }
        }

        // POST /api/v1/qc-review/approve - Approve asset
        if (req.method === 'POST' && req.url?.includes('/approve')) {
            const { asset_id, qc_remarks, qc_score } = req.body;

            if (!asset_id) {
                return res.status(400).json({
                    success: false,
                    error: 'asset_id is required',
                    validationErrors: ['asset_id is required']
                });
            }

            try {
                // PROBLEM 2 FIX: Update asset with QC status and timestamp
                const result = await pool.query(
                    `UPDATE assets 
                     SET qc_status = 'approved', 
                         status = 'Published',
                         qc_remarks = $1,
                         qc_score = $2,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3
                     RETURNING *`,
                    [qc_remarks || null, qc_score || null, asset_id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Asset not found',
                        message: `Asset with ID ${asset_id} not found`
                    });
                }

                console.log('[QC] Asset approved:', asset_id);

                return res.status(200).json({
                    success: true,
                    data: result.rows[0],
                    message: 'Asset approved successfully'
                });
            } catch (error: any) {
                console.error('[QC] Error approving asset:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to approve asset',
                    message: error.message
                });
            }
        }

        // POST /api/v1/qc-review/reject - Reject asset
        if (req.method === 'POST' && req.url?.includes('/reject')) {
            const { asset_id, qc_remarks, qc_score } = req.body;

            if (!asset_id) {
                return res.status(400).json({
                    success: false,
                    error: 'asset_id is required',
                    validationErrors: ['asset_id is required']
                });
            }

            try {
                const result = await pool.query(
                    `UPDATE assets 
                     SET qc_status = 'rejected', 
                         status = 'QC Rejected',
                         qc_remarks = $1,
                         qc_score = $2,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3
                     RETURNING *`,
                    [qc_remarks || null, qc_score || null, asset_id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Asset not found',
                        message: `Asset with ID ${asset_id} not found`
                    });
                }

                console.log('[QC] Asset rejected:', asset_id);

                return res.status(200).json({
                    success: true,
                    data: result.rows[0],
                    message: 'Asset rejected successfully'
                });
            } catch (error: any) {
                console.error('[QC] Error rejecting asset:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to reject asset',
                    message: error.message
                });
            }
        }

        // POST /api/v1/qc-review/rework - Request rework
        if (req.method === 'POST' && req.url?.includes('/rework')) {
            const { asset_id, qc_remarks, qc_score } = req.body;

            if (!asset_id) {
                return res.status(400).json({
                    success: false,
                    error: 'asset_id is required',
                    validationErrors: ['asset_id is required']
                });
            }

            try {
                // Get current rework count
                const currentAsset = await pool.query(
                    `SELECT rework_count FROM assets WHERE id = $1`,
                    [asset_id]
                );

                if (currentAsset.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Asset not found',
                        message: `Asset with ID ${asset_id} not found`
                    });
                }

                const newReworkCount = (currentAsset.rows[0].rework_count || 0) + 1;

                const result = await pool.query(
                    `UPDATE assets 
                     SET qc_status = 'rework', 
                         status = 'In Rework',
                         qc_remarks = $1,
                         qc_score = $2,
                         rework_count = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4
                     RETURNING *`,
                    [qc_remarks || null, qc_score || null, newReworkCount, asset_id]
                );

                console.log('[QC] Rework requested for asset:', asset_id, 'Count:', newReworkCount);

                return res.status(200).json({
                    success: true,
                    data: result.rows[0],
                    message: 'Rework requested successfully'
                });
            } catch (error: any) {
                console.error('[QC] Error requesting rework:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to request rework',
                    message: error.message
                });
            }
        }

        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });

    } catch (error: any) {
        console.error('[QC] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
