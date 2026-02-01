
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getUrlErrors = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM url_errors ORDER BY updated_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createUrlError = async (req: Request, res: Response) => {
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
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

export const updateUrlError = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { 
        status, assigned_to_id, severity, description, resolution_notes,
        service_id, sub_service_id, linked_campaign_id, service_name, sub_service_name
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE url_errors SET 
                status=COALESCE(?, status), 
                assigned_to_id=COALESCE(?, assigned_to_id), 
                severity=COALESCE(?, severity), 
                description=COALESCE(?, description),
                resolution_notes=COALESCE(?, resolution_notes),
                service_id=COALESCE(?, service_id),
                sub_service_id=COALESCE(?, sub_service_id),
                linked_campaign_id=COALESCE(?, linked_campaign_id),
                service_name=COALESCE(?, service_name),
                sub_service_name=COALESCE(?, sub_service_name),
                updated_at=datetime('now') 
            WHERE id=?`,
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

export const deleteUrlError = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM url_errors WHERE id = ?', [req.params.id]);
        getSocket().emit('url_error_deleted', { id: req.params.id }); // Real-time trigger
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




