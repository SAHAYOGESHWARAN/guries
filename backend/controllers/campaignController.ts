
import { Request, Response } from 'express';
import { pool } from '../config/db';
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
