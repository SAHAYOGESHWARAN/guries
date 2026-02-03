import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * QC Review Controller
 * Handles asset approval/rejection and QC status updates
 */

// Get all assets pending QC review
export const getPendingQCAssets = async (req: Request, res: Response) => {
    const { status, limit = 50, offset = 0 } = req.query;

    try {
        let query = `
            SELECT 
                id,
                asset_name,
                asset_type,
                status,
                qc_status,
                workflow_stage,
                seo_score,
                grammar_score,
                submitted_by,
                submitted_at,
                created_at,
                file_url,
                thumbnail_url,
                application_type,
                asset_category,
                keywords,
                linked_service_id,
                linked_sub_service_id
            FROM assets 
            WHERE qc_status IN ('QC Pending', 'Rework')
        `;

        const params: any[] = [];

        if (status && status !== 'all') {
            query += ` AND qc_status = ?`;
            params.push(status);
        }

        query += ` ORDER BY submitted_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const result = await pool.query(query, params);

        // Parse JSON fields
        const assets = result.rows.map((asset: any) => ({
            ...asset,
            keywords: asset.keywords ? JSON.parse(asset.keywords) : []
        }));

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM assets WHERE qc_status IN ('QC Pending', 'Rework')`;
        if (status && status !== 'all') {
            countQuery = `SELECT COUNT(*) as total FROM assets WHERE qc_status = ?`;
        }

        const countResult = await pool.query(
            countQuery,
            status && status !== 'all' ? [status] : []
        );

        res.status(200).json({
            assets,
            total: countResult.rows[0]?.total || 0,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error: any) {
        console.error('Error fetching pending QC assets:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get single asset for QC review
export const getAssetForQCReview = async (req: Request, res: Response) => {
    const { asset_id } = req.params;

    try {
        if (!asset_id) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        const result = await pool.query(
            `SELECT * FROM assets WHERE id = ?`,
            [asset_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = result.rows[0];

        // Parse JSON fields
        const parsed = {
            ...asset,
            keywords: asset.keywords ? JSON.parse(asset.keywords) : [],
            content_keywords: asset.content_keywords ? JSON.parse(asset.content_keywords) : [],
            seo_keywords: asset.seo_keywords ? JSON.parse(asset.seo_keywords) : [],
            web_h3_tags: asset.web_h3_tags ? JSON.parse(asset.web_h3_tags) : [],
            resource_files: asset.resource_files ? JSON.parse(asset.resource_files) : [],
            qc_checklist_items: asset.qc_checklist_items ? JSON.parse(asset.qc_checklist_items) : []
        };

        res.status(200).json(parsed);
    } catch (error: any) {
        console.error('Error fetching asset for QC review:', error);
        res.status(500).json({ error: error.message });
    }
};

// Approve asset (QC Pass)
export const approveAsset = async (req: Request, res: Response) => {
    const { asset_id, qc_remarks, qc_score } = req.body;
    const assetIdParam = (req.params as any).asset_id;
    const finalAssetId = assetIdParam || asset_id;
    const qc_reviewer_id = (req as any).user?.id;

    try {
        if (!finalAssetId) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        // Check asset exists
        const assetCheck = await pool.query('SELECT id, workflow_log FROM assets WHERE id = ?', [finalAssetId]);
        if (assetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        // Parse existing workflow log
        let workflowLog = [];
        try {
            workflowLog = JSON.parse(assetCheck.rows[0].workflow_log || '[]');
        } catch (e) {
            workflowLog = [];
        }

        // Add approval event to workflow log
        workflowLog.push({
            action: 'approved',
            timestamp: new Date().toISOString(),
            user_id: qc_reviewer_id,
            status: 'Published',
            workflow_stage: 'Approve',
            remarks: qc_remarks
        });

        // Update asset - CRITICAL: Remove from review options by updating status and workflow stage
        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Approved',
                 workflow_stage = 'Published',
                 linking_active = 1,
                 qc_reviewer_id = ?,
                 qc_reviewed_at = CURRENT_TIMESTAMP,
                 qc_remarks = ?,
                 qc_score = ?,
                 status = 'QC Approved',
                 workflow_log = ?
             WHERE id = ?`,
            [qc_reviewer_id, qc_remarks || null, qc_score || null, JSON.stringify(workflowLog), finalAssetId]
        );

        // Log status change
        await logQCAction(finalAssetId, 'approved', qc_remarks, qc_reviewer_id);

        // Get updated asset
        const updatedAsset = await pool.query('SELECT * FROM assets WHERE id = ?', [finalAssetId]);
        const parsed = parseAssetRow(updatedAsset.rows[0]);

        res.status(200).json({
            message: 'Asset approved successfully',
            asset_id: finalAssetId,
            qc_status: 'Approved',
            workflow_stage: 'Published',
            linking_active: 1,
            status: 'QC Approved',
            asset: parsed
        });
    } catch (error: any) {
        console.error('Error approving asset:', error);
        res.status(500).json({ error: error.message });
    }
};

// Reject asset (QC Fail)
export const rejectAsset = async (req: Request, res: Response) => {
    const { asset_id, qc_remarks, qc_score } = req.body;
    const assetIdParam = (req.params as any).asset_id;
    const finalAssetId = assetIdParam || asset_id;
    const qc_reviewer_id = (req as any).user?.id;

    try {
        if (!finalAssetId) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        if (!qc_remarks) {
            return res.status(400).json({ error: 'qc_remarks is required for rejection' });
        }

        // Check asset exists
        const assetCheck = await pool.query('SELECT id, workflow_log FROM assets WHERE id = ?', [finalAssetId]);
        if (assetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        // Parse existing workflow log
        let workflowLog = [];
        try {
            workflowLog = JSON.parse(assetCheck.rows[0].workflow_log || '[]');
        } catch (e) {
            workflowLog = [];
        }

        // Add rejection event to workflow log
        workflowLog.push({
            action: 'rejected',
            timestamp: new Date().toISOString(),
            user_id: qc_reviewer_id,
            status: 'Rejected',
            workflow_stage: 'QC',
            remarks: qc_remarks
        });

        // Update asset
        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Rejected',
                 workflow_stage = 'QC',
                 linking_active = 0,
                 qc_reviewer_id = ?,
                 qc_reviewed_at = CURRENT_TIMESTAMP,
                 qc_remarks = ?,
                 qc_score = ?,
                 status = 'Rejected',
                 workflow_log = ?
             WHERE id = ?`,
            [qc_reviewer_id, qc_remarks, qc_score || null, JSON.stringify(workflowLog), finalAssetId]
        );

        // Log status change
        await logQCAction(finalAssetId, 'rejected', qc_remarks, qc_reviewer_id);

        // Get updated asset
        const updatedAsset = await pool.query('SELECT * FROM assets WHERE id = ?', [finalAssetId]);

        res.status(200).json({
            message: 'Asset rejected successfully',
            asset_id: finalAssetId,
            qc_status: 'Fail',
            linking_active: 0,
            status: 'Rejected',
            asset: updatedAsset.rows[0]
        });
    } catch (error: any) {
        console.error('Error rejecting asset:', error);
        res.status(500).json({ error: error.message });
    }
};

// Request rework (QC Rework)
export const requestRework = async (req: Request, res: Response) => {
    const { asset_id, qc_remarks, qc_score } = req.body;
    const assetIdParam = (req.params as any).asset_id;
    const finalAssetId = assetIdParam || asset_id;
    const qc_reviewer_id = (req as any).user?.id;

    try {
        if (!finalAssetId) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        if (!qc_remarks) {
            return res.status(400).json({ error: 'qc_remarks is required for rework request' });
        }

        // Check asset exists
        const assetCheck = await pool.query('SELECT id, rework_count FROM assets WHERE id = ?', [finalAssetId]);
        if (assetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const currentReworkCount = assetCheck.rows[0].rework_count || 0;

        // Update asset
        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Rework',
                 workflow_stage = 'QC',
                 linking_active = 0,
                 qc_reviewer_id = ?,
                 qc_reviewed_at = CURRENT_TIMESTAMP,
                 qc_remarks = ?,
                 qc_score = ?,
                 rework_count = ?,
                 status = 'Rework Requested'
             WHERE id = ?`,
            [qc_reviewer_id, qc_remarks, qc_score || null, currentReworkCount + 1, finalAssetId]
        );

        // Log status change
        await logQCAction(finalAssetId, 'rework_requested', qc_remarks, qc_reviewer_id);

        // Get updated asset
        const updatedAsset = await pool.query('SELECT * FROM assets WHERE id = ?', [finalAssetId]);

        res.status(200).json({
            message: 'Rework requested successfully',
            asset_id: finalAssetId,
            qc_status: 'Rework',
            linking_active: 0,
            status: 'Rework Requested',
            rework_count: currentReworkCount + 1,
            asset: updatedAsset.rows[0]
        });
    } catch (error: any) {
        console.error('Error requesting rework:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get QC review history for asset
export const getQCReviewHistory = async (req: Request, res: Response) => {
    const { asset_id } = req.params;

    try {
        if (!asset_id) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        const result = await pool.query(
            `SELECT * FROM qc_audit_log 
             WHERE asset_id = ? 
             ORDER BY created_at DESC`,
            [asset_id]
        );

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching QC review history:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get QC statistics
export const getQCStatistics = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(CASE WHEN qc_status = 'QC Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN qc_status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN qc_status = 'Reject' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN qc_status = 'Rework' THEN 1 END) as rework_count,
                COUNT(*) as total_count,
                ROUND(AVG(CASE WHEN qc_score IS NOT NULL THEN qc_score ELSE NULL END), 2) as avg_qc_score
            FROM assets
        `);

        const stats = result.rows[0];

        res.status(200).json({
            pending: stats.pending_count || 0,
            approved: stats.approved_count || 0,
            rejected: stats.rejected_count || 0,
            rework: stats.rework_count || 0,
            total: stats.total_count || 0,
            averageScore: stats.avg_qc_score || 0,
            approvalRate: stats.total_count > 0
                ? Math.round((stats.approved_count / stats.total_count) * 100)
                : 0
        });
    } catch (error: any) {
        console.error('Error fetching QC statistics:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function to parse asset row with JSON fields
function parseAssetRow(asset: any) {
    if (!asset) return null;

    const jsonFields = [
        'keywords', 'content_keywords', 'seo_keywords', 'web_h3_tags',
        'resource_files', 'qc_checklist_items', 'workflow_log', 'linked_service_ids',
        'linked_sub_service_ids', 'static_service_links'
    ];

    const parsed = { ...asset };
    jsonFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                parsed[field] = [];
            }
        }
    });
    return parsed;
}

// Helper function to log QC action
async function logQCAction(
    assetId: number,
    action: string,
    remarks: string | null,
    userId?: number
) {
    try {
        await pool.query(
            `INSERT INTO qc_audit_log (asset_id, user_id, qc_decision, qc_remarks, created_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [assetId, userId || null, action, remarks || null]
        );
    } catch (error) {
        console.error('Error logging QC action:', error);
    }
}
