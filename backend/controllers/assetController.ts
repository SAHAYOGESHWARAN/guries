
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getAssets = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAsset = async (req: any, res: any) => {
    const { name, type, repository, linked_task, owner_id, usage_status, social_meta } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, file_url, description, tags, social_meta, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
            [name, type, repository, linked_task, owner_id, JSON.stringify(social_meta || {})]
        );

        const newAsset = result.rows[0];
        getSocket().emit('asset_created', newAsset);
        res.status(201).json(newAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAsset = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, usage_status, linked_task, repository, type, social_meta } = req.body;

    try {
        const result = await pool.query(
            `UPDATE assets SET 
                asset_name = COALESCE($1, asset_name), 
                tags = COALESCE($2, tags), 
                file_url = COALESCE($3, file_url),
                description = COALESCE($4, description),
                asset_type = COALESCE($5, asset_type),
                social_meta = COALESCE($6, social_meta)
            WHERE id = $7 RETURNING *`,
            [name, usage_status, repository, linked_task, type, JSON.stringify(social_meta || {}), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const updatedAsset = result.rows[0];
        getSocket().emit('asset_updated', updatedAsset);
        res.status(200).json(updatedAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAsset = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM assets WHERE id = $1', [id]);
        getSocket().emit('asset_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Asset Library endpoints
export const getAssetLibrary = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                content_type,
                tags as repository,
                usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                file_size,
                file_type,
                dimensions,
                created_at as date,
                created_at,
                updated_at,
                linked_service_ids,
                linked_sub_service_ids,
                linked_task_id,
                linked_campaign_id,
                linked_project_id,
                linked_service_id,
                linked_sub_service_id,
                linked_repository_item_id,
                application_type,
                keywords,
                seo_score,
                grammar_score,
                qc_score,
                qc_status,
                qc_checklist_items,
                submitted_by,
                submitted_at,
                qc_reviewer_id,
                qc_reviewed_at,
                qc_remarks,
                linking_active,
                rework_count,
                version_number,
                designed_by,
                created_by,
                updated_by,
                web_title,
                web_description,
                web_meta_description,
                web_keywords,
                web_url,
                web_h1,
                web_h2_1,
                web_h2_2,
                web_thumbnail,
                web_body_content,
                smm_platform,
                smm_title,
                smm_tag,
                smm_url,
                smm_description,
                smm_hashtags,
                smm_media_url,
                smm_media_type
            FROM assets 
            ORDER BY created_at DESC
        `);

        // Parse JSON arrays for linked IDs
        const parsed = result.rows.map(row => ({
            ...row,
            repository: row.repository || 'Content Repository',
            usage_status: row.usage_status || 'Available',
            linked_service_ids: row.linked_service_ids ? JSON.parse(row.linked_service_ids) : [],
            linked_sub_service_ids: row.linked_sub_service_ids ? JSON.parse(row.linked_sub_service_ids) : [],
            keywords: row.keywords ? JSON.parse(row.keywords) : []
        }));

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAssetLibraryItem = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                tags as repository,
                usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                file_size,
                file_type,
                created_at as date,
                linked_service_ids,
                linked_sub_service_ids,
                application_type,
                keywords,
                seo_score,
                grammar_score,
                qc_score,
                submitted_by,
                submitted_at,
                qc_reviewer_id,
                qc_reviewed_at,
                qc_remarks,
                linking_active,
                web_title,
                web_description,
                web_keywords,
                web_url,
                web_h1,
                web_h2_1,
                web_h2_2,
                web_thumbnail,
                web_body_content,
                smm_platform,
                smm_title,
                smm_tag,
                smm_url,
                smm_description,
                smm_hashtags,
                smm_media_url,
                smm_media_type,
                updated_at,
                mapped_to,
                rework_count
            FROM asset_library 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = result.rows[0];

        // Parse JSON fields
        const parsed = {
            ...asset,
            linked_service_ids: asset.linked_service_ids ? JSON.parse(asset.linked_service_ids) : [],
            linked_sub_service_ids: asset.linked_sub_service_ids ? JSON.parse(asset.linked_sub_service_ids) : [],
            keywords: asset.keywords ? JSON.parse(asset.keywords) : []
        };

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAssetLibraryItem = async (req: any, res: any) => {
    const {
        name, type, repository, file_url, thumbnail_url, file_size, file_type, date,
        asset_category, asset_format, content_type, status, linked_service_ids, linked_sub_service_ids,
        linked_task_id, linked_campaign_id, linked_project_id, linked_service_id, linked_sub_service_id,
        linked_repository_item_id, designed_by, version_number,
        application_type, keywords, web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
        web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
        smm_hashtags, smm_media_url, smm_media_type, seo_score, grammar_score, submitted_by
    } = req.body;

    // Set default usage_status since it's removed from UI but still in DB
    const usage_status = 'Available';

    try {
        // Validate required fields for submission
        if (!name?.trim()) {
            return res.status(400).json({ error: 'Asset name is required' });
        }

        if (!application_type) {
            return res.status(400).json({ error: 'Application type (WEB, SEO, SMM) is required' });
        }

        // For submission, require SEO and Grammar scores
        if (status === 'Pending QC Review') {
            if (!seo_score || seo_score < 0 || seo_score > 100) {
                return res.status(400).json({ error: 'SEO score (0-100) is required for submission' });
            }
            if (!grammar_score || grammar_score < 0 || grammar_score > 100) {
                return res.status(400).json({ error: 'Grammar score (0-100) is required for submission' });
            }
        }

        // Create workflow log entry
        const workflowLog = [{
            action: status === 'Pending QC Review' ? 'submitted' : 'created',
            timestamp: new Date().toISOString(),
            user_id: submitted_by,
            status: status || 'Draft'
        }];

        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, asset_category, asset_format, content_type, tags, status,
                file_url, og_image_url, thumbnail_url, file_size, file_type,
                linked_service_ids, linked_sub_service_ids, linked_task_id, linked_campaign_id,
                linked_project_id, linked_service_id, linked_sub_service_id, linked_repository_item_id,
                designed_by, version_number, created_at,
                application_type, keywords, web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
                web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
                smm_hashtags, smm_media_url, smm_media_type, seo_score, grammar_score, submitted_by,
                submitted_at, workflow_log, linking_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49) RETURNING *`,
            [
                name, type, asset_category, asset_format, content_type || null, repository, status || 'Draft',
                file_url || null, thumbnail_url || null, thumbnail_url || null, file_size || null, file_type || null,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                linked_task_id || null, linked_campaign_id || null, linked_project_id || null,
                linked_service_id || null, linked_sub_service_id || null, linked_repository_item_id || null,
                designed_by || null, version_number || 'v1.0',
                date || new Date().toISOString(),
                application_type || null, keywords ? JSON.stringify(keywords) : null,
                web_title || null, web_description || null, web_meta_description || null, web_keywords || null, web_url || null, web_h1 || null, web_h2_1 || null, web_h2_2 || null,
                web_thumbnail || null, web_body_content || null, smm_platform || null, smm_title || null, smm_tag || null, smm_url || null, smm_description || null,
                smm_hashtags || null, smm_media_url || null, smm_media_type || null, seo_score || null, grammar_score || null, submitted_by || null,
                status === 'Pending QC Review' ? new Date().toISOString() : null,
                JSON.stringify(workflowLog), 0
            ]
        );

        // If RETURNING didn't work, do a separate SELECT
        if (!result.rows || result.rows.length === 0 || !result.rows[0]) {
            // Get the last inserted asset by name and created_at (since we just created it)
            const selectResult = await pool.query(
                `SELECT * FROM assets WHERE asset_name = $1 AND created_at >= $2 ORDER BY id DESC LIMIT 1`,
                [name, new Date(Date.now() - 5000).toISOString()] // Within last 5 seconds
            );

            if (!selectResult.rows || selectResult.rows.length === 0) {
                return res.status(500).json({ error: 'Asset created but could not retrieve data' });
            }

            result.rows = selectResult.rows;
        }

        const rawAsset = result.rows[0];
        const newAsset = {
            ...rawAsset,
            name: rawAsset.asset_name || rawAsset.name,
            type: rawAsset.asset_type || rawAsset.type,
            repository: rawAsset.tags || rawAsset.repository || 'Content Repository',
            usage_status: rawAsset.usage_status || 'Available',
            thumbnail_url: rawAsset.og_image_url || rawAsset.thumbnail_url || rawAsset.file_url,
            date: rawAsset.created_at || rawAsset.date,
            linked_service_ids: rawAsset.linked_service_ids ? JSON.parse(rawAsset.linked_service_ids) : [],
            linked_sub_service_ids: rawAsset.linked_sub_service_ids ? JSON.parse(rawAsset.linked_sub_service_ids) : [],
            keywords: rawAsset.keywords ? JSON.parse(rawAsset.keywords) : []
        };

        getSocket().emit('assetLibrary_created', newAsset);
        res.status(201).json(newAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAssetLibraryItem = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        name, type, repository, file_url, thumbnail_url, linked_service_ids, linked_sub_service_ids,
        asset_category, asset_format, content_type, status, keywords, seo_score, grammar_score,
        linked_task_id, linked_campaign_id, linked_project_id, linked_service_id, linked_sub_service_id,
        linked_repository_item_id, designed_by, version_number,
        application_type, web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
        web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
        smm_hashtags, smm_media_url, smm_media_type
    } = req.body;

    // Set default usage_status since it's removed from UI but still in DB
    const usage_status = 'Available';

    try {
        const result = await pool.query(
            `UPDATE assets SET 
                asset_name = COALESCE($1, asset_name), 
                asset_type = COALESCE($2, asset_type),
                asset_category = COALESCE($3, asset_category),
                asset_format = COALESCE($4, asset_format),
                content_type = COALESCE($5, content_type),
                tags = COALESCE($6, tags),
                usage_status = COALESCE($7, usage_status),
                status = COALESCE($8, status),
                file_url = COALESCE($9, file_url),
                og_image_url = COALESCE($10, og_image_url),
                thumbnail_url = COALESCE($11, thumbnail_url),
                linked_service_ids = COALESCE($12, linked_service_ids),
                linked_sub_service_ids = COALESCE($13, linked_sub_service_ids),
                keywords = COALESCE($14, keywords),
                seo_score = COALESCE($15, seo_score),
                grammar_score = COALESCE($16, grammar_score),
                application_type = COALESCE($17, application_type),
                web_title = COALESCE($18, web_title),
                web_description = COALESCE($19, web_description),
                web_meta_description = COALESCE($20, web_meta_description),
                web_keywords = COALESCE($21, web_keywords),
                web_url = COALESCE($22, web_url),
                web_h1 = COALESCE($23, web_h1),
                web_h2_1 = COALESCE($24, web_h2_1),
                web_h2_2 = COALESCE($25, web_h2_2),
                web_thumbnail = COALESCE($26, web_thumbnail),
                web_body_content = COALESCE($27, web_body_content),
                smm_platform = COALESCE($28, smm_platform),
                smm_title = COALESCE($29, smm_title),
                smm_tag = COALESCE($30, smm_tag),
                smm_url = COALESCE($31, smm_url),
                smm_description = COALESCE($32, smm_description),
                smm_hashtags = COALESCE($33, smm_hashtags),
                smm_media_url = COALESCE($34, smm_media_url),
                smm_media_type = COALESCE($35, smm_media_type),
                linked_task_id = COALESCE($36, linked_task_id),
                linked_campaign_id = COALESCE($37, linked_campaign_id),
                linked_project_id = COALESCE($38, linked_project_id),
                linked_service_id = COALESCE($39, linked_service_id),
                linked_sub_service_id = COALESCE($40, linked_sub_service_id),
                linked_repository_item_id = COALESCE($41, linked_repository_item_id),
                designed_by = COALESCE($42, designed_by),
                version_number = COALESCE($43, version_number),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $44 RETURNING 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                content_type,
                tags as repository,
                usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                file_size,
                file_type,
                created_at as date,
                linked_service_ids,
                linked_sub_service_ids,
                linked_task_id,
                linked_campaign_id,
                linked_project_id,
                linked_service_id,
                linked_sub_service_id,
                linked_repository_item_id,
                keywords, seo_score, grammar_score, qc_score, qc_status, qc_checklist_items,
                application_type,
                web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2, web_thumbnail, web_body_content,
                smm_platform, smm_title, smm_tag, smm_url, smm_description, smm_hashtags, smm_media_url, smm_media_type,
                submitted_by, submitted_at, qc_reviewer_id, qc_reviewed_at, qc_remarks, linking_active, rework_count, version_number, designed_by`,
            [
                name, type, asset_category, asset_format, content_type || null, repository, usage_status, status,
                file_url, thumbnail_url, thumbnail_url,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                keywords ? JSON.stringify(keywords) : null, seo_score, grammar_score,
                application_type, web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
                web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
                smm_hashtags, smm_media_url, smm_media_type,
                linked_task_id || null, linked_campaign_id || null, linked_project_id || null,
                linked_service_id || null, linked_sub_service_id || null, linked_repository_item_id || null,
                designed_by || null, version_number || null, id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const rawAsset = result.rows[0];
        const updatedAsset = {
            ...rawAsset,
            name: rawAsset.asset_name || rawAsset.name,
            type: rawAsset.asset_type || rawAsset.type,
            repository: rawAsset.tags || rawAsset.repository || 'Content Repository',
            usage_status: rawAsset.usage_status || 'Available',
            thumbnail_url: rawAsset.og_image_url || rawAsset.thumbnail_url || rawAsset.file_url,
            date: rawAsset.created_at || rawAsset.date,
            linked_service_ids: rawAsset.linked_service_ids ? JSON.parse(rawAsset.linked_service_ids) : [],
            linked_sub_service_ids: rawAsset.linked_sub_service_ids ? JSON.parse(rawAsset.linked_sub_service_ids) : [],
            keywords: rawAsset.keywords ? JSON.parse(rawAsset.keywords) : []
        };

        getSocket().emit('assetLibrary_updated', updatedAsset);
        res.status(200).json(updatedAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAssetLibraryItem = async (req: any, res: any) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid asset ID' });
    }

    try {
        // Check if asset exists first
        const existingAsset = await pool.query('SELECT id FROM assets WHERE id = $1', [numericId]);
        if (existingAsset.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        await pool.query('DELETE FROM assets WHERE id = $1', [numericId]);
        getSocket().emit('assetLibrary_deleted', { id: numericId });
        res.status(204).send();
    } catch (error: any) {
        console.error('Delete asset error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Submit asset for QC approval
export const submitAssetForQC = async (req: any, res: any) => {
    const { id } = req.params;
    const { seo_score, grammar_score, submitted_by, rework_count } = req.body;

    try {
        // Get current asset data
        const currentAsset = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
        if (currentAsset.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const assetData = currentAsset.rows[0];
        let workflowLog = [];
        try {
            workflowLog = assetData.workflow_log ? JSON.parse(assetData.workflow_log) : [];
        } catch (e) {
            workflowLog = [];
        }

        const newReworkCount = rework_count || assetData.rework_count || 0;

        workflowLog.push({
            action: 'submitted_for_qc',
            timestamp: new Date().toISOString(),
            user_id: submitted_by,
            status: 'Pending QC Review',
            rework_count: newReworkCount
        });

        await pool.query(
            `UPDATE assets SET 
                status = 'Pending QC Review',
                seo_score = COALESCE($1, seo_score),
                grammar_score = COALESCE($2, grammar_score),
                submitted_by = $3,
                submitted_at = datetime('now'),
                workflow_log = $4,
                rework_count = $5,
                updated_at = datetime('now')
            WHERE id = $6`,
            [seo_score || null, grammar_score || null, submitted_by, JSON.stringify(workflowLog), newReworkCount, id]
        );

        // Get the updated asset
        const result = await pool.query('SELECT id, asset_name as name, status, seo_score, grammar_score, submitted_at, rework_count FROM assets WHERE id = $1', [id]);

        // Create notification for admins about new QC submission
        try {
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES ($1, $2, $3, $4, $5, datetime(\'now\'))',
                [null, 'New QC Submission', `Asset "${assetData.asset_name}" has been submitted for QC review.`, 'info', 0]
            );
            getSocket().emit('notification_created', {
                title: 'New QC Submission',
                message: `Asset "${assetData.asset_name}" has been submitted for QC review.`,
                type: 'info',
                is_read: false
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        getSocket().emit('assetLibrary_submitted_for_qc', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        console.error('Submit for QC error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get assets pending QC review
export const getAssetsForQC = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                tags as repository,
                usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                application_type,
                web_title,
                web_description,
                web_keywords,
                web_url,
                web_h1,
                web_h2_1,
                web_h2_2,
                web_body_content,
                smm_platform,
                smm_description,
                smm_hashtags,
                smm_media_url,
                seo_score,
                grammar_score,
                submitted_by,
                submitted_at,
                qc_score,
                qc_remarks,
                rework_count,
                linked_service_ids,
                linked_sub_service_ids,
                created_at as date
            FROM assets 
            WHERE status IN ('Pending QC Review', 'Rework Required')
            ORDER BY submitted_at ASC
        `);

        // Parse JSON arrays for linked IDs
        const parsed = result.rows.map(row => ({
            ...row,
            rework_count: row.rework_count || 0,
            linked_service_ids: row.linked_service_ids ? JSON.parse(row.linked_service_ids) : [],
            linked_sub_service_ids: row.linked_sub_service_ids ? JSON.parse(row.linked_sub_service_ids) : []
        }));

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// QC Review - Approve, Reject, or Rework asset (Admin only)
export const reviewAsset = async (req: any, res: any) => {
    const { id } = req.params;
    const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, checklist_completion, checklist_items, user_role } = req.body;

    try {
        // Role-based access control - only admins can perform QC review
        // Accept both 'admin' and 'Admin' (case-insensitive)
        if (!user_role || user_role.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Only administrators can perform QC reviews.' });
        }

        // Validate QC decision
        if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
            return res.status(400).json({ error: 'QC decision must be "approved", "rejected", or "rework"' });
        }

        // Validate QC score - make it optional for reject/rework
        const finalQcScore = qc_score || 0;

        // Get current asset data including rework count
        const currentAsset = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
        if (currentAsset.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const assetData = currentAsset.rows[0];
        let workflowLog = [];
        try {
            workflowLog = assetData.workflow_log ? JSON.parse(assetData.workflow_log) : [];
        } catch (e) {
            workflowLog = [];
        }
        const currentReworkCount = assetData.rework_count || 0;

        // Determine new status and rework count
        let newStatus: string;
        let newReworkCount = currentReworkCount;
        let actionType: string;

        switch (qc_decision) {
            case 'approved':
                newStatus = 'QC Approved';
                actionType = 'qc_approved';
                break;
            case 'rejected':
                newStatus = 'QC Rejected';
                actionType = 'qc_rejected';
                break;
            case 'rework':
                newStatus = 'Rework Required';
                actionType = 'qc_rework_requested';
                newReworkCount = currentReworkCount + 1;
                break;
            default:
                return res.status(400).json({ error: 'Invalid QC decision' });
        }

        workflowLog.push({
            action: actionType,
            timestamp: new Date().toISOString(),
            user_id: qc_reviewer_id,
            status: newStatus,
            qc_score: finalQcScore,
            remarks: qc_remarks,
            rework_count: newReworkCount
        });

        // If approved, activate linking to service/sub-service
        const linkingActive = qc_decision === 'approved' ? 1 : 0;

        // Determine qc_status based on decision
        const qcStatus = qc_decision === 'approved' ? 'Pass' : qc_decision === 'rejected' ? 'Fail' : 'Rework';

        // Update the asset with QC review data
        const result = await pool.query(
            `UPDATE assets SET 
                status = $1,
                qc_score = $2,
                qc_remarks = $3,
                qc_reviewer_id = $4,
                qc_reviewed_at = datetime('now'),
                qc_checklist_completion = $5,
                linking_active = $6,
                workflow_log = $7,
                rework_count = $8,
                updated_at = datetime('now')
            WHERE id = $9`,
            [newStatus, finalQcScore, qc_remarks || '', qc_reviewer_id, checklist_completion ? 1 : 0, linkingActive, JSON.stringify(workflowLog), newReworkCount, id]
        );

        // Get the updated asset
        const updatedAsset = await pool.query('SELECT id, asset_name as name, status, qc_score, qc_remarks, qc_reviewed_at, linking_active, rework_count, submitted_by FROM assets WHERE id = $1', [id]);

        // Create QC review record with checklist items
        try {
            await pool.query(
                `INSERT INTO asset_qc_reviews (
                    asset_id, qc_reviewer_id, qc_score, checklist_completion, qc_remarks, qc_decision, checklist_items, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now'))`,
                [id, qc_reviewer_id, finalQcScore, checklist_completion ? 1 : 0, qc_remarks || '', qc_decision, JSON.stringify(checklist_items || {})]
            );
        } catch (insertError) {
            // Log but don't fail if the review record insert fails
            console.error('Failed to insert QC review record:', insertError);
        }

        // Create notification for the asset owner
        const notificationText = qc_decision === 'approved'
            ? `Your asset "${assetData.asset_name}" has been approved!`
            : qc_decision === 'rework'
                ? `Your asset "${assetData.asset_name}" requires rework. Please review the feedback.`
                : `Your asset "${assetData.asset_name}" has been rejected.`;

        const notificationType = qc_decision === 'approved' ? 'success' : qc_decision === 'rework' ? 'warning' : 'error';

        try {
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES ($1, $2, $3, $4, $5, datetime(\'now\'))',
                [assetData.submitted_by, 'QC Review Update', notificationText, notificationType, 0]
            );
            // Emit notification via socket
            getSocket().emit('notification_created', {
                title: 'QC Review Update',
                message: notificationText,
                type: notificationType,
                user_id: assetData.submitted_by,
                is_read: false
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        // If approved, create service/sub-service asset links
        if (qc_decision === 'approved') {
            let linkedServiceIds: number[] = [];
            let linkedSubServiceIds: number[] = [];

            try {
                linkedServiceIds = assetData.linked_service_ids
                    ? JSON.parse(assetData.linked_service_ids)
                    : [];
            } catch (e) {
                linkedServiceIds = [];
            }

            try {
                linkedSubServiceIds = assetData.linked_sub_service_ids
                    ? JSON.parse(assetData.linked_sub_service_ids)
                    : [];
            } catch (e) {
                linkedSubServiceIds = [];
            }

            // Create service-asset links (SQLite compatible - use INSERT OR IGNORE)
            for (const serviceId of linkedServiceIds) {
                try {
                    await pool.query(
                        `INSERT OR IGNORE INTO service_asset_links (service_id, asset_id) VALUES ($1, $2)`,
                        [serviceId, id]
                    );
                } catch (e) {
                    // Ignore duplicate errors
                }
            }

            // Create sub-service-asset links
            for (const subServiceId of linkedSubServiceIds) {
                try {
                    await pool.query(
                        `INSERT OR IGNORE INTO subservice_asset_links (sub_service_id, asset_id) VALUES ($1, $2)`,
                        [subServiceId, id]
                    );
                } catch (e) {
                    // Ignore duplicate errors
                }
            }

            // Update asset count on linked services (SQLite compatible)
            for (const serviceId of linkedServiceIds) {
                try {
                    await pool.query(
                        `UPDATE services SET asset_count = COALESCE(asset_count, 0) + 1 WHERE id = $1`,
                        [serviceId]
                    );
                } catch (e) {
                    // Ignore errors
                }
            }
        }

        getSocket().emit('assetLibrary_qc_reviewed', updatedAsset.rows[0]);
        res.status(200).json(updatedAsset.rows[0]);
    } catch (error: any) {
        console.error('QC Review error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit QC review' });
    }
};

// Generate AI scores for SEO and Grammar
export const generateAIScores = async (req: any, res: any) => {
    const { content, keywords, title, description } = req.body;

    try {
        // Mock AI scoring - in real implementation, integrate with AI service
        const seoScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const grammarScore = Math.floor(Math.random() * 20) + 80; // 80-100

        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.status(200).json({
            seo_score: seoScore,
            grammar_score: grammarScore,
            analysis: {
                seo_feedback: seoScore < 80 ? 'Consider adding more relevant keywords and improving meta descriptions' : 'Good SEO optimization',
                grammar_feedback: grammarScore < 90 ? 'Minor grammar improvements needed' : 'Excellent grammar and readability'
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// User Edit Asset (Only during QC review stage)
export const editAssetInQC = async (req: any, res: any) => {
    const { id } = req.params;
    const { user_role, user_id, ...updateData } = req.body;

    try {
        // Check if asset is in QC review stage
        const assetCheck = await pool.query('SELECT status, submitted_by FROM assets WHERE id = $1', [id]);
        if (assetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = assetCheck.rows[0];

        // Only allow editing if asset is in QC review stage
        if (!['Pending QC Review', 'Rework Required'].includes(asset.status)) {
            return res.status(400).json({ error: 'Asset can only be edited during QC review stage' });
        }

        // Users can only edit their own assets
        if (user_role === 'user' && asset.submitted_by !== user_id) {
            return res.status(403).json({ error: 'You can only edit assets you submitted' });
        }

        // Update the asset
        const result = await updateAssetLibraryItem(req, res);
        return result;
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// User Delete Asset (Only during QC review stage)
export const deleteAssetInQC = async (req: any, res: any) => {
    const { id } = req.params;
    const { user_role, user_id } = req.body;

    try {
        // Check if asset is in QC review stage
        const assetCheck = await pool.query('SELECT status, submitted_by FROM assets WHERE id = $1', [id]);
        if (assetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = assetCheck.rows[0];

        // Only allow deletion if asset is in QC review stage
        if (!['Pending QC Review', 'Rework Required'].includes(asset.status)) {
            return res.status(400).json({ error: 'Asset can only be deleted during QC review stage' });
        }

        // Users can only delete their own assets
        if (user_role === 'user' && asset.submitted_by !== user_id) {
            return res.status(403).json({ error: 'You can only delete assets you submitted' });
        }

        // Delete the asset
        await pool.query('DELETE FROM assets WHERE id = $1', [id]);
        getSocket().emit('assetLibrary_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
