
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getToxicBacklinks = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM toxic_backlinks ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createToxicBacklink = async (req: any, res: any) => {
    const { domain, toxic_url, landing_page, anchor_text, spam_score, dr, type, severity, assigned_to_id, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO toxic_backlinks (
                domain, toxic_url, landing_page, anchor_text, spam_score, dr, type, severity, assigned_to_id, status, updated_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
            [domain, toxic_url, landing_page, anchor_text, spam_score, dr, type, severity, assigned_to_id, status]
        );
        const newItem = result.rows[0];
        getSocket().emit('toxic_backlink_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateToxicBacklink = async (req: any, res: any) => {
    const { id } = req.params;
    const { status, assigned_to_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE toxic_backlinks SET status=COALESCE($1, status), assigned_to_id=COALESCE($2, assigned_to_id), updated_at=NOW() WHERE id=$3 RETURNING *',
            [status, assigned_to_id, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('toxic_backlink_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteToxicBacklink = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM toxic_backlinks WHERE id = $1', [req.params.id]);
        getSocket().emit('toxic_backlink_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
