
import { Request, Response } from 'express';
import { pool } from '../config/db';

// --- Keywords ---
export const getKeywords = async (req: any, res: any) => {
    try {
        const query = `
            SELECT k.*,
            (
                (SELECT COUNT(*) FROM services s WHERE COALESCE(s.focus_keywords, '[]')::jsonb ? k.keyword) +
                (SELECT COUNT(*) FROM sub_services ss WHERE COALESCE(ss.focus_keywords, '[]')::jsonb ? k.keyword) +
                (SELECT COUNT(*) FROM content_repository c WHERE COALESCE(c.focus_keywords, '[]')::jsonb ? k.keyword)
            ) as usage_count
            FROM keywords k
            ORDER BY k.id DESC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createKeyword = async (req: any, res: any) => {
    const { keyword, intent, keyword_type, search_volume, competition, mapped_service } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO keywords (keyword, intent, keyword_type, search_volume, competition, mapped_service) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [keyword, intent, keyword_type, search_volume, competition, mapped_service]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateKeyword = async (req: any, res: any) => {
    const { id } = req.params;
    const { keyword, intent, keyword_type, search_volume, competition, mapped_service } = req.body;
    try {
        const result = await pool.query(
            'UPDATE keywords SET keyword=$1, intent=$2, keyword_type=$3, search_volume=$4, competition=$5, mapped_service=$6 WHERE id=$7 RETURNING *',
            [keyword, intent, keyword_type, search_volume, competition, mapped_service, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteKeyword = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM keywords WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Backlinks ---
export const getBacklinks = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM backlinks ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createBacklink = async (req: any, res: any) => {
    const { domain, platform_type, da_score, spam_score, country, pricing, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO backlinks (domain, platform_type, da_score, spam_score, country, pricing, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [domain, platform_type, da_score, spam_score, country, pricing, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBacklink = async (req: any, res: any) => {
    const { id } = req.params;
    const { domain, platform_type, da_score, spam_score, country, pricing, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE backlinks SET domain=$1, platform_type=$2, da_score=$3, spam_score=$4, country=$5, pricing=$6, status=$7 WHERE id=$8 RETURNING *',
            [domain, platform_type, da_score, spam_score, country, pricing, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBacklink = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM backlinks WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
