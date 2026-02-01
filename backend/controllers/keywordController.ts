import { Request, Response } from 'express';
import { pool } from '../config/db';
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

// Link keywords to sub-service
export const linkKeywordsToSubService = async (req: Request, res: Response) => {
    const { sub_service_id, sub_service_name, keywords } = req.body;

    if (!sub_service_id || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'sub_service_id and keywords array are required' });
    }

    try {
        for (const keyword of keywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = ?, mapped_sub_service = ?, updated_at = ? WHERE keyword = ?`,
                [sub_service_id, sub_service_name || null, new Date().toISOString(), keyword]
            );
        }

        // Fetch updated keywords
        const result = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ? ORDER BY keyword ASC`,
            [sub_service_id]
        );

        getSocket().emit('keywords_linked_to_subservice', { sub_service_id, keywords: result.rows });
        res.status(200).json({ success: true, linked_keywords: result.rows });
    } catch (error: any) {
        console.error('Error linking keywords to sub-service:', error);
        res.status(500).json({ error: error.message });
    }
};

// Unlink keywords from sub-service
export const unlinkKeywordsFromSubService = async (req: Request, res: Response) => {
    const { sub_service_id, keywords } = req.body;

    if (!sub_service_id || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'sub_service_id and keywords array are required' });
    }

    try {
        for (const keyword of keywords) {
            await pool.query(
                `UPDATE keywords SET mapped_sub_service_id = NULL, mapped_sub_service = NULL, updated_at = ? WHERE keyword = ? AND mapped_sub_service_id = ?`,
                [new Date().toISOString(), keyword, sub_service_id]
            );
        }

        getSocket().emit('keywords_unlinked_from_subservice', { sub_service_id, keywords });
        res.status(200).json({ success: true, message: 'Keywords unlinked from sub-service' });
    } catch (error: any) {
        console.error('Error unlinking keywords from sub-service:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get keywords linked to a sub-service
export const getSubServiceLinkedKeywords = async (req: Request, res: Response) => {
    const { sub_service_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM keywords WHERE mapped_sub_service_id = ? ORDER BY keyword ASC`,
            [sub_service_id]
        );

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching sub-service linked keywords:', error);
        res.status(500).json({ error: error.message });
    }
};


