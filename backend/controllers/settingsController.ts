
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// Get all system settings
export const getSettings = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM system_settings');
        // Convert array of rows to a simple key-value object for frontend convenience if needed, 
        // or return list. Here we return list.
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Update a specific setting
export const updateSetting = async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value, enabled } = req.body;

    try {
        // Upsert logic
        const result = await pool.query(
            `INSERT INTO system_settings (setting_key, setting_value, is_enabled, updated_at)
             VALUES (?, ?, ?, datetime('now'))
             ON CONFLICT (setting_key) 
             DO UPDATE SET setting_value = EXCLUDED.setting_value, is_enabled = EXCLUDED.is_enabled, updated_at = datetime('now')`,
            [key, value, enabled]
        );
        
        const updatedSetting = result.rows[0];
        getSocket().emit('setting_updated', updatedSetting);
        res.status(200).json(updatedSetting);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Perform system maintenance tasks (Mock)
export const runMaintenance = async (req: Request, res: Response) => {
    const { action } = req.body; // e.g., 'clear_cache', 'reindex_db'
    
    try {
        // In a real app, this would trigger actual DB maintenance or Redis clearing
        console.log(`[System] Running maintenance action: ${action}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work

        res.status(200).json({ status: 'success', message: `Action ${action} completed successfully.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
