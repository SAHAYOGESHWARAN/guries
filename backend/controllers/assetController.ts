
import { Request, Response } from 'express';
import { pool } from '../config/db';
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
    const { name, type, repository, linked_task, owner_id, usage_status } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO assets (
                name, type, repository, linked_task, owner_id, usage_status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
            [name, type, repository, linked_task, owner_id, usage_status]
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
    const { name, usage_status, linked_task, repository, type } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE assets SET 
                name = COALESCE($1, name), 
                usage_status = COALESCE($2, usage_status), 
                linked_task = COALESCE($3, linked_task),
                repository = COALESCE($4, repository),
                type = COALESCE($5, type)
            WHERE id = $6 RETURNING *`,
            [name, usage_status, linked_task, repository, type, id]
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
