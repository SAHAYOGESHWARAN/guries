import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getBacklinkSources = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM backlink_sources
            ORDER BY created_at DESC
        `);

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching backlink sources:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createBacklinkSource = async (req: Request, res: Response) => {
    const {
        domain, backlink_url, backlink_category, niche_industry, da_score, spam_score,
        pricing, country, username, password, credentials_notes, status, created_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO backlink_sources (
                domain, backlink_url, backlink_category, niche_industry, da_score, spam_score,
                pricing, country, username, password, credentials_notes, status, created_by,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                domain, backlink_url, backlink_category, niche_industry || null, da_score || 0,
                spam_score || 0, pricing || 'Free', country || null, username || null,
                password || null, credentials_notes || null, status || 'active', created_by || null,
                new Date().toISOString(), new Date().toISOString()
            ]
        );

        const item = result.rows[0];
        getSocket().emit('backlink_source_created', item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Error creating backlink source:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateBacklinkSource = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = fields.map((field, i) => `${field}=$${i + 1}`).join(', ');
        const values = fields.map(field => updates[field]);

        const result = await pool.query(
            `UPDATE backlink_sources SET ${setClause}, updated_at=$${fields.length + 1} WHERE id=$${fields.length + 2}`,
            [...values, new Date().toISOString(), id]
        );

        const item = result.rows[0];
        getSocket().emit('backlink_source_updated', item);
        res.status(200).json(item);
    } catch (error: any) {
        console.error('Error updating backlink source:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteBacklinkSource = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM backlink_sources WHERE id = ?', [req.params.id]);
        getSocket().emit('backlink_source_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting backlink source:', error);
        res.status(500).json({ error: error.message });
    }
};

