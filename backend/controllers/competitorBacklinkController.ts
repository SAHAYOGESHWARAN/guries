
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getCompetitorBacklinks = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM competitor_backlinks ORDER BY da DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createCompetitorBacklink = async (req: Request, res: Response) => {
    const { domain, da, competitor, us, opportunity_score, status } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO competitor_backlinks (domain, da, competitor, us, opportunity_score, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
            [domain, da, competitor, us, opportunity_score, status || 'Identified']
        );
        const newItem = result.rows[0];
        getSocket().emit('competitor_backlink_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCompetitorBacklink = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, us } = req.body;
    try {
        const result = await pool.query(
            'UPDATE competitor_backlinks SET status=COALESCE(?, status), us=COALESCE(?, us) WHERE id=?',
            [status, us, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('competitor_backlink_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCompetitorBacklink = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM competitor_backlinks WHERE id = ?', [req.params.id]);
        getSocket().emit('competitor_backlink_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



