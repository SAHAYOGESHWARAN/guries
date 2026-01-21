import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// =====================================================
// SEO ASSET MODULE - 12-STEP WORKFLOW CONTROLLER
// =====================================================

// Get all SEO Assets
export const getSeoAssets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.*,
                a.asset_name as name,
                a.asset_type as type,
                u1.name as created_by_name,
                u2.name as verified_by_name,
                u3.name as designed_by_name
            FROM assets a
            LEFT JOIN users u1 ON a.created_by = u1.id
            LEFT JOIN users u2 ON a.verified_by = u2.id
            LEFT JOIN users u3 ON a.designed_by = u3.id
            WHERE a.application_type = 'seo'
            ORDER BY a.created_at DESC
        `);

        const parsed = result.rows.map((row: any) => ({
            ...row,
            asset_id: `SEO-${String(row.id).padStart(4, '0')}`, // Auto-generated SEO Asset ID
            keywords: row.keywords ? JSON.parse(row.keywords) : [],
            seo_keywords: row.seo_keywords ? JSON.parse(row.seo_keywords) : [],
            seo_lsi_keywords: row.seo_lsi_keywords ? JSON.parse(row.seo_lsi_keywords) : [],
            lsi_keywords: row.seo_lsi_keywords ? JSON.parse(row.seo_lsi_keywords) : [], // Alias for frontend
            resource_files: row.resource_files ? JSON.parse(row.resource_files) : [],
            version_history: row.version_history ? JSON.parse(row.version_history) : [],
            seo_domains: row.seo_domains ? JSON.parse(row.seo_domains) : [],
            assigned_team_members: row.assigned_team_members ? JSON.parse(row.assigned_team_members) : []
        }));

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get single SEO Asset by ID
export const getSeoAssetById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                a.*,
                a.asset_name as name,
                a.asset_type as type,
                u1.name as created_by_name,
                u2.name as verified_by_name,
                u3.name as designed_by_name
            FROM assets a
            LEFT JOIN users u1 ON a.created_by = u1.id
            LEFT JOIN users u2 ON a.verified_by = u2.id
            LEFT JOIN users u3 ON a.designed_by = u3.id
            WHERE a.id = ? AND a.application_type = 'seo'
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'SEO Asset not found' });
        }

        const row = result.rows[0];
        const parsed = {
            ...row,
            asset_id: `SEO-${String(row.id).padStart(4, '0')}`, // Auto-generated SEO Asset ID
            keywords: row.keywords ? JSON.parse(row.keywords) : [],
            seo_keywords: row.seo_keywords ? JSON.parse(row.seo_keywords) : [],
            seo_lsi_keywords: row.seo_lsi_keywords ? JSON.parse(row.seo_lsi_keywords) : [],
            lsi_keywords: row.seo_lsi_keywords ? JSON.parse(row.seo_lsi_keywords) : [], // Alias for frontend
            resource_files: row.resource_files ? JSON.parse(row.resource_files) : [],
            version_history: row.version_history ? JSON.parse(row.version_history) : [],
            seo_domains: row.seo_domains ? JSON.parse(row.seo_domains) : [],
            assigned_team_members: row.assigned_team_members ? JSON.parse(row.assigned_team_members) : []
        };

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


// Create SEO Asset - Step 1-12 Workflow
export const createSeoAsset = async (req: Request, res: Response) => {
    const {
        // Step 1: Asset ID Selection (existing asset to link)
        linked_asset_id,

        // Step 2: Map Assets to Source Work
        linked_task_id,
        linked_campaign_id,
        linked_project_id,
        linked_service_id,
        linked_sub_service_id,
        linked_repository_item_id,

        // Step 3: Asset Classification
        asset_type,
        asset_category,
        sector_id,
        industry_id,

        // Step 4: SEO Metadata & Anchor Text
        seo_title,
        seo_meta_title,
        seo_description,
        service_url,
        blog_url,
        anchor_text,

        // Step 5: Keywords
        primary_keyword_id,
        lsi_keywords,

        // Step 6: Domain Type & Domains
        domain_type,
        seo_domains, // Array of domain objects

        // Step 8: Blog Content (conditional)
        blog_content,

        // Step 9: Resource Files
        resource_files,

        // Step 10: Designer & Workflow
        assigned_team_members,
        created_by,
        verified_by,

        // Other fields
        name,
        status
    } = req.body;

    try {
        // Validate required fields based on workflow step
        if (!name?.trim() && !seo_title?.trim()) {
            return res.status(400).json({ error: 'Asset name or SEO title is required' });
        }

        // Create version history entry
        const versionHistory = [{
            version: 'v1.0',
            date: new Date().toISOString(),
            action: 'Created',
            user_id: created_by
        }];

        // Create workflow log entry
        const workflowLog = [{
            action: 'created',
            timestamp: new Date().toISOString(),
            user_id: created_by,
            status: status || 'Draft',
            workflow_stage: 'Add'
        }];

        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, asset_category, application_type, status, workflow_stage,
                linked_task_id, linked_campaign_id, linked_project_id,
                linked_service_id, linked_sub_service_id, linked_repository_item_id,
                seo_title, seo_meta_title, seo_description, seo_service_url, seo_blog_url,
                seo_anchor_text, seo_primary_keyword_id, seo_lsi_keywords,
                seo_domain_type, seo_domains, seo_blog_content,
                seo_sector_id, seo_industry_id,
                resource_files, assigned_team_members,
                created_by, verified_by, version_number, version_history, workflow_log,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name || seo_title,
                asset_type || null,
                asset_category || null,
                'seo',
                status || 'Draft',
                'Add',
                linked_task_id || null,
                linked_campaign_id || null,
                linked_project_id || null,
                linked_service_id || null,
                linked_sub_service_id || null,
                linked_repository_item_id || null,
                seo_title || null,
                seo_meta_title || null,
                seo_description || null,
                service_url || null,
                blog_url || null,
                anchor_text || null,
                primary_keyword_id || null,
                lsi_keywords ? JSON.stringify(lsi_keywords) : null,
                domain_type || null,
                seo_domains ? JSON.stringify(seo_domains) : null,
                blog_content || null,
                sector_id || null,
                industry_id || null,
                resource_files ? JSON.stringify(resource_files) : null,
                assigned_team_members ? JSON.stringify(assigned_team_members) : null,
                created_by || null,
                verified_by || null,
                'v1.0',
                JSON.stringify(versionHistory),
                JSON.stringify(workflowLog),
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        const newAsset = result.rows[0];
        getSocket().emit('seoAsset_created', newAsset);
        res.status(201).json(newAsset);
    } catch (error: any) {
        console.error('Create SEO Asset error:', error);
        res.status(500).json({ error: error.message });
    }
};


// Update SEO Asset
export const updateSeoAsset = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        // Step 2: Map Assets to Source Work
        linked_task_id,
        linked_campaign_id,
        linked_project_id,
        linked_service_id,
        linked_sub_service_id,
        linked_repository_item_id,

        // Step 3: Asset Classification
        asset_type,
        asset_category,
        sector_id,
        industry_id,

        // Step 4: SEO Metadata & Anchor Text
        seo_title,
        seo_meta_title,
        seo_description,
        service_url,
        blog_url,
        anchor_text,

        // Step 5: Keywords
        primary_keyword_id,
        lsi_keywords,

        // Step 6: Domain Type & Domains
        domain_type,
        seo_domains,

        // Step 8: Blog Content
        blog_content,

        // Step 9: Resource Files
        resource_files,

        // Step 10: Designer & Workflow
        assigned_team_members,
        verified_by,

        // Workflow
        workflow_stage,
        qc_status,
        status,

        // Other
        name,
        updated_by
    } = req.body;

    try {
        // Get current asset for version history
        const currentAsset = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        if (currentAsset.rows.length === 0) {
            return res.status(404).json({ error: 'SEO Asset not found' });
        }

        const existing = currentAsset.rows[0];

        // Update version history
        let versionHistory = [];
        try {
            versionHistory = existing.version_history ? JSON.parse(existing.version_history) : [];
        } catch (e) {
            versionHistory = [];
        }

        // Increment version on update
        const currentVersion = existing.version_number || 'v1.0';
        const versionNum = parseFloat(currentVersion.replace('v', ''));
        const newVersion = `v${(versionNum + 0.1).toFixed(1)}`;

        versionHistory.push({
            version: newVersion,
            date: new Date().toISOString(),
            action: 'Updated',
            user_id: updated_by
        });

        const result = await pool.query(
            `UPDATE assets SET
                asset_name = COALESCE(?, asset_name),
                asset_type = COALESCE(?, asset_type),
                asset_category = COALESCE(?, asset_category),
                linked_task_id = COALESCE(?, linked_task_id),
                linked_campaign_id = COALESCE(?, linked_campaign_id),
                linked_project_id = COALESCE(?, linked_project_id),
                linked_service_id = COALESCE(?, linked_service_id),
                linked_sub_service_id = COALESCE(?, linked_sub_service_id),
                linked_repository_item_id = COALESCE(?, linked_repository_item_id),
                seo_title = COALESCE(?, seo_title),
                seo_meta_title = COALESCE(?, seo_meta_title),
                seo_description = COALESCE(?, seo_description),
                seo_service_url = COALESCE(?, seo_service_url),
                seo_blog_url = COALESCE(?, seo_blog_url),
                seo_anchor_text = COALESCE(?, seo_anchor_text),
                seo_primary_keyword_id = COALESCE(?, seo_primary_keyword_id),
                seo_lsi_keywords = COALESCE(?, seo_lsi_keywords),
                seo_domain_type = COALESCE(?, seo_domain_type),
                seo_domains = COALESCE(?, seo_domains),
                seo_blog_content = COALESCE(?, seo_blog_content),
                seo_sector_id = COALESCE(?, seo_sector_id),
                seo_industry_id = COALESCE(?, seo_industry_id),
                resource_files = COALESCE(?, resource_files),
                assigned_team_members = COALESCE(?, assigned_team_members),
                verified_by = COALESCE(?, verified_by),
                workflow_stage = COALESCE(?, workflow_stage),
                qc_status = COALESCE(?, qc_status),
                status = COALESCE(?, status),
                version_number = ?,
                version_history = ?,
                updated_by = ?,
                updated_at = ?
            WHERE id = ? AND application_type = 'seo'`,
            [
                name || seo_title,
                asset_type,
                asset_category,
                linked_task_id,
                linked_campaign_id,
                linked_project_id,
                linked_service_id,
                linked_sub_service_id,
                linked_repository_item_id,
                seo_title,
                seo_meta_title,
                seo_description,
                service_url,
                blog_url,
                anchor_text,
                primary_keyword_id,
                lsi_keywords ? JSON.stringify(lsi_keywords) : null,
                domain_type,
                seo_domains ? JSON.stringify(seo_domains) : null,
                blog_content,
                sector_id,
                industry_id,
                resource_files ? JSON.stringify(resource_files) : null,
                assigned_team_members ? JSON.stringify(assigned_team_members) : null,
                verified_by,
                workflow_stage,
                qc_status,
                status,
                newVersion,
                JSON.stringify(versionHistory),
                updated_by,
                new Date().toISOString(),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'SEO Asset not found' });
        }

        const updatedAsset = result.rows[0];
        getSocket().emit('seoAsset_updated', updatedAsset);
        res.status(200).json(updatedAsset);
    } catch (error: any) {
        console.error('Update SEO Asset error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete SEO Asset
export const deleteSeoAsset = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Delete related records first
        await pool.query('DELETE FROM seo_asset_domains WHERE seo_asset_id = ?', [id]);

        const result = await pool.query(
            'DELETE FROM assets WHERE id = ? AND application_type = ? RETURNING id',
            [id, 'seo']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'SEO Asset not found' });
        }

        getSocket().emit('seoAsset_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


// Submit SEO Asset for QC (Step 12)
export const submitSeoAssetForQC = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { submitted_by } = req.body;

    try {
        // Get current asset
        const currentAsset = await pool.query('SELECT * FROM assets WHERE id = ? AND application_type = ?', [id, 'seo']);
        if (currentAsset.rows.length === 0) {
            return res.status(404).json({ error: 'SEO Asset not found' });
        }

        const existing = currentAsset.rows[0];

        // Validate required fields before submission
        if (!existing.seo_title && !existing.asset_name) {
            return res.status(400).json({ error: 'Title is required for submission' });
        }
        if (!existing.seo_meta_title) {
            return res.status(400).json({ error: 'Meta Title is required for submission' });
        }
        if (!existing.seo_description) {
            return res.status(400).json({ error: 'Description is required for submission' });
        }
        if (!existing.seo_anchor_text) {
            return res.status(400).json({ error: 'Anchor Text is required for submission' });
        }
        if (!existing.seo_primary_keyword_id) {
            return res.status(400).json({ error: 'Primary Keyword is required for submission' });
        }

        // Update version history
        let versionHistory = [];
        try {
            versionHistory = existing.version_history ? JSON.parse(existing.version_history) : [];
        } catch (e) {
            versionHistory = [];
        }

        const currentVersion = existing.version_number || 'v1.0';
        const versionNum = parseFloat(currentVersion.replace('v', ''));
        const newVersion = `v${(versionNum + 0.1).toFixed(1)}`;

        versionHistory.push({
            version: newVersion,
            date: new Date().toISOString(),
            action: 'Submitted for QC',
            user_id: submitted_by
        });

        // Update workflow log
        let workflowLog = [];
        try {
            workflowLog = existing.workflow_log ? JSON.parse(existing.workflow_log) : [];
        } catch (e) {
            workflowLog = [];
        }

        workflowLog.push({
            action: 'submitted_for_qc',
            timestamp: new Date().toISOString(),
            user_id: submitted_by,
            status: 'Pending QC Review',
            workflow_stage: 'Sent to QC'
        });

        await pool.query(
            `UPDATE assets SET
                status = 'Pending QC Review',
                workflow_stage = 'Sent to QC',
                qc_status = 'QC Pending',
                submitted_by = ?,
                submitted_at = ?,
                version_number = ?,
                version_history = ?,
                workflow_log = ?,
                updated_at = ?
            WHERE id = ?`,
            [
                submitted_by,
                new Date().toISOString(),
                newVersion,
                JSON.stringify(versionHistory),
                JSON.stringify(workflowLog),
                new Date().toISOString(),
                id
            ]
        );

        const updatedResult = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        const updatedAsset = updatedResult.rows[0];

        getSocket().emit('seoAsset_submitted', updatedAsset);
        res.status(200).json({ message: 'SEO Asset submitted for QC successfully', asset: updatedAsset });
    } catch (error: any) {
        console.error('Submit SEO Asset for QC error:', error);
        res.status(500).json({ error: error.message });
    }
};

// QC Review SEO Asset (Step 7 - Domain Details QC)
export const reviewSeoAsset = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { qc_status, qc_remarks, qc_score, qc_reviewer_id } = req.body;

    try {
        const currentAsset = await pool.query('SELECT * FROM assets WHERE id = ? AND application_type = ?', [id, 'seo']);
        if (currentAsset.rows.length === 0) {
            return res.status(404).json({ error: 'SEO Asset not found' });
        }

        const existing = currentAsset.rows[0];

        // Map QC status to display status (Step 7.3)
        let displayStatus = 'Pending';
        let newWorkflowStage = existing.workflow_stage;
        let newStatus = existing.status;

        if (qc_status === 'Pass' || qc_status === 'Approved') {
            displayStatus = 'Approved';
            newWorkflowStage = 'Published';
            newStatus = 'QC Approved';
        } else if (qc_status === 'Fail' || qc_status === 'Rejected') {
            displayStatus = 'Rejected';
            newWorkflowStage = 'In Rework';
            newStatus = 'QC Rejected';
        } else if (qc_status === 'Waiting' || qc_status === 'Pending') {
            displayStatus = 'Pending';
        }

        // Handle rework count increment on rejection
        let reworkCount = existing.rework_count || 0;
        if (qc_status === 'Fail' || qc_status === 'Rejected' || qc_status === 'Rework') {
            reworkCount += 1;
        }

        // Update version history for rework (Step 11)
        let versionHistory = [];
        try {
            versionHistory = existing.version_history ? JSON.parse(existing.version_history) : [];
        } catch (e) {
            versionHistory = [];
        }

        if (qc_status === 'Fail' || qc_status === 'Rejected' || qc_status === 'Rework') {
            const currentVersion = existing.version_number || 'v1.0';
            const versionNum = parseFloat(currentVersion.replace('v', ''));
            const newVersion = `v${(versionNum + 0.1).toFixed(1)}`;

            versionHistory.push({
                version: newVersion,
                date: new Date().toISOString(),
                action: 'Sent for Rework',
                user_id: qc_reviewer_id,
                qc_remarks: qc_remarks
            });

            await pool.query(
                `UPDATE assets SET
                    qc_status = ?,
                    qc_remarks = ?,
                    qc_score = ?,
                    qc_reviewer_id = ?,
                    qc_reviewed_at = ?,
                    workflow_stage = ?,
                    status = ?,
                    rework_count = ?,
                    version_number = ?,
                    version_history = ?,
                    updated_at = ?
                WHERE id = ?`,
                [
                    qc_status,
                    qc_remarks,
                    qc_score,
                    qc_reviewer_id,
                    new Date().toISOString(),
                    newWorkflowStage,
                    newStatus,
                    reworkCount,
                    newVersion,
                    JSON.stringify(versionHistory),
                    new Date().toISOString(),
                    id
                ]
            );
        } else {
            await pool.query(
                `UPDATE assets SET
                    qc_status = ?,
                    qc_remarks = ?,
                    qc_score = ?,
                    qc_reviewer_id = ?,
                    qc_reviewed_at = ?,
                    workflow_stage = ?,
                    status = ?,
                    linking_active = ?,
                    updated_at = ?
                WHERE id = ?`,
                [
                    qc_status,
                    qc_remarks,
                    qc_score,
                    qc_reviewer_id,
                    new Date().toISOString(),
                    newWorkflowStage,
                    newStatus,
                    qc_status === 'Pass' || qc_status === 'Approved' ? 1 : 0,
                    new Date().toISOString(),
                    id
                ]
            );
        }

        // Create QC review record
        await pool.query(
            `INSERT INTO asset_qc_reviews (asset_id, qc_reviewer_id, qc_score, qc_remarks, qc_decision, reviewed_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, qc_reviewer_id, qc_score, qc_remarks, qc_status, new Date().toISOString(), new Date().toISOString()]
        );

        const updatedResult = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
        const updatedAsset = updatedResult.rows[0];

        getSocket().emit('seoAsset_reviewed', updatedAsset);
        res.status(200).json({ message: 'QC Review completed', asset: updatedAsset, displayStatus });
    } catch (error: any) {
        console.error('Review SEO Asset error:', error);
        res.status(500).json({ error: error.message });
    }
};


// =====================================================
// SEO ASSET DOMAIN MANAGEMENT (Step 6 & 7)
// =====================================================

// Add domain to SEO Asset
export const addSeoAssetDomain = async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { domain_name, domain_type, url_posted, seo_self_qc_status, qa_status } = req.body;

    try {
        // Validate domain from Backlink Master
        const backlinkCheck = await pool.query(
            'SELECT * FROM backlink_sources WHERE source_url LIKE ? OR source_name = ?',
            [`%${domain_name}%`, domain_name]
        );

        if (backlinkCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Domain must be from Backlink Master' });
        }

        // Calculate approval status based on Self QC Status and QA Status
        // Initial state: Self QC = Pending, QA = empty (not reviewed)
        const selfQc = seo_self_qc_status || 'Pending';
        const qa = qa_status || '';

        let approvalStatus = 'Pending';
        if (selfQc === 'Approved' && qa === 'Pass') {
            approvalStatus = 'Approved';
        } else if (selfQc === 'Rejected' || qa === 'Fail') {
            approvalStatus = 'Rejected';
        }

        const result = await pool.query(
            `INSERT INTO seo_asset_domains (
                seo_asset_id, domain_name, domain_type, url_posted,
                seo_self_qc_status, qa_status, approval_status, display_status,
                backlink_source_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                assetId,
                domain_name,
                domain_type,
                url_posted || '',
                selfQc,
                qa,
                approvalStatus,
                approvalStatus,
                backlinkCheck.rows[0].id,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('Add SEO Asset Domain error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get domains for SEO Asset
export const getSeoAssetDomains = async (req: Request, res: Response) => {
    const { assetId } = req.params;

    try {
        const result = await pool.query(
            `SELECT sad.*, bs.domain_authority
             FROM seo_asset_domains sad
             LEFT JOIN backlink_sources bs ON sad.backlink_source_id = bs.id
             WHERE sad.seo_asset_id = ?
             ORDER BY sad.created_at DESC`,
            [assetId]
        );

        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Update domain details (Step 7 - Popup)
export const updateSeoAssetDomain = async (req: Request, res: Response) => {
    const { assetId, domainId } = req.params;
    const { url_posted, seo_self_qc_status, qa_status } = req.body;

    try {
        // Calculate approval status based on Self QC Status and QA Status
        // Approved: Self QC = Approved AND QA = Pass
        // Rejected: Self QC = Rejected OR QA = Fail
        // Pending: All other cases
        let approvalStatus = 'Pending';
        if (seo_self_qc_status === 'Approved' && qa_status === 'Pass') {
            approvalStatus = 'Approved';
        } else if (seo_self_qc_status === 'Rejected' || qa_status === 'Fail') {
            approvalStatus = 'Rejected';
        }

        const result = await pool.query(
            `UPDATE seo_asset_domains SET
                url_posted = COALESCE(?, url_posted),
                seo_self_qc_status = COALESCE(?, seo_self_qc_status),
                qa_status = COALESCE(?, qa_status),
                approval_status = ?,
                display_status = ?,
                updated_at = ?
            WHERE id = ? AND seo_asset_id = ?`,
            [
                url_posted,
                seo_self_qc_status,
                qa_status,
                approvalStatus,
                new Date().toISOString(),
                domainId,
                assetId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Delete domain from SEO Asset
export const deleteSeoAssetDomain = async (req: Request, res: Response) => {
    const { assetId, domainId } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM seo_asset_domains WHERE id = ? AND seo_asset_id = ? RETURNING id',
            [domainId, assetId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// =====================================================
// MASTER DATA ENDPOINTS FOR SEO ASSET FORM
// =====================================================

// Get existing Asset IDs for Step 1 dropdown
export const getExistingAssetIds = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, asset_name as name, asset_type as type, application_type
             FROM assets
             WHERE status != 'Archived'
             ORDER BY created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Sectors from Master
export const getSectors = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT sector FROM industry_sectors WHERE status = 'active' ORDER BY sector`
        );
        res.status(200).json(result.rows.map((r: any) => r.sector));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Industries from Master
export const getIndustries = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT industry FROM industry_sectors WHERE status = 'active' ORDER BY industry`
        );
        res.status(200).json(result.rows.map((r: any) => r.industry));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Domain Types from Backlink Master
export const getDomainTypes = async (req: Request, res: Response) => {
    try {
        // Return predefined domain types since backlink_sources doesn't have platform_type
        const domainTypes = ['Guest Post', 'Directory', 'Forum', 'Blog Comment', 'Social Bookmark', 'Article Submission', 'Press Release', 'Web 2.0', 'Profile Link', 'Other'];
        res.status(200).json(domainTypes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Domains from Backlink Master
export const getBacklinkDomains = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, source_name as name, source_url as url, domain_authority as da
             FROM backlink_sources
             WHERE status = 'active'
             ORDER BY source_name`
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Asset Types from Master
export const getSeoAssetTypes = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, asset_type as name, dimension, file_formats
             FROM asset_types
             ORDER BY asset_type`
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Version History for an asset (Step 11)
export const getSeoAssetVersionHistory = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT version_history, version_number FROM assets WHERE id = ?',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = result.rows[0];
        const versionHistory = asset.version_history ? JSON.parse(asset.version_history) : [];

        res.status(200).json({
            current_version: asset.version_number,
            history: versionHistory
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

