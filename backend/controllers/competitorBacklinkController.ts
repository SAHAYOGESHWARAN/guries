
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getCompetitorBacklinks = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM competitor_backlinks ORDER BY da DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createCompetitorBacklink = async (req: any, res: any) => {
    const { domain, da, competitor, us, opportunity_score, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO competitor_backlinks (domain, da, competitor, us, opportunity_score, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
            [domain, da, competitor, us, opportunity_score, status || 'Identified']
        );
        const newItem = result.rows[0];
        getSocket().emit('competitor_backlink_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCompetitorBacklink = async (req: any, res: any) => {
    const { id } = req.params;
    const { status, us } = req.body;
    try {
        const result = await pool.query(
            'UPDATE competitor_backlinks SET status=COALESCE($1, status), us=COALESCE($2, us) WHERE id=$3 RETURNING *',
            [status, us, id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('competitor_backlink_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCompetitorBacklink = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM competitor_backlinks WHERE id = $1', [req.params.id]);
        getSocket().emit('competitor_backlink_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
