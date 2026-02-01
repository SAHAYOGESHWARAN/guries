import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getForms = async (_req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM forms ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createForm = async (req: Request, res: Response) => {
    const { form_name, form_type, data_source, target_url, status, owner_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO forms (form_name, form_type, data_source, target_url, status, owner_id)
             VALUES (?, ?, ?, ?, COALESCE(?, 'Active'), ?)`,
            [form_name, form_type, data_source, target_url, status, owner_id]
        );
        const newItem = result.rows[0];
        getSocket().emit('form_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateForm = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { form_name, form_type, data_source, target_url, status, owner_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE forms SET
                form_name = COALESCE(?, form_name),
                form_type = COALESCE(?, form_type),
                data_source = COALESCE(?, data_source),
                target_url = COALESCE(?, target_url),
                status = COALESCE(?, status),
                owner_id = COALESCE(?, owner_id),
                updated_at = datetime('now')
             WHERE id = ?`,
            [form_name, form_type, data_source, target_url, status, owner_id, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('form_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteForm = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM forms WHERE id = ?', [req.params.id]);
        getSocket().emit('form_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




