
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getSubmissions = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM backlink_submissions ORDER BY submitted_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSubmission = async (req: any, res: any) => {
    const { backlink_source_id, target_url, anchor_text_used, content_used, owner_id, submission_status, submitted_at } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO backlink_submissions (backlink_source_id, target_url, anchor_text_used, content_used, owner_id, submission_status, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [backlink_source_id, target_url, anchor_text_used, content_used, owner_id, submission_status, submitted_at || 'Today']
        );
        const newItem = result.rows[0];
        getSocket().emit('submission_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSubmission = async (req: any, res: any) => {
    const { id } = req.params;
    const { target_url, anchor_text_used, content_used, submission_status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE backlink_submissions SET target_url=COALESCE($1, target_url), anchor_text_used=COALESCE($2, anchor_text_used), content_used=COALESCE($3, content_used), submission_status=COALESCE($4, submission_status), submitted_at=NOW() WHERE id=$5 RETURNING *',
            [target_url, anchor_text_used, content_used, submission_status, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('submission_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubmission = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM backlink_submissions WHERE id = $1', [req.params.id]);
        getSocket().emit('submission_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
