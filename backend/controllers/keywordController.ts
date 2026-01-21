import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getKeywords = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM keywords
            ORDER BY created_at DESC
        `);

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching keywords:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createKeyword = async (req: Request, res: Response) => {
    const {
        keyword, keyword_intent, keyword_type, language, search_volume,
        competition_score, mapped_service_id, mapped_service, mapped_sub_service_id,
        mapped_sub_service, status, created_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO keywords (
                keyword, keyword_intent, keyword_type, language, search_volume,
                competition_score, mapped_service_id, mapped_service, mapped_sub_service_id,
                mapped_sub_service, status, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                keyword, keyword_intent, keyword_type, language || 'English', search_volume || 0,
                competition_score || 'Medium', mapped_service_id || null, mapped_service || null,
                mapped_sub_service_id || null, mapped_sub_service || null, status || 'active',
                created_by || null, new Date().toISOString(), new Date().toISOString()
            ]
        );

        const item = result.rows[0];
        getSocket().emit('keyword_created', item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Error creating keyword:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateKeyword = async (req: Request, res: Response) => {
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
            `UPDATE keywords SET ${setClause}, updated_at=$${fields.length + 1} WHERE id=$${fields.length + 2}`,
            [...values, new Date().toISOString(), id]
        );

        const item = result.rows[0];
        getSocket().emit('keyword_updated', item);
        res.status(200).json(item);
    } catch (error: any) {
        console.error('Error updating keyword:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteKeyword = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM keywords WHERE id = ?', [req.params.id]);
        getSocket().emit('keyword_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting keyword:', error);
        res.status(500).json({ error: error.message });
    }
};

