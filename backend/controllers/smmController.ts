
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getSmmPosts = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM smm_posts ORDER BY created_at DESC'); 
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSmmPost = async (req: any, res: any) => {
    const { 
        brand_id, title, smm_type, primary_platform, smm_status, 
        schedule_date, caption, assets_summary, service_name, 
        sub_service_name, assigned_to_id, assigned_to_name 
    } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO smm_posts (
                brand_id, title, smm_type, primary_platform, smm_status, 
                schedule_date, caption, assets_summary, service_name, 
                sub_service_name, assigned_to_id, assigned_to_name, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
            [
                brand_id, title, smm_type, primary_platform, smm_status, 
                schedule_date, caption, assets_summary, service_name, 
                sub_service_name, assigned_to_id, assigned_to_name
            ]
        );
        
        const newPost = result.rows[0];
        getSocket().emit('smm_post_created', newPost);
        res.status(201).json(newPost);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSmmPost = async (req: any, res: any) => {
    const { id } = req.params;
    const { smm_status, caption, schedule_date, assets_summary } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE smm_posts SET 
                smm_status = COALESCE($1, smm_status), 
                caption = COALESCE($2, caption), 
                schedule_date = COALESCE($3, schedule_date),
                assets_summary = COALESCE($4, assets_summary)
            WHERE id = $5 RETURNING *`,
            [smm_status, caption, schedule_date, assets_summary, id]
        );
        
        const updatedPost = result.rows[0];
        getSocket().emit('smm_post_updated', updatedPost);
        res.status(200).json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSmmPost = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM smm_posts WHERE id = $1', [id]);
        getSocket().emit('smm_post_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
