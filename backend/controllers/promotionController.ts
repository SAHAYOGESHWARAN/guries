import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getPromotionItems = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                pi.*,
                c.campaign_name,
                s.service_name,
                u.name as created_by_name
            FROM promotion_items pi
            LEFT JOIN campaigns c ON pi.campaign_id = c.id
            LEFT JOIN services s ON pi.service_id = s.id
            LEFT JOIN users u ON pi.created_by = u.id
            ORDER BY pi.created_at DESC
        `);

        // Parse promotion_types JSON for each item
        const items = result.rows.map((item: any) => ({
            ...item,
            promotion_types: item.promotion_types ? JSON.parse(item.promotion_types) : [],
            keywords: item.keywords ? JSON.parse(item.keywords) : []
        }));

        res.status(200).json(items);
    } catch (error: any) {
        console.error('Error fetching promotion items:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createPromotionItem = async (req: any, res: any) => {
    const {
        title,
        subtitle,
        content_type,
        promotion_types,
        campaign_id,
        service_id,
        keywords,
        thumbnail_url,
        full_url,
        qc_status,
        published_date,
        created_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO promotion_items (
                title, subtitle, content_type, promotion_types, campaign_id, service_id,
                keywords, thumbnail_url, full_url, qc_status, published_date, created_by,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                title,
                subtitle || null,
                content_type || 'Blog',
                JSON.stringify(promotion_types || []),
                campaign_id || null,
                service_id || null,
                JSON.stringify(keywords || []),
                thumbnail_url || null,
                full_url || null,
                qc_status || 'QC Pending',
                published_date || null,
                created_by || null,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                pi.*,
                c.campaign_name,
                s.service_name,
                u.name as created_by_name
            FROM promotion_items pi
            LEFT JOIN campaigns c ON pi.campaign_id = c.id
            LEFT JOIN services s ON pi.service_id = s.id
            LEFT JOIN users u ON pi.created_by = u.id
            WHERE pi.id = $1
        `, [result.rows[0].id]);

        const item = {
            ...newItem.rows[0],
            promotion_types: newItem.rows[0].promotion_types ? JSON.parse(newItem.rows[0].promotion_types) : [],
            keywords: newItem.rows[0].keywords ? JSON.parse(newItem.rows[0].keywords) : []
        };

        getSocket().emit('promotion_item_created', item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Error creating promotion item:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updatePromotionItem = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        title,
        subtitle,
        content_type,
        promotion_types,
        campaign_id,
        service_id,
        keywords,
        thumbnail_url,
        full_url,
        qc_status,
        published_date
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE promotion_items SET
                title=COALESCE($1, title),
                subtitle=COALESCE($2, subtitle),
                content_type=COALESCE($3, content_type),
                promotion_types=COALESCE($4, promotion_types),
                campaign_id=COALESCE($5, campaign_id),
                service_id=COALESCE($6, service_id),
                keywords=COALESCE($7, keywords),
                thumbnail_url=COALESCE($8, thumbnail_url),
                full_url=COALESCE($9, full_url),
                qc_status=COALESCE($10, qc_status),
                published_date=COALESCE($11, published_date),
                updated_at=$12
            WHERE id=$13 RETURNING *`,
            [
                title,
                subtitle,
                content_type,
                promotion_types ? JSON.stringify(promotion_types) : null,
                campaign_id,
                service_id,
                keywords ? JSON.stringify(keywords) : null,
                thumbnail_url,
                full_url,
                qc_status,
                published_date,
                new Date().toISOString(),
                id
            ]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                pi.*,
                c.campaign_name,
                s.service_name,
                u.name as created_by_name
            FROM promotion_items pi
            LEFT JOIN campaigns c ON pi.campaign_id = c.id
            LEFT JOIN services s ON pi.service_id = s.id
            LEFT JOIN users u ON pi.created_by = u.id
            WHERE pi.id = $1
        `, [id]);

        const item = {
            ...updatedItem.rows[0],
            promotion_types: updatedItem.rows[0].promotion_types ? JSON.parse(updatedItem.rows[0].promotion_types) : [],
            keywords: updatedItem.rows[0].keywords ? JSON.parse(updatedItem.rows[0].keywords) : []
        };

        getSocket().emit('promotion_item_updated', item);
        res.status(200).json(item);
    } catch (error: any) {
        console.error('Error updating promotion item:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deletePromotionItem = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM promotion_items WHERE id = $1', [req.params.id]);
        getSocket().emit('promotion_item_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting promotion item:', error);
        res.status(500).json({ error: error.message });
    }
};
