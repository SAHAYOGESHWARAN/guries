
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getUrlErrors = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM url_errors ORDER BY updated_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createUrlError = async (req: any, res: any) => {
    const { 
        url, error_type, severity, description, 
        service_id, sub_service_id, linked_campaign_id,
        service_name, sub_service_name, 
        assigned_to_id, status 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO url_errors (
                url, error_type, severity, description, 
                service_id, sub_service_id, linked_campaign_id,
                service_name, sub_service_name, 
                assigned_to_id, status, updated_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
            [
                url, error_type, severity, description, 
                service_id || 0, sub_service_id || 0, linked_campaign_id || 0,
                service_name, sub_service_name, 
                assigned_to_id || 0, status
            ]
        );
        
        const newItem = result.rows[0];
        getSocket().emit('url_error_created', newItem); // Real-time trigger
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUrlError = async (req: any, res: any) => {
    const { id } = req.params;
    const { 
        status, assigned_to_id, severity, description, resolution_notes,
        service_id, sub_service_id, linked_campaign_id, service_name, sub_service_name
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE url_errors SET 
                status=COALESCE($1, status), 
                assigned_to_id=COALESCE($2, assigned_to_id), 
                severity=COALESCE($3, severity), 
                description=COALESCE($4, description),
                resolution_notes=COALESCE($5, resolution_notes),
                service_id=COALESCE($6, service_id),
                sub_service_id=COALESCE($7, sub_service_id),
                linked_campaign_id=COALESCE($8, linked_campaign_id),
                service_name=COALESCE($9, service_name),
                sub_service_name=COALESCE($10, sub_service_name),
                updated_at=NOW() 
            WHERE id=$11 RETURNING *`,
            [
                status, assigned_to_id, severity, description, resolution_notes,
                service_id, sub_service_id, linked_campaign_id, service_name, sub_service_name,
                id
            ]
        );
        
        const updatedItem = result.rows[0];
        getSocket().emit('url_error_updated', updatedItem); // Real-time trigger
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUrlError = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM url_errors WHERE id = $1', [req.params.id]);
        getSocket().emit('url_error_deleted', { id: req.params.id }); // Real-time trigger
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
