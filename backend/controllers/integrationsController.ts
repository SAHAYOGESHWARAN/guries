
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// --- Integrations ---
export const getIntegrations = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM integrations ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateIntegration = async (req: any, res: any) => {
    const { id } = req.params;
    const { connected, config, health_score, sync_status } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE integrations SET 
                connected = COALESCE($1, connected), 
                config = COALESCE($2, config),
                health_score = COALESCE($3, health_score),
                sync_status = COALESCE($4, sync_status),
                last_sync_time = CASE WHEN $4 = 'success' THEN NOW() ELSE last_sync_time END,
                updated_at = NOW()
            WHERE id = $5 RETURNING *`,
            [connected, config, health_score, sync_status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        const updatedIntegration = result.rows[0];
        getSocket().emit('integration_updated', updatedIntegration);
        
        // Log the event
        const statusLog = connected ? 'Connected' : 'Disconnected';
        const eventDesc = sync_status ? `Sync Status: ${sync_status}` : `Connection updated: ${statusLog}`;
        
        await pool.query(
            'INSERT INTO integration_logs (integration_id, event, status, timestamp) VALUES ($1, $2, $3, NOW())',
            [id, eventDesc, 'success']
        );

        res.status(200).json(updatedIntegration);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Integration Logs ---
export const getIntegrationLogs = async (req: any, res: any) => {
    try {
        const limit = req.query.limit || 100;
        const result = await pool.query('SELECT * FROM integration_logs ORDER BY timestamp DESC LIMIT $1', [limit]);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createLog = async (req: any, res: any) => {
    const { integration_id, event, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO integration_logs (integration_id, event, status, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [integration_id, event, status]
        );
        const newLog = result.rows[0];
        getSocket().emit('log_created', newLog);
        res.status(201).json(newLog);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
