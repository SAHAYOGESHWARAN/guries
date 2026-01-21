
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getGraphicAssets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM graphic_assets ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createGraphicAsset = async (req: Request, res: Response) => {
    const { brand_id, graphic_type, platform, status, due_at, designer_owner_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO graphic_assets (
                brand_id, graphic_type, platform, status, due_at, designer_owner_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [brand_id, graphic_type, platform, status || 'requested', due_at, designer_owner_id]
        );
        const newItem = result.rows[0];
        getSocket().emit('graphic_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateGraphicAsset = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, designer_owner_id, due_at, graphic_type, platform } = req.body;
    try {
        const result = await pool.query(
            `UPDATE graphic_assets SET 
                status=COALESCE(?, status), 
                designer_owner_id=COALESCE(?, designer_owner_id), 
                due_at=COALESCE(?, due_at),
                graphic_type=COALESCE(?, graphic_type),
                platform=COALESCE(?, platform)
            WHERE id=?`,
            [status, designer_owner_id, due_at, graphic_type, platform, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('graphic_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteGraphicAsset = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM graphic_assets WHERE id = ?', [req.params.id]);
        getSocket().emit('graphic_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



