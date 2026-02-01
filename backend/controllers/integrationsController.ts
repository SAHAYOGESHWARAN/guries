
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// --- Integrations ---
export const getIntegrations = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM integrations ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateIntegration = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { connected, config, health_score, sync_status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE integrations SET 
                connected = COALESCE(?, connected), 
                config = COALESCE(?, config),
                health_score = COALESCE(?, health_score),
                sync_status = COALESCE(?, sync_status),
                last_sync_time = CASE WHEN ? = 'success' THEN datetime('now') ELSE last_sync_time END,
                updated_at = datetime('now')
            WHERE id = ?`,
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
            "INSERT INTO integration_logs (integration_id, event, status, timestamp) VALUES (?, ?, ?, datetime('now'))",
            [id, eventDesc, 'success']
        );

        res.status(200).json(updatedIntegration);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Integration Logs ---
export const getIntegrationLogs = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit || 100;
        const result = await pool.query('SELECT * FROM integration_logs ORDER BY timestamp DESC LIMIT ?', [limit]);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createLog = async (req: Request, res: Response) => {
    const { integration_id, event, status } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO integration_logs (integration_id, event, status, timestamp) VALUES (?, ?, ?, datetime('now'))",
            [integration_id, event, status]
        );
        const newLog = result.rows[0];
        getSocket().emit('log_created', newLog);
        res.status(201).json(newLog);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




