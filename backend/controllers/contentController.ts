
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getContent = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM content_repository ORDER BY last_status_update_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createContent = async (req: any, res: any) => {
    const { 
        brand_id, content_title_clean, asset_type, status, 
        asset_category, asset_format, slug, full_url,
        linked_service_ids, linked_sub_service_ids,
        h1, h2_list, h3_list, body_content,
        meta_title, meta_description, focus_keywords,
        og_title, og_description, og_image_url,
        thumbnail_url, context, linked_campaign_id, promotion_channels, campaign_name, assigned_to_id,
        ai_qc_report
    } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO content_repository (
                brand_id, content_title_clean, asset_type, status, 
                asset_category, asset_format, slug, full_url,
                linked_service_ids, linked_sub_service_ids,
                h1, h2_list, h3_list, body_content,
                meta_title, meta_description, focus_keywords,
                og_title, og_description, og_image_url,
                thumbnail_url, context, linked_campaign_id, promotion_channels, campaign_name, assigned_to_id,
                ai_qc_report,
                last_status_update_at, created_at
            ) VALUES (
                $1, $2, $3, $4, 
                $5, $6, $7, $8,
                $9, $10,
                $11, $12, $13, $14,
                $15, $16, $17,
                $18, $19, $20,
                $21, $22, $23, $24, $25, $26,
                $27,
                NOW(), NOW()
            ) RETURNING *`,
            [
                brand_id, content_title_clean, asset_type, status,
                asset_category, asset_format, slug, full_url,
                JSON.stringify(linked_service_ids || []), JSON.stringify(linked_sub_service_ids || []),
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), body_content,
                meta_title, meta_description, JSON.stringify(focus_keywords || []),
                og_title, og_description, og_image_url,
                thumbnail_url, context, linked_campaign_id, JSON.stringify(promotion_channels || []), campaign_name, assigned_to_id,
                JSON.stringify(ai_qc_report || null)
            ]
        );
        const newItem = result.rows[0];
        getSocket().emit('content_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateContent = async (req: any, res: any) => {
    const { id } = req.params;
    const { 
        content_title_clean, status, asset_type, 
        asset_category, asset_format, slug, full_url,
        linked_service_ids, linked_sub_service_ids,
        h1, h2_list, h3_list, body_content,
        meta_title, meta_description, focus_keywords,
        og_title, og_description, og_image_url,
        promotion_channels, thumbnail_url, context, campaign_name, assigned_to_id,
        ai_qc_report
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE content_repository SET 
                content_title_clean=COALESCE($1, content_title_clean), 
                status=COALESCE($2, status), 
                asset_type=COALESCE($3, asset_type),
                asset_category=COALESCE($4, asset_category),
                asset_format=COALESCE($5, asset_format),
                slug=COALESCE($6, slug),
                full_url=COALESCE($7, full_url),
                linked_service_ids=COALESCE($8, linked_service_ids),
                linked_sub_service_ids=COALESCE($9, linked_sub_service_ids),
                h1=COALESCE($10, h1),
                h2_list=COALESCE($11, h2_list),
                h3_list=COALESCE($12, h3_list),
                body_content=COALESCE($13, body_content),
                meta_title=COALESCE($14, meta_title),
                meta_description=COALESCE($15, meta_description),
                focus_keywords=COALESCE($16, focus_keywords),
                og_title=COALESCE($17, og_title),
                og_description=COALESCE($18, og_description),
                og_image_url=COALESCE($19, og_image_url),
                promotion_channels=COALESCE($20, promotion_channels),
                thumbnail_url=COALESCE($21, thumbnail_url),
                context=COALESCE($22, context),
                campaign_name=COALESCE($23, campaign_name),
                assigned_to_id=COALESCE($24, assigned_to_id),
                ai_qc_report=COALESCE($25, ai_qc_report),
                last_status_update_at=NOW() 
            WHERE id=$26 RETURNING *`,
            [
                content_title_clean, status, asset_type,
                asset_category, asset_format, slug, full_url,
                JSON.stringify(linked_service_ids), JSON.stringify(linked_sub_service_ids),
                h1, JSON.stringify(h2_list), JSON.stringify(h3_list), body_content,
                meta_title, meta_description, JSON.stringify(focus_keywords),
                og_title, og_description, og_image_url,
                JSON.stringify(promotion_channels), thumbnail_url, context, campaign_name, assigned_to_id,
                JSON.stringify(ai_qc_report),
                id
            ]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('content_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteContent = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM content_repository WHERE id = $1', [req.params.id]);
        getSocket().emit('content_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Create Working Copy (Draft) from Service Master
export const createDraftFromService = async (req: any, res: any) => {
    const { service_id, campaign_id } = req.body;
    
    try {
        // 1. Get Service Data
        const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [service_id]);
        if (serviceResult.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
        const service = serviceResult.rows[0];

        // 2. Create Content Draft
        const result = await pool.query(
            `INSERT INTO content_repository (
                content_title_clean, asset_type, status, 
                slug, full_url, linked_service_ids, linked_campaign_id,
                h1, h2_list, h3_list, body_content,
                meta_title, meta_description, focus_keywords,
                og_title, og_description, og_image_url,
                created_at, last_status_update_at, brand_id
            ) VALUES (
                $1, 'service_page', 'draft',
                $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12,
                $13, $14, $15,
                NOW(), NOW(), $16
            ) RETURNING *`,
            [
                `Draft: ${service.service_name}`, service.slug, service.full_url, JSON.stringify([service.id]), campaign_id,
                service.h1, service.h2_list, service.h3_list, service.body_content,
                service.meta_title, service.meta_description, service.focus_keywords,
                service.og_title, service.og_description, service.og_image_url,
                service.brand_id || 1
            ]
        );

        const newItem = result.rows[0];
        getSocket().emit('content_created', newItem);
        res.status(201).json(newItem);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Publish Content Asset to Service Master
export const publishToService = async (req: any, res: any) => {
    const { id } = req.params; // Content ID

    try {
        // 1. Get Content Data
        const contentResult = await pool.query('SELECT * FROM content_repository WHERE id = $1', [id]);
        if (contentResult.rows.length === 0) return res.status(404).json({ error: 'Content not found' });
        const content = contentResult.rows[0];

        const serviceIds = content.linked_service_ids;
        if (!serviceIds || serviceIds.length === 0) {
            return res.status(400).json({ error: 'No linked service found to publish to.' });
        }
        const serviceId = serviceIds[0]; // Publish to primary service

        // 2. Update Service Master
        await pool.query(
            `UPDATE services SET 
                h1=$1, h2_list=$2, h3_list=$3, body_content=$4,
                meta_title=$5, meta_description=$6, focus_keywords=$7,
                og_title=$8, og_description=$9, og_image_url=$10,
                updated_at=NOW(), version_number = COALESCE(version_number, 1) + 1
            WHERE id=$11`,
            [
                content.h1, content.h2_list, content.h3_list, content.body_content,
                content.meta_title, content.meta_description, content.focus_keywords,
                content.og_title, content.og_description, content.og_image_url,
                serviceId
            ]
        );

        // 3. Update Content Status to Published
        const updateResult = await pool.query(
            `UPDATE content_repository SET status='published', last_status_update_at=NOW() WHERE id=$1 RETURNING *`,
            [id]
        );

        const updatedItem = updateResult.rows[0];
        getSocket().emit('content_updated', updatedItem);
        // Ideally trigger service update event too
        
        res.status(200).json({ message: 'Published to Master', content: updatedItem });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
