
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// Helper to parse JSON/text fields from content_repository rows
const parseContentRow = (row: any) => {
    const jsonArrayFields = ['linked_service_ids', 'linked_sub_service_ids', 'h2_list', 'h3_list', 'focus_keywords', 'promotion_channels', 'keywords'];
    const jsonObjectFields = ['social_meta', 'ai_qc_report'];
    const parsed = { ...row };
    jsonArrayFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try { parsed[field] = JSON.parse(parsed[field]); } catch (e) { parsed[field] = []; }
        } else if (!parsed[field]) { parsed[field] = []; }
    });
    jsonObjectFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try { parsed[field] = JSON.parse(parsed[field]); } catch (e) { parsed[field] = {}; }
        } else if (!parsed[field]) { parsed[field] = {}; }
    });
    return parsed;
};

export const getContent = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                cr.*,
                s.service_name,
                ss.sub_service_name,
                u.name as assigned_to_name
            FROM content_repository cr
            LEFT JOIN services s ON cr.linked_service_id = s.id
            LEFT JOIN sub_services ss ON cr.linked_sub_service_id = ss.id
            LEFT JOIN users u ON cr.assigned_to_id = u.id
            ORDER BY cr.last_status_update_at DESC
        `);
        const parsed = result.rows.map(parseContentRow);
        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createContent = async (req: Request, res: Response) => {
    const {
        brand_id, content_title_clean, asset_type, status,
        asset_category, asset_format, slug, full_url,
        linked_service_ids, linked_sub_service_ids,
        linked_service_id, linked_sub_service_id,
        h1, h2_list, h3_list, body_content,
        meta_title, meta_description, focus_keywords,
        og_title, og_description, og_image_url,
        social_meta,
        thumbnail_url, context, linked_campaign_id, promotion_channels, campaign_name, assigned_to_id,
        ai_qc_report, content_type, industry, keywords, word_count, qc_score
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO content_repository (
                brand_id, content_title_clean, asset_type, status, 
                asset_category, asset_format, slug, full_url,
                linked_service_ids, linked_sub_service_ids,
                linked_service_id, linked_sub_service_id,
                h1, h2_list, h3_list, body_content,
                meta_title, meta_description, focus_keywords,
                og_title, og_description, og_image_url, social_meta,
                thumbnail_url, context, linked_campaign_id, promotion_channels, campaign_name, assigned_to_id,
                ai_qc_report, content_type, industry, keywords, word_count, qc_score,
                last_status_update_at, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, 
                ?, ?, ?, ?,
                ?, ?,
                ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                datetime('now'), datetime('now'), datetime('now')
            )`,
            [
                brand_id, content_title_clean, asset_type, status || 'idea',
                asset_category, asset_format, slug, full_url,
                JSON.stringify(linked_service_ids || []), JSON.stringify(linked_sub_service_ids || []),
                linked_service_id || null, linked_sub_service_id || null,
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), body_content,
                meta_title, meta_description, JSON.stringify(focus_keywords || []),
                og_title, og_description, og_image_url, JSON.stringify(social_meta || {}),
                thumbnail_url, context, linked_campaign_id, JSON.stringify(promotion_channels || []), campaign_name, assigned_to_id,
                JSON.stringify(ai_qc_report || null), content_type, industry, JSON.stringify(keywords || []), word_count || 0, qc_score || null
            ]
        );
        const newItem = parseContentRow(result.rows[0]);
        getSocket().emit('content_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        console.error('Create content error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateContent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        content_title_clean, status, asset_type,
        asset_category, asset_format, slug, full_url,
        linked_service_ids, linked_sub_service_ids,
        linked_service_id, linked_sub_service_id,
        h1, h2_list, h3_list, body_content,
        meta_title, meta_description, focus_keywords,
        og_title, og_description, og_image_url, social_meta,
        promotion_channels, thumbnail_url, context, campaign_name, assigned_to_id,
        ai_qc_report, content_type, industry, keywords, word_count, qc_score
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE content_repository SET 
                content_title_clean=COALESCE(?, content_title_clean), 
                status=COALESCE(?, status), 
                asset_type=COALESCE(?, asset_type),
                asset_category=COALESCE(?, asset_category),
                asset_format=COALESCE(?, asset_format),
                slug=COALESCE(?, slug),
                full_url=COALESCE(?, full_url),
                linked_service_ids=COALESCE(?, linked_service_ids),
                linked_sub_service_ids=COALESCE(?, linked_sub_service_ids),
                linked_service_id=COALESCE(?, linked_service_id),
                linked_sub_service_id=COALESCE(?, linked_sub_service_id),
                h1=COALESCE(?, h1),
                h2_list=COALESCE(?, h2_list),
                h3_list=COALESCE(?, h3_list),
                body_content=COALESCE(?, body_content),
                meta_title=COALESCE(?, meta_title),
                meta_description=COALESCE(?, meta_description),
                focus_keywords=COALESCE(?, focus_keywords),
                og_title=COALESCE(?, og_title),
                og_description=COALESCE(?, og_description),
                og_image_url=COALESCE(?, og_image_url),
                social_meta=COALESCE(?, social_meta),
                promotion_channels=COALESCE(?, promotion_channels),
                thumbnail_url=COALESCE(?, thumbnail_url),
                context=COALESCE(?, context),
                campaign_name=COALESCE(?, campaign_name),
                assigned_to_id=COALESCE(?, assigned_to_id),
                ai_qc_report=COALESCE(?, ai_qc_report),
                content_type=COALESCE(?, content_type),
                industry=COALESCE(?, industry),
                keywords=COALESCE(?, keywords),
                word_count=COALESCE(?, word_count),
                qc_score=COALESCE(?, qc_score),
                last_status_update_at=datetime('now'),
                updated_at=datetime('now')
            WHERE id=?`,
            [
                content_title_clean, status, asset_type,
                asset_category, asset_format, slug, full_url,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                linked_service_id, linked_sub_service_id,
                h1, h2_list ? JSON.stringify(h2_list) : null, h3_list ? JSON.stringify(h3_list) : null, body_content,
                meta_title, meta_description, focus_keywords ? JSON.stringify(focus_keywords) : null,
                og_title, og_description, og_image_url, social_meta ? JSON.stringify(social_meta) : null,
                promotion_channels ? JSON.stringify(promotion_channels) : null, thumbnail_url, context, campaign_name, assigned_to_id,
                ai_qc_report ? JSON.stringify(ai_qc_report) : null, content_type, industry,
                keywords ? JSON.stringify(keywords) : null, word_count, qc_score,
                id
            ]
        );
        const updatedItem = parseContentRow(result.rows[0]);
        getSocket().emit('content_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteContent = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM content_repository WHERE id = ?', [req.params.id]);
        getSocket().emit('content_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Create Working Copy (Draft) from Service Master
export const createDraftFromService = async (req: Request, res: Response) => {
    const { service_id, campaign_id } = req.body;

    try {
        // 1. Get Service Data
        const serviceResult = await pool.query('SELECT * FROM services WHERE id = ?', [service_id]);
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
                ?, 'service_page', 'draft',
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                datetime('now'), datetime('now'), ?
            )`,
            [
                `Draft: ${service.service_name}`, service.slug, service.full_url, JSON.stringify([service.id]), campaign_id,
                service.h1, service.h2_list, service.h3_list, service.body_content,
                service.meta_title, service.meta_description, service.focus_keywords,
                service.og_title, service.og_description, service.og_image_url, JSON.stringify(service.social_meta || {}),
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
export const publishToService = async (req: Request, res: Response) => {
    const { id } = req.params; // Content ID

    try {
        // 1. Get Content Data
        const contentResult = await pool.query('SELECT * FROM content_repository WHERE id = ?', [id]);
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
                h1=?, h2_list=?, h3_list=?, body_content=?,
                meta_title=?, meta_description=?, focus_keywords=?,
                og_title=?, og_description=?, og_image_url=?, social_meta=?,
                updated_at=datetime('now'), version_number = COALESCE(version_number, 1) + 1
            WHERE id=?`,
            [
                content.h1, content.h2_list, content.h3_list, content.body_content,
                content.meta_title, content.meta_description, content.focus_keywords,
                content.og_title, content.og_description, content.og_image_url, JSON.stringify(content.social_meta || {}),
                serviceId
            ]
        );

        // 3. Update Content Status to Published
        const updateResult = await pool.query(
            `UPDATE content_repository SET status='published', last_status_update_at=datetime('now') WHERE id=?`,
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



