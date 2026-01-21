import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// --- On-page SEO Audits ---
export const getOnPageSeoAudits = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.*,
                s.service_name,
                ss.sub_service_name,
                u.name as assigned_to_name
            FROM on_page_seo_audits a
            LEFT JOIN services s ON a.service_id = s.id
            LEFT JOIN sub_services ss ON a.sub_service_id = ss.id
            LEFT JOIN users u ON a.assigned_to_id = u.id
            ORDER BY 
                CASE a.severity 
                    WHEN 'Critical' THEN 1 
                    WHEN 'High' THEN 2 
                    WHEN 'Medium' THEN 3 
                    WHEN 'Low' THEN 4 
                END,
                a.updated_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createOnPageSeoAudit = async (req: Request, res: Response) => {
    const {
        url, service_id, sub_service_id, error_type, error_category, severity,
        issue_description, current_value, recommended_value, linked_campaign_id,
        status, assigned_to_id, created_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO on_page_seo_audits (
                url, service_id, sub_service_id, error_type, error_category, severity,
                issue_description, current_value, recommended_value, linked_campaign_id,
                status, assigned_to_id, created_by, detected_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
            [
                url || null, service_id || null, sub_service_id || null, error_type, error_category, severity || 'Medium',
                issue_description, current_value || null, recommended_value || null, linked_campaign_id || null,
                status || 'Open', assigned_to_id || null, created_by || null
            ]
        );
        const newItem = result.rows[0];
        getSocket().emit('on_page_seo_audit_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOnPageSeoAudit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        url, service_id, sub_service_id, error_type, error_category, severity,
        issue_description, current_value, recommended_value, linked_campaign_id,
        status, assigned_to_id, resolution_notes
    } = req.body;

    try {
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (url !== undefined) { updateFields.push(`url=$${paramIndex++}`); values.push(url); }
        if (service_id !== undefined) { updateFields.push(`service_id=$${paramIndex++}`); values.push(service_id); }
        if (sub_service_id !== undefined) { updateFields.push(`sub_service_id=$${paramIndex++}`); values.push(sub_service_id); }
        if (error_type !== undefined) { updateFields.push(`error_type=$${paramIndex++}`); values.push(error_type); }
        if (error_category !== undefined) { updateFields.push(`error_category=$${paramIndex++}`); values.push(error_category); }
        if (severity !== undefined) { updateFields.push(`severity=$${paramIndex++}`); values.push(severity); }
        if (issue_description !== undefined) { updateFields.push(`issue_description=$${paramIndex++}`); values.push(issue_description); }
        if (current_value !== undefined) { updateFields.push(`current_value=$${paramIndex++}`); values.push(current_value); }
        if (recommended_value !== undefined) { updateFields.push(`recommended_value=$${paramIndex++}`); values.push(recommended_value); }
        if (linked_campaign_id !== undefined) { updateFields.push(`linked_campaign_id=$${paramIndex++}`); values.push(linked_campaign_id); }
        if (assigned_to_id !== undefined) { updateFields.push(`assigned_to_id=$${paramIndex++}`); values.push(assigned_to_id); }
        if (status !== undefined) {
            updateFields.push(`status=$${paramIndex++}`);
            values.push(status);
            if (status === 'Resolved') {
                updateFields.push(`resolved_at=datetime('now')`);
            }
        }
        if (resolution_notes !== undefined) { updateFields.push(`resolution_notes=$${paramIndex++}`); values.push(resolution_notes); }

        updateFields.push(`updated_at=datetime('now')`);
        values.push(id);

        const result = await pool.query(
            `UPDATE on_page_seo_audits SET ${updateFields.join(', ')} WHERE id=$${paramIndex}`,
            values
        );
        const updatedItem = result.rows[0];
        getSocket().emit('on_page_seo_audit_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteOnPageSeoAudit = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM on_page_seo_audits WHERE id = ?', [req.params.id]);
        getSocket().emit('on_page_seo_audit_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get audits for a specific service
export const getAuditsByService = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        const result = await pool.query(
            `SELECT a.*, s.service_name, ss.sub_service_name, u.name as assigned_to_name
             FROM on_page_seo_audits a
             LEFT JOIN services s ON a.service_id = s.id
             LEFT JOIN sub_services ss ON a.sub_service_id = ss.id
             LEFT JOIN users u ON a.assigned_to_id = u.id
             WHERE a.service_id = ? ORDER BY a.detected_at DESC`,
            [serviceId]
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get audits for a specific sub-service
export const getAuditsBySubService = async (req: Request, res: Response) => {
    try {
        const { subServiceId } = req.params;
        const result = await pool.query(
            `SELECT a.*, s.service_name, ss.sub_service_name, u.name as assigned_to_name
             FROM on_page_seo_audits a
             LEFT JOIN services s ON a.service_id = s.id
             LEFT JOIN sub_services ss ON a.sub_service_id = ss.id
             LEFT JOIN users u ON a.assigned_to_id = u.id
             WHERE a.sub_service_id = ? ORDER BY a.detected_at DESC`,
            [subServiceId]
        );
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



