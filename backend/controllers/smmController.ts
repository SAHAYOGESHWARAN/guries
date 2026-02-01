
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getSmmPosts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                sp.*,
                s.service_name,
                ss.sub_service_name,
                c.campaign_name,
                u.name as assigned_to_name
            FROM smm_posts sp
            LEFT JOIN services s ON sp.service_id = s.id
            LEFT JOIN sub_services ss ON sp.sub_service_id = ss.id
            LEFT JOIN campaigns c ON sp.campaign_id = c.id
            LEFT JOIN users u ON sp.assigned_to_id = u.id
            ORDER BY sp.schedule_date DESC, sp.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSmmPost = async (req: Request, res: Response) => {
    const {
        title, smm_type, content_type, primary_platform, smm_status,
        schedule_date, schedule_time, caption, hashtags, asset_url, asset_count,
        brand_id, service_id, sub_service_id, campaign_id, keywords, assigned_to_id
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO smm_posts (
                title, smm_type, content_type, primary_platform, smm_status, 
                schedule_date, schedule_time, caption, hashtags, asset_url, asset_count,
                brand_id, service_id, sub_service_id, campaign_id, keywords, assigned_to_id,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                title, smm_type || 'Image Post', content_type, primary_platform || 'LinkedIn',
                smm_status || 'Draft', schedule_date || null, schedule_time || null,
                caption, hashtags || null, asset_url || null, asset_count || 0,
                brand_id || null, service_id || null, sub_service_id || null,
                campaign_id || null, keywords || null, assigned_to_id || null
            ]
        );

        const newPost = result.rows[0];
        getSocket().emit('smm_post_created', newPost);
        res.status(201).json(newPost);
    } catch (error: any) {
        console.error('Create SMM post error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSmmPost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        title, smm_type, content_type, primary_platform, smm_status,
        schedule_date, schedule_time, caption, hashtags, asset_url, asset_count,
        brand_id, service_id, sub_service_id, campaign_id, keywords, assigned_to_id
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE smm_posts SET 
                title = COALESCE(?, title),
                smm_type = COALESCE(?, smm_type),
                content_type = COALESCE(?, content_type),
                primary_platform = COALESCE(?, primary_platform),
                smm_status = COALESCE(?, smm_status), 
                schedule_date = COALESCE(?, schedule_date),
                schedule_time = COALESCE(?, schedule_time),
                caption = COALESCE(?, caption),
                hashtags = COALESCE(?, hashtags),
                asset_url = COALESCE(?, asset_url),
                asset_count = COALESCE(?, asset_count),
                brand_id = COALESCE(?, brand_id),
                service_id = COALESCE(?, service_id),
                sub_service_id = COALESCE(?, sub_service_id),
                campaign_id = COALESCE(?, campaign_id),
                keywords = COALESCE(?, keywords),
                assigned_to_id = COALESCE(?, assigned_to_id),
                updated_at = datetime('now')
            WHERE id = ?`,
            [
                title, smm_type, content_type, primary_platform, smm_status,
                schedule_date, schedule_time, caption, hashtags, asset_url, asset_count,
                brand_id, service_id, sub_service_id, campaign_id, keywords, assigned_to_id, id
            ]
        );

        const updatedPost = result.rows[0];
        getSocket().emit('smm_post_updated', updatedPost);
        res.status(200).json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSmmPost = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM smm_posts WHERE id = ?', [id]);
        getSocket().emit('smm_post_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



