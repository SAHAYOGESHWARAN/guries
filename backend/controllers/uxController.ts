import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getUxIssues = async (req: any, res: any) => {
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

export const createUxIssue = async (req: any, res: any) => {
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
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
            WHERE ui.id = $1
        `, [result.rows[0].id]);

        getSocket().emit('ux_issue_created', newItem.rows[0]);
        res.status(201).json(newItem.rows[0]);
    } catch (error: any) {
        console.error('Error creating UX issue:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateUxIssue = async (req: any, res: any) => {
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
                title=COALESCE($1, title),
                description=COALESCE($2, description),
                url=COALESCE($3, url),
                issue_type=COALESCE($4, issue_type),
                device=COALESCE($5, device),
                severity=COALESCE($6, severity),
                source=COALESCE($7, source),
                screenshot_url=COALESCE($8, screenshot_url),
                assigned_to_id=COALESCE($9, assigned_to_id),
                service_id=COALESCE($10, service_id),
                status=COALESCE($11, status),
                resolution_notes=COALESCE($12, resolution_notes),
                priority_score=COALESCE($13, priority_score),
                updated_at=$14
            WHERE id=$15 RETURNING *`,
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
            WHERE ui.id = $1
        `, [id]);

        getSocket().emit('ux_issue_updated', updatedItem.rows[0]);
        res.status(200).json(updatedItem.rows[0]);
    } catch (error: any) {
        console.error('Error updating UX issue:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteUxIssue = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM ux_issues WHERE id = $1', [req.params.id]);
        getSocket().emit('ux_issue_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting UX issue:', error);
        res.status(500).json({ error: error.message });
    }
};
