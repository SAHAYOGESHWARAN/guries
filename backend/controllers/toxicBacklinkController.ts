import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getToxicBacklinks = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                tb.*,
                u.name as assigned_to_name,
                s.service_name
            FROM toxic_backlinks tb
            LEFT JOIN users u ON tb.assigned_to_id = u.id
            LEFT JOIN services s ON tb.service_id = s.id
            ORDER BY 
                CASE tb.severity 
                    WHEN 'Critical' THEN 1 
                    WHEN 'High' THEN 2 
                    WHEN 'Medium' THEN 3 
                    WHEN 'Low' THEN 4 
                    ELSE 5 
                END,
                tb.spam_score DESC,
                tb.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching toxic backlinks:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createToxicBacklink = async (req: any, res: any) => {
    const {
        domain,
        toxic_url,
        landing_page,
        anchor_text,
        spam_score,
        dr,
        dr_type,
        severity,
        status,
        assigned_to_id,
        service_id,
        notes
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO toxic_backlinks (
                domain, toxic_url, backlink_url, landing_page, anchor_text, spam_score, 
                dr, dr_type, severity, status, assigned_to_id, service_id, notes,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [
                domain,
                toxic_url,
                toxic_url, // Also populate backlink_url for backward compatibility
                landing_page || null,
                anchor_text,
                spam_score || 0,
                dr || null,
                dr_type || null,
                severity || 'Medium',
                status || 'Pending',
                assigned_to_id || null,
                service_id || null,
                notes || null,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                tb.*,
                u.name as assigned_to_name,
                s.service_name
            FROM toxic_backlinks tb
            LEFT JOIN users u ON tb.assigned_to_id = u.id
            LEFT JOIN services s ON tb.service_id = s.id
            WHERE tb.id = $1
        `, [result.rows[0].id]);

        getSocket().emit('toxic_backlink_created', newItem.rows[0]);
        res.status(201).json(newItem.rows[0]);
    } catch (error: any) {
        console.error('Error creating toxic backlink:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateToxicBacklink = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        domain,
        toxic_url,
        landing_page,
        anchor_text,
        spam_score,
        dr,
        dr_type,
        severity,
        status,
        assigned_to_id,
        service_id,
        notes,
        disavow_date
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE toxic_backlinks SET 
                domain=COALESCE($1, domain),
                toxic_url=COALESCE($2, toxic_url),
                landing_page=COALESCE($3, landing_page),
                anchor_text=COALESCE($4, anchor_text),
                spam_score=COALESCE($5, spam_score),
                dr=COALESCE($6, dr),
                dr_type=COALESCE($7, dr_type),
                severity=COALESCE($8, severity),
                status=COALESCE($9, status), 
                assigned_to_id=COALESCE($10, assigned_to_id),
                service_id=COALESCE($11, service_id),
                notes=COALESCE($12, notes),
                disavow_date=COALESCE($13, disavow_date),
                updated_at=$14
            WHERE id=$15 RETURNING *`,
            [
                domain,
                toxic_url,
                landing_page,
                anchor_text,
                spam_score,
                dr,
                dr_type,
                severity,
                status,
                assigned_to_id,
                service_id,
                notes,
                disavow_date,
                new Date().toISOString(),
                id
            ]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                tb.*,
                u.name as assigned_to_name,
                s.service_name
            FROM toxic_backlinks tb
            LEFT JOIN users u ON tb.assigned_to_id = u.id
            LEFT JOIN services s ON tb.service_id = s.id
            WHERE tb.id = $1
        `, [id]);

        getSocket().emit('toxic_backlink_updated', updatedItem.rows[0]);
        res.status(200).json(updatedItem.rows[0]);
    } catch (error: any) {
        console.error('Error updating toxic backlink:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteToxicBacklink = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM toxic_backlinks WHERE id = $1', [req.params.id]);
        getSocket().emit('toxic_backlink_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting toxic backlink:', error);
        res.status(500).json({ error: error.message });
    }
};
