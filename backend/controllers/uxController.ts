
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getUxIssues = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM ux_issues ORDER BY updated_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createUxIssue = async (req: any, res: any) => {
    const { title, description, url, issue_type, device, severity, source, screenshot_url, assigned_to_id, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO ux_issues (
                title, description, url, issue_type, device, severity, source, 
                screenshot_url, assigned_to_id, status, updated_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
            [title, description, url, issue_type, device, severity, source, screenshot_url, assigned_to_id, status]
        );
        const newItem = result.rows[0];
        getSocket().emit('ux_issue_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUxIssue = async (req: any, res: any) => {
    const { id } = req.params;
    const { status, assigned_to_id, severity } = req.body;
    try {
        const result = await pool.query(
            'UPDATE ux_issues SET status=COALESCE($1, status), assigned_to_id=COALESCE($2, assigned_to_id), severity=COALESCE($3, severity), updated_at=NOW() WHERE id=$4 RETURNING *',
            [status, assigned_to_id, severity, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('ux_issue_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUxIssue = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM ux_issues WHERE id = $1', [req.params.id]);
        getSocket().emit('ux_issue_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
