import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getUxIssues = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                ui.*,
                u.name as assigned_to_name,
                s.service_name
            FROM ux_issues ui
            LEFT JOIN users u ON ui.assigned_to_id = u.id
            LEFT JOIN services s ON ui.service_id = s.id
            ORDER BY 
                CASE ui.severity 
                    WHEN 'Critical' THEN 1 
                    WHEN 'High' THEN 2 
                    WHEN 'Medium' THEN 3 
                    WHEN 'Low' THEN 4 
                    ELSE 5 
                END,
                ui.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching UX issues:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createUxIssue = async (req: Request, res: Response) => {
    const {
        title,
        description,
        url,
        issue_type,
        device,
        severity,
        source,
        screenshot_url,
        assigned_to_id,
        service_id,
        status,
        resolution_notes,
        priority_score
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO ux_issues (
                title, issue_title, description, url, issue_type, device, severity, source, 
                screenshot_url, assigned_to_id, service_id, status, resolution_notes, priority_score,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                title, // Also populate issue_title for backward compatibility
                description || null,
                url,
                issue_type || 'Manual Report',
                device || 'Desktop',
                severity || 'Medium',
                source || 'Manual Report',
                screenshot_url || null,
                assigned_to_id || null,
                service_id || null,
                status || 'Pending',
                resolution_notes || null,
                priority_score || null,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                ui.*,
                u.name as assigned_to_name,
                s.service_name
            FROM ux_issues ui
            LEFT JOIN users u ON ui.assigned_to_id = u.id
            LEFT JOIN services s ON ui.service_id = s.id
            WHERE ui.id = ?
        `, [result.rows[0].id]);

        getSocket().emit('ux_issue_created', newItem.rows[0]);
        res.status(201).json(newItem.rows[0]);
    } catch (error: any) {
        console.error('Error creating UX issue:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateUxIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        title,
        description,
        url,
        issue_type,
        device,
        severity,
        source,
        screenshot_url,
        assigned_to_id,
        service_id,
        status,
        resolution_notes,
        priority_score
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE ux_issues SET 
                title=COALESCE(?, title),
                description=COALESCE(?, description),
                url=COALESCE(?, url),
                issue_type=COALESCE(?, issue_type),
                device=COALESCE(?, device),
                severity=COALESCE(?, severity),
                source=COALESCE(?, source),
                screenshot_url=COALESCE(?, screenshot_url),
                assigned_to_id=COALESCE(?, assigned_to_id),
                service_id=COALESCE(?, service_id),
                status=COALESCE(?, status),
                resolution_notes=COALESCE(?, resolution_notes),
                priority_score=COALESCE(?, priority_score),
                updated_at=?
            WHERE id=?`,
            [
                title,
                description,
                url,
                issue_type,
                device,
                severity,
                source,
                screenshot_url,
                assigned_to_id,
                service_id,
                status,
                resolution_notes,
                priority_score,
                new Date().toISOString(),
                id
            ]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                ui.*,
                u.name as assigned_to_name,
                s.service_name
            FROM ux_issues ui
            LEFT JOIN users u ON ui.assigned_to_id = u.id
            LEFT JOIN services s ON ui.service_id = s.id
            WHERE ui.id = ?
        `, [id]);

        getSocket().emit('ux_issue_updated', updatedItem.rows[0]);
        res.status(200).json(updatedItem.rows[0]);
    } catch (error: any) {
        console.error('Error updating UX issue:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteUxIssue = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM ux_issues WHERE id = ?', [req.params.id]);
        getSocket().emit('ux_issue_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting UX issue:', error);
        res.status(500).json({ error: error.message });
    }
};

