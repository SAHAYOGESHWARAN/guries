
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT c.*, 
                u.name as owner_name
            FROM campaigns c
            LEFT JOIN users u ON c.campaign_owner_id = u.id
            ORDER BY c.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const getCampaignById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM campaigns WHERE id = ?', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: 'Database error' });
    }
};

export const createCampaign = async (req: Request, res: Response) => {
    const {
        project_id, brand_id, campaign_name, campaign_type, target_url,
        backlinks_planned, campaign_start_date, campaign_end_date, campaign_owner_id,
        status, campaign_status, sub_campaigns, description, linked_service_ids,
        tasks_total, tasks_completed, kpi_score
    } = req.body;

    try {
        const query = `
            INSERT INTO campaigns (
                campaign_name, campaign_type, status, description,
                campaign_start_date, campaign_end_date, campaign_owner_id,
                sub_campaigns, linked_service_ids, target_url,
                project_id, brand_id, backlinks_planned, backlinks_completed,
                tasks_completed, tasks_total, kpi_score, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, datetime('now'), datetime('now'));
        `;
        const values = [
            campaign_name,
            campaign_type || 'Content',
            status || campaign_status || 'planning',
            description || null,
            campaign_start_date || null,
            campaign_end_date || null,
            campaign_owner_id || null,
            sub_campaigns || null,
            linked_service_ids ? JSON.stringify(linked_service_ids) : null,
            target_url || null,
            project_id || null,
            brand_id || null,
            backlinks_planned || 0,
            tasks_completed || 0,
            tasks_total || 0,
            kpi_score || 0
        ];

        const result = await pool.query(query, values);

        // Extract the ID from the result
        const campaignId = result.rows?.[0]?.id || result.lastID;

        if (!campaignId) {
            return res.status(500).json({ error: 'Failed to get campaign ID after creation' });
        }

        // Fetch the created campaign with all fields
        const selectQuery = `SELECT * FROM campaigns WHERE id = ?`;
        const createdCampaign = await pool.query(selectQuery, [campaignId]);

        if (createdCampaign.rows && createdCampaign.rows.length > 0) {
            const campaign = createdCampaign.rows[0];
            console.log('[createCampaign] Returning campaign from SELECT:', campaign);
            getSocket().emit('campaign_created', campaign);
            return res.status(201).json(campaign);
        } else {
            // Fallback: return the data we just inserted with the ID
            const fallbackCampaign = {
                id: campaignId,
                campaign_name,
                campaign_type: campaign_type || 'Content',
                status: status || campaign_status || 'planning',
                description: description || null,
                campaign_start_date: campaign_start_date || null,
                campaign_end_date: campaign_end_date || null,
                campaign_owner_id: campaign_owner_id || null,
                sub_campaigns: sub_campaigns || null,
                linked_service_ids: linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                target_url: target_url || null,
                project_id: project_id || null,
                brand_id: brand_id || null,
                backlinks_planned: backlinks_planned || 0,
                backlinks_completed: 0,
                tasks_completed: tasks_completed || 0,
                tasks_total: tasks_total || 0,
                kpi_score: kpi_score || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            console.log('[createCampaign] Returning fallback campaign:', fallbackCampaign);
            getSocket().emit('campaign_created', fallbackCampaign);
            return res.status(201).json(fallbackCampaign);
        }
    } catch (error: any) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign', details: error.message });
    }
};

export const updateCampaign = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        campaign_name, status, backlinks_completed, kpi_score, linked_service_ids,
        tasks_completed, tasks_total
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE campaigns SET 
                campaign_name = COALESCE(?, campaign_name), 
                status = COALESCE(?, status), 
                backlinks_completed = COALESCE(?, backlinks_completed),
                kpi_score = COALESCE(?, kpi_score),
                linked_service_ids = COALESCE(?, linked_service_ids),
                tasks_completed = COALESCE(?, tasks_completed),
                tasks_total = COALESCE(?, tasks_total)
            WHERE id = ?`,
            [
                campaign_name, status, backlinks_completed, kpi_score,
                JSON.stringify(linked_service_ids), tasks_completed, tasks_total,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const updatedCampaign = result.rows[0];
        getSocket().emit('campaign_updated', updatedCampaign);
        res.status(200).json(updatedCampaign);
    } catch (error: any) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// Pull working copy from Service Master into Campaign
export const pullServiceWorkingCopy = async (req: Request, res: Response) => {
    const { campaignId, serviceId } = req.params;

    try {
        // Get service from master
        const serviceResult = await pool.query('SELECT * FROM services WHERE id = ?', [serviceId]);
        if (serviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const service = serviceResult.rows[0];

        // Create working copy in content_repository (Asset) linked to campaign
        const workingCopy = await pool.query(
            `INSERT INTO content_repository (
                content_title_clean, asset_type, status, slug, full_url,
                linked_service_ids, linked_campaign_id, campaign_name,
                h1, h2_list, h3_list, h4_list, h5_list, body_content,
                internal_links, external_links, image_alt_texts,
                meta_title, meta_description, focus_keywords, secondary_keywords,
                og_title, og_description, og_image_url, twitter_title, twitter_description, twitter_image_url,
                schema_type_id, robots_index, robots_follow, canonical_url,
                created_at, last_status_update_at
            ) VALUES (
                ?, 'service_page', 'draft', ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, datetime('now'), datetime('now')
            )`,
            [
                `Working Copy: ${service.service_name}`,
                service.slug,
                service.full_url,
                JSON.stringify([serviceId]),
                campaignId,
                (await pool.query('SELECT campaign_name FROM campaigns WHERE id = ?', [campaignId])).rows[0]?.campaign_name || '',
                service.h1,
                service.h2_list,
                service.h3_list,
                service.h4_list,
                service.h5_list,
                service.body_content,
                service.internal_links,
                service.external_links,
                service.image_alt_texts,
                service.meta_title,
                service.meta_description,
                service.focus_keywords,
                service.secondary_keywords,
                service.og_title,
                service.og_description,
                service.og_image_url,
                service.twitter_title,
                service.twitter_description,
                service.twitter_image_url,
                service.schema_type_id,
                service.robots_index,
                service.robots_follow,
                service.canonical_url
            ]
        );

        res.status(201).json({
            message: 'Working copy created',
            workingCopy: workingCopy.rows[0],
            sourceService: service
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create working copy' });
    }
};

// Approve and push Campaign changes back to Service Master
export const approveAndUpdateServiceMaster = async (req: Request, res: Response) => {
    const { campaignId, assetId, serviceId } = req.body;

    try {
        // Get working copy (asset) from campaign
        const assetResult = await pool.query(
            'SELECT * FROM content_repository WHERE id = ? AND linked_campaign_id = ?',
            [assetId, campaignId]
        );

        if (assetResult.rows.length === 0) {
            return res.status(404).json({ error: 'Working copy not found in this campaign' });
        }

        const workingCopy = assetResult.rows[0];

        // Verify QC passed (status should be 'qc_passed' or 'published')
        if (!['qc_passed', 'published'].includes(workingCopy.status)) {
            return res.status(400).json({
                error: 'Working copy must pass QC before updating Service Master',
                currentStatus: workingCopy.status
            });
        }

        // Update Service Master with approved content
        const updateResult = await pool.query(
            `UPDATE services SET
                h1 = COALESCE(?, h1),
                h2_list = COALESCE(?, h2_list),
                h3_list = COALESCE(?, h3_list),
                h4_list = COALESCE(?, h4_list),
                h5_list = COALESCE(?, h5_list),
                body_content = COALESCE(?, body_content),
                internal_links = COALESCE(?, internal_links),
                external_links = COALESCE(?, external_links),
                image_alt_texts = COALESCE(?, image_alt_texts),
                meta_title = COALESCE(?, meta_title),
                meta_description = COALESCE(?, meta_description),
                focus_keywords = COALESCE(?, focus_keywords),
                secondary_keywords = COALESCE(?, secondary_keywords),
                og_title = COALESCE(?, og_title),
                og_description = COALESCE(?, og_description),
                og_image_url = COALESCE(?, og_image_url),
                twitter_title = COALESCE(?, twitter_title),
                twitter_description = COALESCE(?, twitter_description),
                twitter_image_url = COALESCE(?, twitter_image_url),
                schema_type_id = COALESCE(?, schema_type_id),
                robots_index = COALESCE(?, robots_index),
                robots_follow = COALESCE(?, robots_follow),
                canonical_url = COALESCE(?, canonical_url),
                word_count = COALESCE(?, word_count),
                reading_time_minutes = COALESCE(?, reading_time_minutes),
                updated_at = datetime('now'),
                version_number = version_number + 1
            WHERE id = ?`,
            [
                workingCopy.h1,
                workingCopy.h2_list,
                workingCopy.h3_list,
                workingCopy.h4_list,
                workingCopy.h5_list,
                workingCopy.body_content,
                workingCopy.internal_links,
                workingCopy.external_links,
                workingCopy.image_alt_texts,
                workingCopy.meta_title,
                workingCopy.meta_description,
                workingCopy.focus_keywords,
                workingCopy.secondary_keywords || '[]',
                workingCopy.og_title,
                workingCopy.og_description,
                workingCopy.og_image_url,
                workingCopy.twitter_title,
                workingCopy.twitter_description,
                workingCopy.twitter_image_url,
                workingCopy.schema_type_id,
                workingCopy.robots_index,
                workingCopy.robots_follow,
                workingCopy.canonical_url,
                workingCopy.word_count || 0,
                workingCopy.reading_time_minutes || 0,
                serviceId
            ]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const updatedService = updateResult.rows[0];

        // Mark working copy as published/merged
        await pool.query(
            'UPDATE content_repository SET status = ? WHERE id = ?',
            ['published', assetId]
        );

        // Emit socket events
        getSocket().emit('service_updated', updatedService);
        getSocket().emit('content_updated', { id: assetId, status: 'published' });

        res.status(200).json({
            message: 'Service Master updated successfully',
            service: updatedService,
            workingCopyId: assetId
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update Service Master' });
    }
};

export const deleteCampaign = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM campaigns WHERE id = ?', [id]);
        getSocket().emit('campaign_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: 'Delete failed' });
    }
};




