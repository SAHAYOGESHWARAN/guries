
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getCampaigns = async (req: any, res: any) => {
    try {
        const result = await pool.query(
            'SELECT * FROM campaigns ORDER BY created_at DESC'
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const getCampaignById = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: 'Database error' });
    }
};

export const createCampaign = async (req: any, res: any) => {
    const { 
        project_id, brand_id, campaign_name, campaign_type, target_url, 
        backlinks_planned, campaign_start_date, campaign_end_date, campaign_owner_id,
        status
    } = req.body;
    
    try {
        const query = `
            INSERT INTO campaigns (
                project_id, brand_id, campaign_name, campaign_type, target_url, 
                backlinks_planned, campaign_start_date, campaign_end_date, campaign_owner_id, status,
                created_at, backlinks_completed, tasks_completed, tasks_total, kpi_score
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 0, 0, 0, 0)
            RETURNING *;
        `;
        const values = [
            project_id, brand_id, campaign_name, campaign_type, target_url, 
            backlinks_planned || 0, campaign_start_date, campaign_end_date, campaign_owner_id, status || 'planning'
        ];
        
        const result = await pool.query(query, values);
        const newCampaign = result.rows[0];
        getSocket().emit('campaign_created', newCampaign);
        res.status(201).json(newCampaign);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

export const updateCampaign = async (req: any, res: any) => {
    const { id } = req.params;
    const { 
        campaign_name, status, backlinks_completed, kpi_score, linked_service_ids,
        tasks_completed, tasks_total
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE campaigns SET 
                campaign_name = COALESCE($1, campaign_name), 
                status = COALESCE($2, status), 
                backlinks_completed = COALESCE($3, backlinks_completed),
                kpi_score = COALESCE($4, kpi_score),
                linked_service_ids = COALESCE($5, linked_service_ids),
                tasks_completed = COALESCE($6, tasks_completed),
                tasks_total = COALESCE($7, tasks_total)
            WHERE id = $8 RETURNING *`,
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
export const pullServiceWorkingCopy = async (req: any, res: any) => {
    const { campaignId, serviceId } = req.params;
    
    try {
        // Get service from master
        const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [serviceId]);
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
                $1, 'service_page', 'draft', $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25,
                $26, $27, $28, $29, NOW(), NOW()
            ) RETURNING *`,
            [
                `Working Copy: ${service.service_name}`,
                service.slug,
                service.full_url,
                JSON.stringify([serviceId]),
                campaignId,
                (await pool.query('SELECT campaign_name FROM campaigns WHERE id = $1', [campaignId])).rows[0]?.campaign_name || '',
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
export const approveAndUpdateServiceMaster = async (req: any, res: any) => {
    const { campaignId, assetId, serviceId } = req.body;
    
    try {
        // Get working copy (asset) from campaign
        const assetResult = await pool.query(
            'SELECT * FROM content_repository WHERE id = $1 AND linked_campaign_id = $2',
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
                h1 = COALESCE($1, h1),
                h2_list = COALESCE($2, h2_list),
                h3_list = COALESCE($3, h3_list),
                h4_list = COALESCE($4, h4_list),
                h5_list = COALESCE($5, h5_list),
                body_content = COALESCE($6, body_content),
                internal_links = COALESCE($7, internal_links),
                external_links = COALESCE($8, external_links),
                image_alt_texts = COALESCE($9, image_alt_texts),
                meta_title = COALESCE($10, meta_title),
                meta_description = COALESCE($11, meta_description),
                focus_keywords = COALESCE($12, focus_keywords),
                secondary_keywords = COALESCE($13, secondary_keywords),
                og_title = COALESCE($14, og_title),
                og_description = COALESCE($15, og_description),
                og_image_url = COALESCE($16, og_image_url),
                twitter_title = COALESCE($17, twitter_title),
                twitter_description = COALESCE($18, twitter_description),
                twitter_image_url = COALESCE($19, twitter_image_url),
                schema_type_id = COALESCE($20, schema_type_id),
                robots_index = COALESCE($21, robots_index),
                robots_follow = COALESCE($22, robots_follow),
                canonical_url = COALESCE($23, canonical_url),
                word_count = COALESCE($24, word_count),
                reading_time_minutes = COALESCE($25, reading_time_minutes),
                updated_at = NOW(),
                version_number = version_number + 1
            WHERE id = $26 RETURNING *`,
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
            'UPDATE content_repository SET status = $1 WHERE id = $2',
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

export const deleteCampaign = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
        getSocket().emit('campaign_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: 'Delete failed' });
    }
};
